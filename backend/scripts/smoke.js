// Smoke test: server + Neon must be running first (npm run dev, DATABASE_URL set).
// Exercises the full merchant flow end-to-end against the API contract.
const base = process.env.APP_URL ?? 'http://localhost:4000';
let failures = 0;

async function call(method, path, { token, body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
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
const tillNumber = `T${Date.now().toString().slice(-5)}`;

// 1. unauthenticated → 401
let r = await call('GET', '/api/v1/auth/me');
check('me without token → 401', r.status === 401, `got ${r.status}`);

// 2. register
r = await call('POST', '/api/v1/auth/register', {
  body: { name: 'Smoke Test Shop', phone, password: 'password123' },
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

// 16. delete attendant → then update → 404
r = await call('DELETE', `/api/v1/attendants/${attendantId}`, { token });
check('delete attendant → 200', r.status === 200, `got ${r.status}`);
r = await call('PUT', `/api/v1/attendants/${attendantId}`, { token, body: { name: 'Ghost', phone: attendantPhone } });
check('update deleted → 404', r.status === 404, `got ${r.status}`);

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
