import { sendSMS as sendSMSViaMSG91, MSG91Config } from './msg91-service';

interface SMSConfig {
  authKey?: string;
  senderId?: string;
  route?: string;
  country?: string;
  smsTemplateId?: string;
  whatsappTemplateId?: string;
  provider?: string;
}

export async function sendSMS(to: string, message: string, config: SMSConfig) {
  if (!config || !config.authKey || !config.senderId) {
    throw new Error('Missing MSG91 SMS configuration');
  }

  const msg91Config: MSG91Config = {
    authKey: config.authKey,
    senderId: config.senderId,
    route: config.route,
    country: config.country,
    smsTemplateId: config.smsTemplateId,
    whatsappTemplateId: config.whatsappTemplateId,
  };

  try {
    const success = await sendSMSViaMSG91(to, message, msg91Config);
    if (!success) {
      throw new Error('MSG91 SMS sending failed');
    }
  } catch (err: any) {
    throw new Error(`MSG91 SMS error: ${err.message || err}`);
  }
}
