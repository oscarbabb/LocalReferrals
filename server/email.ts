// SendGrid integration for Referencias Locales - blueprint:javascript_sendgrid
import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Email templates for Referencias Locales
const FROM_EMAIL = "noreply@referenciaslocales.com"; // You may need to verify this domain in SendGrid

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
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p style="color: #666;">El equipo de Referencias Locales</p>
    </div>
  `;
  
  const text = `¡Hola ${userName}! Gracias por crear tu perfil en Referencias Locales. Ya puedes comenzar a buscar servicios locales en tu comunidad.`;

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
      <p style="color: #666;">El equipo de Referencias Locales</p>
    </div>
  `;
  
  const text = `¡Hola ${userName}! Tu reserva ha sido confirmada. Proveedor: ${providerName}, Servicio: ${serviceName}, Fecha: ${bookingDate}, Hora: ${bookingTime}`;

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
      <p style="color: #666;">El equipo de Referencias Locales</p>
    </div>
  `;
  
  const text = `¡Hola ${providerName}! Has recibido una nueva reserva. Cliente: ${userName}, Servicio: ${serviceName}, Fecha: ${bookingDate}, Hora: ${bookingTime}`;

  return await sendEmail({
    to: providerEmail,
    from: FROM_EMAIL,
    subject,
    text,
    html
  });
}