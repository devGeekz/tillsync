// Smoke test: server + Neon must be running first (npm run dev, DATABASE_URL set).
// Exercises the full merchant flow end-to-end against the API contract.
import crypto from 'node:crypto';

const base = process.env.APP_URL ?? 'http://localhost:4000';
let failures = 0;

async function call(method, path, { token, body, signature } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(signature ? { 'x-tillsync-signature': signature } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

function check(label, cond, extra = '') {
  if (cond) console.log(`  ok  ${label}`);
  else {
    failures++;
    console.log(`FAIL  ${label} ${extra}`);
  }
}

const phone = `+233${Date.now().toString().slice(-9)}`;
const momoNumber = `+23320${Date.now().toString().slice(-8)}`;
const tillNumber = `T${Date.now().toString().slice(-5)}`;

// 1. unauthenticated → 401
let r = await call('GET', '/api/v1/auth/me');
check('me without token → 401', r.status === 401, `got ${r.status}`);

// 2. register
r = await call('POST', '/api/v1/auth/register', {
  body: { name: 'Smoke Test Shop', phone, password: 'password123', momoNumber },
});
check('register → 201 + token', r.status === 201 && !!r.json?.token, `got ${r.status}`);
const token = r.json?.token;

// 3. me
r = await call('GET', '/api/v1/auth/me', { token });
check('me → 200 + tenantId', r.status === 200 && !!r.json?.data?.tenantId, `got ${r.status}`);

// 4. create till
r = await call('POST', '/api/v1/tills', { token, body: { tillNumber, name: 'Smoke Counter' } });
check('create till → 201', r.status === 201 && r.json?.data?.tillNumber === tillNumber, `got ${r.status}`);
const tillId = r.json?.data?.id;

// 5. duplicate till → 400
r = await call('POST', '/api/v1/tills', { token, body: { tillNumber, name: 'Dup' } });
check('duplicate till → 400', r.status === 400, `got ${r.status}`);

// 6. list tills
r = await call('GET', '/api/v1/tills', { token });
check('list tills → total ≥ 1', r.status === 200 && r.json?.total >= 1, `got ${r.status}`);

// 7. create attendant
r = await call('POST', '/api/v1/attendants', {
  token,
  body: { name: 'Smoke Attendant', phone: `+233${Date.now().toString().slice(-8)}7`, password: 'password123' },
});
check('create attendant → 201', r.status === 201 && r.json?.data?.role === 'attendant', `got ${r.status}`);
const attendantId = r.json?.data?.id;

// 8. list attendants
r = await call('GET', '/api/v1/attendants', { token });
check('list attendants → includes new one', r.status === 200 && r.json?.data?.some((a) => a.id === attendantId), `got ${r.status}`);
const attendantPhone = `+233${Date.now().toString().slice(-8)}9`;

// 8b. update attendant
r = await call('PUT', `/api/v1/attendants/${attendantId}`, { token, body: { name: 'Smoke Attendant Renamed', phone: attendantPhone } });
check('update attendant → 200', r.status === 200 && r.json?.data?.name === 'Smoke Attendant Renamed', `got ${r.status}`);

// 9. assign attendant to till
r = await call('POST', `/api/v1/tills/${tillId}/attendants`, { token, body: { attendantId } });
check('assign attendant → 201', r.status === 201, `got ${r.status}`);

// 10. duplicate assign → 400
r = await call('POST', `/api/v1/tills/${tillId}/attendants`, { token, body: { attendantId } });
check('re-assign → 400', r.status === 400, `got ${r.status}`);

// 11. till attendants list
r = await call('GET', `/api/v1/tills/${tillId}/attendants`, { token });
check('till attendants → 1', r.status === 200 && r.json?.data?.length === 1, `got ${r.status}`);

// 12. notifications list (empty is fine, shape matters)
r = await call('GET', '/api/v1/notifications?page=1&limit=10', { token });
check('notifications shape', r.status === 200 && Array.isArray(r.json?.data) && r.json?.page === 1, `got ${r.status}`);

// 13. dashboard stats
r = await call('GET', '/api/v1/dashboard/stats', { token });
check('stats → totalTills ≥ 1', r.status === 200 && r.json?.data?.totalTills >= 1, `got ${r.status}`);

// 14. login with same credentials
r = await call('POST', '/api/v1/auth/login', { body: { phone, password: 'password123' } });
check('login → 200 + token', r.status === 200 && !!r.json?.token, `got ${r.status}`);

// 15. wrong password → 401
r = await call('POST', '/api/v1/auth/login', { body: { phone, password: 'wrong-password' } });
check('wrong password → 401', r.status === 401, `got ${r.status}`);

// 16. MoMo webhook → notification + SMS
const sign = (body) =>
  crypto.createHmac('sha256', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
const callback = {
  momoNumber,
  tillNumber,
  amount: '150.00',
  currency: 'GHS',
  externalId: `smoke-${Date.now()}`,
  payer: { partyIdType: 'MSISDN', partyId: '244123456' },
  status: 'SUCCESSFUL',
  referenceId: `ref-${Date.now()}`,
};

r = await call('POST', '/api/v1/webhook/momo', { body: callback }); // no signature
check('webhook without signature → 401', r.status === 401, `got ${r.status}`);

r = await call('POST', '/api/v1/webhook/momo', { body: callback, signature: 'deadbeef' });
check('webhook bad signature → 401', r.status === 401, `got ${r.status}`);

r = await call('POST', '/api/v1/webhook/momo', { body: callback, signature: sign(callback) });
check('webhook → 200 received', r.status === 200 && r.json?.status === 'received', `got ${r.status} ${JSON.stringify(r.json)}`);

r = await call('POST', '/api/v1/webhook/momo', { body: callback, signature: sign(callback) });
check('webhook replay → duplicate', r.status === 200 && r.json?.status === 'duplicate', `got ${r.status}`);

r = await call('POST', '/api/v1/webhook/momo', {
  body: { ...callback, momoNumber: '+233209999999', externalId: `smoke-x-${Date.now()}` },
  signature: 'nope',
});
check('webhook bad sig before lookup → 401', r.status === 401, `got ${r.status}`);

// 17. the notification landed and is listed
r = await call('GET', '/api/v1/notifications?page=1&limit=10', { token });
const found = r.json?.data?.some((n) => n.senderPhone === '+244123456');
check('notification from webhook is listed', r.status === 200 && found, `got ${r.status}`);

// 18. manual notification via API
r = await call('POST', '/api/v1/notifications', {
  token,
  body: { tillId, amount: 75, senderName: 'Manual Entry', senderPhone: '+233244999888' },
});
check('POST notification → 201 sent to attendant', r.status === 201 && r.json?.data?.status === 'sent', `got ${r.status} ${r.json?.data?.status}`);

r = await call('POST', '/api/v1/notifications', { token, body: { tillId, amount: -5 } });
check('POST notification bad amount → 400', r.status === 400, `got ${r.status}`);

// 19. billing, referrals, profile
r = await call('GET', '/api/v1/billing/subscription', { token });
check(
  'billing → plan + usage',
  r.status === 200 && r.json?.data?.plan === 'trial' && r.json?.data?.tillsUsed >= 1,
  `got ${r.status}`
);

r = await call('POST', '/api/v1/billing/subscribe', { token, body: { plan: 'basic', paymentMethod: 'momo', phone } });
check('billing subscribe → 501 not wired', r.status === 501, `got ${r.status}`);

r = await call('GET', '/api/v1/referrals/code', { token });
const referralCode = r.json?.data?.code;
check('referrals code → 200 + 8 chars', r.status === 200 && /^[A-Z0-9]{8}$/.test(referralCode ?? ''), `got ${r.status} ${referralCode}`);

r = await call('GET', '/api/v1/referrals/code', { token });
check('referrals code is stable', r.json?.data?.code === referralCode, `got ${r.json?.data?.code}`);

r = await call('GET', '/api/v1/referrals/stats', { token });
check('referrals stats → 0 total', r.status === 200 && r.json?.data?.totalReferrals === 0, `got ${r.status}`);

r = await call('PUT', '/api/v1/auth/profile', {
  token,
  body: { name: 'Renamed Shop', momoNumber: `+23320${Date.now().toString().slice(-8)}`, email: 'shop@example.com' },
});
check('profile update → 200', r.status === 200 && r.json?.data?.momoNumber?.startsWith('+23320'), `got ${r.status} ${r.json?.error ?? ''}`);

r = await call('PUT', '/api/v1/auth/profile', { token, body: { name: 'X', momoNumber: '123' } });
check('profile bad momo → 400', r.status === 400, `got ${r.status}`);

r = await call('PUT', '/api/v1/auth/profile', { body: { name: 'No Auth' } });
check('profile without token → 401', r.status === 401, `got ${r.status}`);

// 20. a referred merchant counts toward the referrer
const referredPhone = `+233${Date.now().toString().slice(-9)}`;
r = await call('POST', '/api/v1/auth/register', {
  body: { name: 'Referred Shop', phone: referredPhone, password: 'password123', ref: referralCode },
});
check('register with ref → 201', r.status === 201, `got ${r.status}`);
r = await call('GET', '/api/v1/referrals/stats', { token });
check('referral counted → 1 total + listed', r.json?.data?.totalReferrals === 1 && r.json?.data?.referrals?.[0]?.name === 'Referred Shop', `got ${r.json?.data?.totalReferrals}`);

// 20b. change password
r = await call('POST', '/api/v1/auth/change-password', { token, body: { currentPassword: 'wrong', newPassword: 'newpassword123' } });
check('change password wrong current → 401', r.status === 401, `got ${r.status}`);
r = await call('POST', '/api/v1/auth/change-password', { token, body: { currentPassword: 'password123', newPassword: 'short' } });
check('change password too short → 400', r.status === 400, `got ${r.status}`);
r = await call('POST', '/api/v1/auth/change-password', { token, body: { currentPassword: 'password123', newPassword: 'newpassword123' } });
check('change password → 200', r.status === 200, `got ${r.status}`);
r = await call('POST', '/api/v1/auth/login', { body: { phone, password: 'newpassword123' } });
check('login with new password → 200', r.status === 200, `got ${r.status}`);

// 21. delete attendant → then update → 404
r = await call('DELETE', `/api/v1/attendants/${attendantId}`, { token });
check('delete attendant → 200', r.status === 200, `got ${r.status}`);
r = await call('PUT', `/api/v1/attendants/${attendantId}`, { token, body: { name: 'Ghost', phone: attendantPhone } });
check('update deleted → 404', r.status === 404, `got ${r.status}`);

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
