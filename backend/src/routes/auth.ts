import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { registerSchema, loginSchema } from '../utils/validators';
import { ConflictError, UnauthorizedError } from '../utils/errors';

const router = Router();

function signToken(payload: { userId: string; tenantId: string; role: string }) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const input = registerSchema.parse(req.body);

    const existing = await prisma.tenant.findUnique({ where: { phone: input.phone } });
    if (existing) throw new ConflictError('A tenant with this phone already exists');

    const passwordHash = await bcrypt.hash(input.password, 12);

    const tenant = await prisma.tenant.create({
      data: {
        name: input.tenantName,
        phone: input.phone,
        users: {
          create: {
            phone: input.phone,
            name: input.name,
            role: 'owner',
            passwordHash,
          },
        },
      },
      include: { users: true },
    });

    const owner = tenant.users[0];
    const token = signToken({ userId: owner.id, tenantId: tenant.id, role: owner.role });

    res.status(201).json({
      token,
      user: { id: owner.id, name: owner.name, role: owner.role },
      tenant: { id: tenant.id, name: tenant.name },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const input = loginSchema.parse(req.body);

    const tenant = await prisma.tenant.findUnique({ where: { phone: input.phone } });
    // Fallback: login can also happen by user phone within any tenant (attendants share tenant phone space differently)
    const user = tenant
      ? await prisma.user.findFirst({ where: { tenantId: tenant.id, phone: input.phone } })
      : await prisma.user.findFirst({ where: { phone: input.phone } });

    if (!user) throw new UnauthorizedError('Invalid credentials');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    const token = signToken({ userId: user.id, tenantId: user.tenantId, role: user.role });

    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

export default router;