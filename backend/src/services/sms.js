// ponytail: stub — logs instead of sending until SMS_API_KEY is configured.
// Real provider call goes here (Africa's Talking): one fetch, same signature.
export async function sendSms(to, message) {
  if (!process.env.SMS_API_KEY) {
    const messageId = `stub-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    console.log(`[sms:stub] id=${messageId} to=${to} msg=${message}`);
    return { stubbed: true, messageId };
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
  const recipient = (await res.json())?.SMSMessageData?.Recipients?.[0];
  if (!recipient || recipient.status !== 'Success') {
    throw new Error(`SMS rejected: ${recipient?.status ?? 'no recipient'}`);
  }
  return { stubbed: false, messageId: recipient.messageId };
}