// SendGrid integration for Referencias Locales
import sgMail from "@sendgrid/mail";

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface CustomEmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: CustomEmailParams): Promise<boolean> {
  try {
    const msg = {
      to: params.to,
      from: {
        email: params.from,
        name: "Referencias Locales"
      },
      subject: params.subject,
      text: params.text || "",
      html: params.html || params.text || ""
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${params.to}`);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    return false;
  }
}

// Email templates for Referencias Locales
const FROM_EMAIL = "hello@referenciaslocales.com.mx";
const SUPPORT_EMAIL = "support@referenciaslocales.com.mx";

export async function sendProfileConfirmationEmail(userEmail: string, userName: string): Promise<boolean> {
  const subject = "¡Bienvenido a Referencias Locales!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">¡Hola ${userName}!</h2>
      <p>Gracias por crear tu perfil en Referencias Locales.</p>
      <p>Ya puedes comenzar a:</p>
      <ul>
        <li>Buscar servicios locales en tu comunidad</li>
        <li>Conectar con proveedores verificados</li>
        <li>Solicitar servicios de confianza</li>
      </ul>
      <p>Si tienes alguna pregunta, contáctanos en <a href="mailto:${SUPPORT_EMAIL}" style="color: #f97316;">${SUPPORT_EMAIL}</a></p>
      <p style="color: #666;">El equipo de Referencias Locales</p>
    </div>
  `;
  
  const text = `¡Hola ${userName}! Gracias por crear tu perfil en Referencias Locales. Ya puedes comenzar a buscar servicios locales en tu comunidad. Si tienes alguna pregunta, contáctanos en ${SUPPORT_EMAIL}`;

  return await sendEmail({
    to: userEmail,
    from: FROM_EMAIL,
    subject,
    text,
    html
  });
}

export async function sendBookingConfirmationEmail(
  userEmail: string,
  userName: string,
  providerName: string,
  serviceName: string,
  bookingDate: string,
  bookingTime: string
): Promise<boolean> {
  const subject = "Confirmación de Reserva - Referencias Locales";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Reserva Confirmada</h2>
      <p>¡Hola ${userName}!</p>
      <p>Tu reserva ha sido confirmada con los siguientes detalles:</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Proveedor:</strong> ${providerName}</p>
        <p><strong>Servicio:</strong> ${serviceName}</p>
        <p><strong>Fecha:</strong> ${bookingDate}</p>
        <p><strong>Hora:</strong> ${bookingTime}</p>
      </div>
      <p>El proveedor se pondrá en contacto contigo pronto.</p>
      <p>¿Necesitas ayuda? Escríbenos a <a href="mailto:${SUPPORT_EMAIL}" style="color: #f97316;">${SUPPORT_EMAIL}</a></p>
      <p style="color: #666;">El equipo de Referencias Locales</p>
    </div>
  `;
  
  const text = `¡Hola ${userName}! Tu reserva ha sido confirmada. Proveedor: ${providerName}, Servicio: ${serviceName}, Fecha: ${bookingDate}, Hora: ${bookingTime}. ¿Necesitas ayuda? Escríbenos a ${SUPPORT_EMAIL}`;

  return await sendEmail({
    to: userEmail,
    from: FROM_EMAIL,
    subject,
    text,
    html
  });
}

export async function sendBookingNotificationEmail(
  providerEmail: string,
  providerName: string,
  userName: string,
  serviceName: string,
  bookingDate: string,
  bookingTime: string
): Promise<boolean> {
  const subject = "Nueva Reserva Recibida - Referencias Locales";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Nueva Reserva</h2>
      <p>¡Hola ${providerName}!</p>
      <p>Has recibido una nueva reserva:</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Cliente:</strong> ${userName}</p>
        <p><strong>Servicio:</strong> ${serviceName}</p>
        <p><strong>Fecha:</strong> ${bookingDate}</p>
        <p><strong>Hora:</strong> ${bookingTime}</p>
      </div>
      <p>Por favor, ponte en contacto con el cliente para coordinar los detalles.</p>
      <p>¿Necesitas ayuda? Escríbenos a <a href="mailto:${SUPPORT_EMAIL}" style="color: #f97316;">${SUPPORT_EMAIL}</a></p>
      <p style="color: #666;">El equipo de Referencias Locales</p>
    </div>
  `;
  
  const text = `¡Hola ${providerName}! Has recibido una nueva reserva. Cliente: ${userName}, Servicio: ${serviceName}, Fecha: ${bookingDate}, Hora: ${bookingTime}. ¿Necesitas ayuda? Escríbenos a ${SUPPORT_EMAIL}`;

  return await sendEmail({
    to: providerEmail,
    from: FROM_EMAIL,
    subject,
    text,
    html
  });
}
