// ponytail: stub — logs instead of sending until SMS_PROVIDER_* is configured.
// Real provider call goes here (Africa's Talking / Arkesel): one fetch, same signature.
export async function sendSms(to, message) {
  if (!process.env.SMS_API_KEY) {
    console.log(`[sms:stub] to=${to} msg=${message}`);
    return { stubbed: true };
  }
  const res = await fetch(`https://api.africastalking.com/version1/messaging`, {
    method: 'POST',
    headers: {
      apiKey: process.env.SMS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      from: process.env.SMS_SENDER ?? 'TillSync',
      to,
      message,
    }),
  });
  if (!res.ok) throw new Error(`SMS provider error ${res.status}`);
  const json = await res.json();
  const entry = json?.SMSMessageData?.[0];
  if (entry && entry.status !== 'Success') throw new Error(`SMS rejected: ${entry.status}`);
  return { stubbed: false };
}