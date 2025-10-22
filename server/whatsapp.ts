// Twilio WhatsApp integration for Referencias Locales
import twilio from "twilio";

if (!process.env.TWILIO_ACCOUNT_SID) {
  throw new Error("TWILIO_ACCOUNT_SID environment variable must be set");
}

if (!process.env.TWILIO_AUTH_TOKEN) {
  throw new Error("TWILIO_AUTH_TOKEN environment variable must be set");
}

if (!process.env.TWILIO_WHATSAPP_NUMBER) {
  throw new Error("TWILIO_WHATSAPP_NUMBER environment variable must be set");
}

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const WHATSAPP_FROM = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

interface WhatsAppMessageParams {
  to: string; // Phone number in E.164 format (e.g., +525512345678)
  body: string;
}

export async function sendWhatsAppMessage(params: WhatsAppMessageParams): Promise<boolean> {
  try {
    // Ensure phone number has whatsapp: prefix for Twilio
    const toNumber = params.to.startsWith('whatsapp:') 
      ? params.to 
      : `whatsapp:${params.to}`;

    const message = await twilioClient.messages.create({
      from: WHATSAPP_FROM,
      to: toNumber,
      body: params.body
    });

    console.log(`✅ WhatsApp message sent successfully to ${params.to}. SID: ${message.sid}`);
    return true;
  } catch (error: any) {
    console.error('Twilio WhatsApp error:', error);
    if (error.code) {
      console.error('Twilio error code:', error.code);
      console.error('Twilio error message:', error.message);
    }
    return false;
  }
}

/**
 * Send welcome WhatsApp message to new users
 * Note: Users must first opt-in to receive WhatsApp messages from your Twilio number
 * For sandbox: User must send the join code to your sandbox number
 * For production: User must have previously messaged your WhatsApp Business number
 */
export async function sendWelcomeWhatsApp(phoneNumber: string, userName: string): Promise<boolean> {
  const message = `¡Hola ${userName}! 👋

¡Bienvenido a Referencias Locales! 🏘️

Gracias por unirte a nuestra plataforma de servicios locales de confianza.

Ya puedes comenzar a:
🔍 Buscar servicios en tu comunidad
✅ Conectar con proveedores verificados
💼 Solicitar servicios de confianza

Visita: ${process.env.NODE_ENV === 'development' && process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://www.referenciaslocales.com.mx'}

¿Necesitas ayuda? Contáctanos en hello@referenciaslocales.com.mx

El equipo de Referencias Locales`;

  return await sendWhatsAppMessage({
    to: phoneNumber,
    body: message
  });
}

/**
 * Send booking confirmation via WhatsApp to customer
 */
export async function sendBookingConfirmationWhatsApp(
  phoneNumber: string,
  userName: string,
  providerName: string,
  serviceName: string,
  bookingDate: string,
  bookingTime: string
): Promise<boolean> {
  const message = `¡Hola ${userName}! ✅

¡Tu reserva ha sido confirmada!

📋 Detalles de tu Reserva:
• Proveedor: ${providerName}
• Servicio: ${serviceName}
• 📅 Fecha: ${bookingDate}
• 🕒 Hora: ${bookingTime}

📞 Próximos pasos:
El proveedor se pondrá en contacto contigo pronto para coordinar los detalles finales del servicio.

¿Necesitas ayuda? Escríbenos a hello@referenciaslocales.com.mx

El equipo de Referencias Locales`;

  return await sendWhatsAppMessage({
    to: phoneNumber,
    body: message
  });
}

/**
 * Send booking notification via WhatsApp to provider
 */
export async function sendBookingNotificationWhatsApp(
  phoneNumber: string,
  providerName: string,
  userName: string,
  serviceName: string,
  bookingDate: string,
  bookingTime: string
): Promise<boolean> {
  const message = `¡Hola ${providerName}! 🔔

¡Nueva Reserva Recibida!

📋 Detalles de la Reserva:
• Cliente: ${userName}
• Servicio: ${serviceName}
• 📅 Fecha: ${bookingDate}
• 🕒 Hora: ${bookingTime}

👉 Acción requerida:
Por favor, ponte en contacto con el cliente lo antes posible para coordinar los detalles del servicio y confirmar la disponibilidad.

¿Necesitas ayuda? Escríbenos a hello@referenciaslocales.com.mx

El equipo de Referencias Locales`;

  return await sendWhatsAppMessage({
    to: phoneNumber,
    body: message
  });
}
