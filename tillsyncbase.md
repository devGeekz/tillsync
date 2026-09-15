# Ghana MoMo Startup Ideas

## 1. Payment Verification & Merchant Operations

### TillSync — Read-Only MoMo Payment Verification

One-line pitch:  
Real-time, read-only MoMo payment confirmations for shop attendants.

Problem:  
Many SME merchants have shop attendants handling customers while the business owner's phone receives the MoMo payment SMS. When the owner is absent, busy, or asleep, attendants cannot independently verify whether a customer has actually paid.

This creates:
- Customer delays while attendants call the owner.
- Lost sales when customers leave because payment cannot be confirmed.
- Exposure to fake MoMo SMS/screenshots.
- Pressure to fall back to cash payments.

Target users:
- Boutiques
- Pharmacies
- Chop bars
- Hardware stores
- Small supermarkets

Solution:  
The business owner links a MoMo Merchant Till to an attendant's phone number. When a payment is received, TillSync receives the MoMo webhook and immediately sends the attendant a read-only SMS or WhatsApp notification.

Example:

> Confirmed: GH¢150 received from John Doe. Till 12345.

The attendant can verify the payment but cannot:
- Access the merchant balance.
- Transfer money.
- Initiate refunds.
- Control the wallet.

User journey:
1. Boss registers the Till and attendant's phone number.
2. Customer purchases goods.
3. Customer pays the Merchant Till.
4. MoMo sends a webhook to TillSync.
5. TillSync sends a confirmation to the attendant.
6. Attendant hands over the goods.

MoMo integration:  
MTN MoMo Merchant Collection API, particularly payment webhooks/callbacks.

MVP:
- Node.js/Express backend.
- /momo-callback webhook endpoint.
- MoMo API sandbox.
- Hubtel/Twilio SMS integration.
- Simple dashboard for mapping a Till ID to an attendant phone number.

Demo:  
Judge pays a demo Till → webhook fires → attendant receives confirmation within seconds.

Business model:
- GH¢15–20/month per Till.
- Or approximately GH¢0.10 per payment alert.
- Potential automatic subscription collection through MoMo.

Competitive advantage:
- No dedicated POS hardware.
- No need to give attendants access to the owner's SIM/phone.
- Works with existing feature phones.
- Read-only access reduces security risk.

Go-to-market:
- Start with high-volume retail hubs such as Makola, Osu and East Legon.
- Partner with MoMo agents to onboard merchants.
- Pay agents a small referral commission per merchant.

Risks:
- SMS delivery latency could undermine the real-time experience.
- MTN could eventually build the functionality natively.
- Dependence on MoMo API/webhook availability.

Mitigation:  
Support multiple notification channels, such as SMS and WhatsApp.

MoMo advantage: Very High
