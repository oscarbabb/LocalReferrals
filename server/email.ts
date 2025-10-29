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
const SUPPORT_EMAIL = "hello@referenciaslocales.com.mx";

// Brand colors
const BRAND_BLUE = "#1463D0";
const BRAND_ORANGE = "#f97316";

// Get logo URL based on environment - ensure absolute HTTPS URL for email clients
const getLogoUrl = () => {
  if (process.env.NODE_ENV === 'development' && process.env.REPLIT_DEV_DOMAIN) {
    // Development: construct full HTTPS URL from Replit domain
    return `https://${process.env.REPLIT_DEV_DOMAIN}/logo.png`;
  }
  // Production: use production domain
  return 'https://www.referenciaslocales.com.mx/logo.png';
};

// Reusable email header template
const getEmailHeader = () => `
  <div style="background: linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_ORANGE} 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 20px;">
      <tr>
        <td style="background: white; width: 120px; height: 120px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center; vertical-align: middle; padding: 12px;">
          <img src="${getLogoUrl()}" alt="Referencias Locales Logo" style="width: 96px; height: 96px; object-fit: contain; display: block; margin: 0 auto;" />
        </td>
      </tr>
    </table>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Referencias Locales</h1>
    <p style="color: rgba(255,255,255,0.95); margin: 8px 0 0; font-size: 14px;">Tu comunidad de servicios locales de confianza</p>
  </div>
`;

// Email footer template
const getEmailFooter = () => `
  <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #f0f0f0; text-align: center;">
    <p style="color: #999; font-size: 13px; margin: 0 0 10px;">
      ¿Necesitas ayuda? Contáctanos en 
      <a href="mailto:${SUPPORT_EMAIL}" style="color: ${BRAND_ORANGE}; text-decoration: none; font-weight: 500;">${SUPPORT_EMAIL}</a>
    </p>
    <div style="margin: 20px 0;">
      <div style="display: inline-block; margin: 0 5px; background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); width: 40px; height: 3px; border-radius: 2px;"></div>
    </div>
    <p style="color: #666; font-size: 14px; margin: 15px 0 5px; font-weight: 500;">El equipo de Referencias Locales</p>
    <p style="color: #999; font-size: 12px; margin: 5px 0;">
      Conectando comunidades con servicios de calidad
    </p>
  </div>
`;

export async function sendProfileConfirmationEmail(userEmail: string, userName: string): Promise<boolean> {
  const subject = "¡Bienvenido a Referencias Locales! 🏘️";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      ${getEmailHeader()}
      
      <div style="padding: 40px 30px;">
        <h2 style="color: #333; font-size: 24px; margin: 0 0 20px; font-weight: 600;">¡Hola ${userName}! 👋</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          Gracias por unirte a <strong style="color: ${BRAND_BLUE};">Referencias Locales</strong>, tu nueva plataforma de servicios locales de confianza.
        </p>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fff7ed 100%); padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: ${BRAND_BLUE}; font-size: 18px; margin: 0 0 15px;">Ya puedes comenzar a:</h3>
          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 15px 0;">
            <tr>
              <td style="padding: 0 0 12px 0;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right: 10px; vertical-align: top;">
                      <span style="color: ${BRAND_ORANGE}; font-size: 20px;">🔍</span>
                    </td>
                    <td style="vertical-align: top;">
                      <p style="margin: 0; color: #555; line-height: 1.5;">Buscar servicios locales en tu comunidad</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 12px 0;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right: 10px; vertical-align: top;">
                      <span style="color: ${BRAND_ORANGE}; font-size: 20px;">✅</span>
                    </td>
                    <td style="vertical-align: top;">
                      <p style="margin: 0; color: #555; line-height: 1.5;">Conectar con proveedores verificados</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right: 10px; vertical-align: top;">
                      <span style="color: ${BRAND_ORANGE}; font-size: 20px;">💼</span>
                    </td>
                    <td style="vertical-align: top;">
                      <p style="margin: 0; color: #555; line-height: 1.5;">Solicitar servicios de confianza</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NODE_ENV === 'development' && process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}/servicios` : 'https://www.referenciaslocales.com.mx/servicios'}" 
             style="background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); 
                    color: white; 
                    padding: 14px 35px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block; 
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 12px rgba(244, 114, 46, 0.3);">
            Explorar Servicios
          </a>
        </div>
        
        ${getEmailFooter()}
      </div>
    </div>
  `;
  
  const text = `¡Hola ${userName}! Gracias por unirte a Referencias Locales. Ya puedes comenzar a buscar servicios locales en tu comunidad, conectar con proveedores verificados y solicitar servicios de confianza. Si tienes alguna pregunta, contáctanos en ${SUPPORT_EMAIL}`;

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
  const subject = "✅ Reserva Confirmada - Referencias Locales";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      ${getEmailHeader()}
      
      <div style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); width: 70px; height: 70px; margin: 0 auto 15px; border-radius: 50%; text-align: center; line-height: 70px;">
            <span style="font-size: 28px;">✅</span>
          </div>
          <h2 style="color: #333; font-size: 26px; margin: 0; font-weight: 600;">¡Reserva Confirmada!</h2>
        </div>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px; text-align: center;">
          ¡Hola <strong>${userName}</strong>! Tu reserva ha sido confirmada exitosamente.
        </p>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fff7ed 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${BRAND_ORANGE};">
          <h3 style="color: ${BRAND_BLUE}; font-size: 18px; margin: 0 0 20px; text-align: center;">Detalles de tu Reserva</h3>
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Proveedor</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${providerName}</p>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Servicio</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${serviceName}</p>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">📅 Fecha</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${bookingDate}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">🕒 Hora</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${bookingTime}</p>
            </div>
          </div>
        </div>
        
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_ORANGE};">
          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
            <strong>📞 Próximos pasos:</strong><br>
            El proveedor se pondrá en contacto contigo pronto para coordinar los detalles finales del servicio.
          </p>
        </div>
        
        ${getEmailFooter()}
      </div>
    </div>
  `;
  
  const text = `¡Hola ${userName}! Tu reserva ha sido confirmada. Proveedor: ${providerName}, Servicio: ${serviceName}, Fecha: ${bookingDate}, Hora: ${bookingTime}. El proveedor se pondrá en contacto contigo pronto. ¿Necesitas ayuda? Escríbenos a ${SUPPORT_EMAIL}`;

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
  const subject = "🔔 Nueva Reserva Recibida - Referencias Locales";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      ${getEmailHeader()}
      
      <div style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); width: 70px; height: 70px; margin: 0 auto 15px; border-radius: 50%; text-align: center; line-height: 70px;">
            <span style="font-size: 28px;">🔔</span>
          </div>
          <h2 style="color: #333; font-size: 26px; margin: 0; font-weight: 600;">¡Nueva Reserva!</h2>
        </div>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px; text-align: center;">
          ¡Hola <strong>${providerName}</strong>! Has recibido una nueva solicitud de servicio.
        </p>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fff7ed 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${BRAND_BLUE};">
          <h3 style="color: ${BRAND_BLUE}; font-size: 18px; margin: 0 0 20px; text-align: center;">Detalles de la Reserva</h3>
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Cliente</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${userName}</p>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Servicio Solicitado</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${serviceName}</p>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">📅 Fecha</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${bookingDate}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">🕒 Hora</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${bookingTime}</p>
            </div>
          </div>
        </div>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_BLUE};">
          <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
            <strong>👉 Acción requerida:</strong><br>
            Por favor, ponte en contacto con el cliente lo antes posible para coordinar los detalles del servicio y confirmar la disponibilidad.
          </p>
        </div>
        
        ${getEmailFooter()}
      </div>
    </div>
  `;
  
  const text = `¡Hola ${providerName}! Has recibido una nueva reserva. Cliente: ${userName}, Servicio: ${serviceName}, Fecha: ${bookingDate}, Hora: ${bookingTime}. Por favor, ponte en contacto con el cliente para coordinar los detalles. ¿Necesitas ayuda? Escríbenos a ${SUPPORT_EMAIL}`;

  return await sendEmail({
    to: providerEmail,
    from: FROM_EMAIL,
    subject,
    text,
    html
  });
}

export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetToken: string,
  appUrl: string
): Promise<boolean> {
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`;
  const subject = "🔐 Restablecer Contraseña - Referencias Locales";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      ${getEmailHeader()}
      
      <div style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); width: 70px; height: 70px; margin: 0 auto 15px; border-radius: 50%; text-align: center; line-height: 70px;">
            <span style="font-size: 28px;">🔐</span>
          </div>
          <h2 style="color: #333; font-size: 26px; margin: 0; font-weight: 600;">Restablecer Contraseña</h2>
        </div>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          ¡Hola <strong>${userName}</strong>!
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en Referencias Locales.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); 
                    color: white; 
                    padding: 16px 40px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block; 
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 12px rgba(244, 114, 46, 0.3);">
            Restablecer Contraseña
          </a>
        </div>
        
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_ORANGE};">
          <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; line-height: 1.6;">
            <strong>⏱️ Importante:</strong><br>
            Este enlace expirará en <strong>1 hora</strong> por seguridad.
          </p>
          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
            <strong>🔒 No solicitaste esto?</strong><br>
            Si no solicitaste este restablecimiento, puedes ignorar este correo de forma segura. Tu contraseña no cambiará.
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 25px 0;">
          <p style="margin: 0 0 8px; color: #666; font-size: 12px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="margin: 0; color: ${BRAND_BLUE}; font-size: 12px; word-break: break-all;">
            ${resetLink}
          </p>
        </div>
        
        ${getEmailFooter()}
      </div>
    </div>
  `;
  
  const text = `¡Hola ${userName}! Recibimos una solicitud para restablecer tu contraseña. Visita este enlace para crear una nueva contraseña: ${resetLink}. Este enlace expirará en 1 hora. Si no solicitaste este restablecimiento, puedes ignorar este correo. ¿Necesitas ayuda? Escríbenos a ${SUPPORT_EMAIL}`;

  return await sendEmail({
    to: userEmail,
    from: FROM_EMAIL,
    subject,
    text,
    html
  });
}

// Helper function to escape HTML in user-generated content
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendReviewNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  reviewerName: string,
  rating: number,
  comment?: string
): Promise<boolean> {
  const appUrl = process.env.NODE_ENV === 'development' && process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'https://www.referenciaslocales.com.mx';
    
  const subject = "⭐ Nueva Reseña Recibida - Referencias Locales";
  
  // Clamp rating to 1-5 range for safety
  const clampedRating = Math.max(1, Math.min(5, Math.round(rating)));
  
  // Generate star rating display
  const stars = '⭐'.repeat(clampedRating) + '☆'.repeat(5 - clampedRating);
  
  // Sanitize user-generated content to prevent HTML injection
  const safeComment = comment ? escapeHtml(comment) : undefined;
  const safeReviewerName = escapeHtml(reviewerName);
  const safeRecipientName = escapeHtml(recipientName);
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      ${getEmailHeader()}
      
      <div style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); width: 70px; height: 70px; margin: 0 auto 15px; border-radius: 50%; text-align: center; line-height: 70px;">
            <span style="font-size: 28px;">⭐</span>
          </div>
          <h2 style="color: #333; font-size: 26px; margin: 0; font-weight: 600;">¡Nueva Reseña Recibida!</h2>
        </div>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px; text-align: center;">
          ¡Hola <strong>${safeRecipientName}</strong>! Has recibido una nueva reseña.
        </p>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fff7ed 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${BRAND_ORANGE};">
          <h3 style="color: ${BRAND_BLUE}; font-size: 18px; margin: 0 0 20px; text-align: center;">Detalles de la Reseña</h3>
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">De</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${safeReviewerName}</p>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Calificación</p>
              <p style="margin: 0; color: ${BRAND_ORANGE}; font-size: 24px; font-weight: 600; letter-spacing: 2px;">${stars}</p>
              <p style="margin: 5px 0 0; color: #666; font-size: 14px;">${clampedRating} de 5 estrellas</p>
            </div>
            ${safeComment ? `
            <div>
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Comentario</p>
              <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6; font-style: italic;">"${safeComment}"</p>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_BLUE};">
          <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
            <strong>💬 Responde a tu cliente:</strong><br>
            Inicia sesión en tu cuenta para ver la reseña completa y responder al cliente.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/profile" 
             style="background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); 
                    color: white; 
                    padding: 14px 35px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block; 
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 12px rgba(244, 114, 46, 0.3);">
            Ver Mi Perfil
          </a>
        </div>
        
        ${getEmailFooter()}
      </div>
    </div>
  `;
  
  const text = `¡Hola ${safeRecipientName}! Has recibido una nueva reseña de ${safeReviewerName}. Calificación: ${clampedRating} de 5 estrellas.${safeComment ? ` Comentario: "${safeComment}"` : ''} Inicia sesión en tu cuenta para ver la reseña completa. ${appUrl}/profile`;

  return await sendEmail({
    to: recipientEmail,
    from: FROM_EMAIL,
    subject,
    text,
    html
  });
}

export async function sendServiceRequestNotificationEmail(
  providerEmail: string,
  providerName: string,
  userName: string,
  serviceName: string,
  description: string,
  preferredDate?: string,
  preferredTime?: string,
  location?: string
): Promise<boolean> {
  const appUrl = process.env.NODE_ENV === 'development' && process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'https://www.referenciaslocales.com.mx';
    
  const subject = "🔔 Nueva Solicitud de Servicio - Referencias Locales";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      ${getEmailHeader()}
      
      <div style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); width: 70px; height: 70px; margin: 0 auto 15px; border-radius: 50%; text-align: center; line-height: 70px;">
            <span style="font-size: 28px;">🔔</span>
          </div>
          <h2 style="color: #333; font-size: 26px; margin: 0; font-weight: 600;">¡Nueva Solicitud de Servicio!</h2>
        </div>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px; text-align: center;">
          ¡Hola <strong>${providerName}</strong>! Has recibido una nueva solicitud de servicio.
        </p>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fff7ed 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${BRAND_BLUE};">
          <h3 style="color: ${BRAND_BLUE}; font-size: 18px; margin: 0 0 20px; text-align: center;">Detalles de la Solicitud</h3>
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Cliente</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${userName}</p>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Servicio Solicitado</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${serviceName}</p>
            </div>
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Descripción</p>
              <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.5;">${description}</p>
            </div>
            ${preferredDate ? `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">📅 Fecha Preferida</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${preferredDate}</p>
            </div>
            ` : ''}
            ${preferredTime ? `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">🕒 Horario Preferido</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${preferredTime === 'morning' ? 'Mañana' : preferredTime === 'afternoon' ? 'Tarde' : 'Noche'}</p>
            </div>
            ` : ''}
            ${location ? `
            <div>
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">📍 Ubicación</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${location}</p>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_BLUE};">
          <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
            <strong>👉 Acción requerida:</strong><br>
            Inicia sesión en tu cuenta para revisar los detalles completos y responder a esta solicitud.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/bookings" 
             style="background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); 
                    color: white; 
                    padding: 16px 40px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block; 
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 12px rgba(244, 114, 46, 0.3);">
            Ver Mis Solicitudes
          </a>
        </div>
        
        ${getEmailFooter()}
      </div>
    </div>
  `;
  
  const text = `¡Hola ${providerName}! Has recibido una nueva solicitud de servicio. Cliente: ${userName}, Servicio: ${serviceName}, Descripción: ${description}${preferredDate ? `, Fecha: ${preferredDate}` : ''}${preferredTime ? `, Horario: ${preferredTime}` : ''}. Inicia sesión para revisar y responder. ${appUrl}/bookings`;

  return await sendEmail({
    to: providerEmail,
    from: FROM_EMAIL,
    subject,
    text,
    html
  });
}

/**
 * Send service completion feedback request email
 * Sent to customer when provider marks service as completed
 */
export async function sendServiceCompletionFeedbackEmail(
  customerEmail: string,
  customerName: string,
  providerName: string,
  serviceName: string,
  serviceRequestId: string
): Promise<boolean> {
  const appUrl = process.env.NODE_ENV === 'development' && process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'https://www.referenciaslocales.com.mx';
    
  const reviewUrl = `${appUrl}/bookings`;
  const subject = "✅ Servicio Completado - ¡Tu Opinión es Importante!";
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      ${getEmailHeader()}
      
      <div style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); width: 70px; height: 70px; margin: 0 auto 15px; border-radius: 50%; text-align: center; line-height: 70px;">
            <span style="font-size: 28px;">✅</span>
          </div>
          <h2 style="color: #333; font-size: 26px; margin: 0; font-weight: 600;">¡Servicio Completado!</h2>
        </div>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px; text-align: center;">
          ¡Hola <strong>${customerName}</strong>! El proveedor <strong>${providerName}</strong> ha marcado tu servicio como completado.
        </p>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fff7ed 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${BRAND_ORANGE};">
          <h3 style="color: ${BRAND_BLUE}; font-size: 18px; margin: 0 0 20px; text-align: center;">Servicio Completado</h3>
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Proveedor</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${providerName}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px; color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Servicio</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${serviceName}</p>
            </div>
          </div>
        </div>
        
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_ORANGE};">
          <p style="margin: 0 0 10px; color: #92400e; font-size: 16px; line-height: 1.6; font-weight: 600;">
            ⭐ Tu opinión es muy valiosa
          </p>
          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
            Ayúdanos a mantener la calidad de nuestra comunidad compartiendo tu experiencia con este servicio. Tu reseña ayuda a otros usuarios a tomar mejores decisiones.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reviewUrl}" 
             style="background: linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_ORANGE}); 
                    color: white; 
                    padding: 16px 40px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block; 
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 12px rgba(244, 114, 46, 0.3);">
            Dejar Mi Reseña ⭐
          </a>
        </div>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 25px 0; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
            💡 <strong>Consejo:</strong> Las reseñas honestas y detalladas son las más útiles para la comunidad
          </p>
        </div>
        
        ${getEmailFooter()}
      </div>
    </div>
  `;
  
  const text = `¡Hola ${customerName}! El proveedor ${providerName} ha completado tu servicio: ${serviceName}. Tu opinión es muy importante para nosotros. Por favor, tómate un momento para dejar una reseña y ayudar a otros miembros de la comunidad. Visita ${reviewUrl} para compartir tu experiencia. ¡Gracias!`;

  return await sendEmail({
    to: customerEmail,
    from: FROM_EMAIL,
    subject,
    text,
    html
  });
}
