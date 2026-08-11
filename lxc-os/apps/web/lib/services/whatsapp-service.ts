import { sendWhatsApp as sendWhatsAppViaMSG91, MSG91Config } from './msg91-service';

interface WhatsAppConfig {
  authKey?: string;
  senderId?: string;
  route?: string;
  country?: string;
  smsTemplateId?: string;
  whatsappTemplateId?: string;
  provider?: string;
}

export async function sendWhatsApp(
  to: string,
  message: string,
  config: WhatsAppConfig
) {
  if (!config || !config.authKey || !config.senderId) {
    throw new Error('Missing MSG91 WhatsApp configuration');
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
    const success = await sendWhatsAppViaMSG91(to, message, msg91Config);
    if (!success) {
      throw new Error('MSG91 WhatsApp sending failed');
    }
  } catch (err: any) {
    throw new Error(`MSG91 WhatsApp error: ${err.message || err}`);
  }
}
