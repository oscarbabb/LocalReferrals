import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

export default function Privacy() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-privacy-title">
            {t('legal.privacy.title')}
          </h1>
          <p className="text-gray-600 mb-8" data-testid="text-privacy-updated">
            {t('legal.privacy.lastUpdated')}
          </p>

          {language === 'es' ? (
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Finalidades del Tratamiento de Datos Personales</h2>
                <p className="text-gray-700 mb-4">
                  ReferenciasLocales.com.mx recopila, procesa y resguarda datos personales exclusivamente para finalidades legítimas, proporcionales y necesarias en relación con el funcionamiento de su plataforma. Las principales finalidades incluyen:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Registro de usuarios, proveedores, administradores y demás participantes</li>
                  <li>Facilitación del contacto e interacción comercial entre las partes</li>
                  <li>Gestión de accesos, notificaciones, pagos, facturación y seguimiento de servicios</li>
                  <li>Mejora continua de la experiencia del usuario mediante análisis funcional y estadístico</li>
                  <li>Cumplimiento de obligaciones legales, fiscales, contractuales o regulatorias</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  Los datos no serán utilizados para otros fines a menos que se obtenga el consentimiento explícito del titular.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Consentimiento Informado y Explícito</h2>
                <p className="text-gray-700">
                  Al registrarse o utilizar los servicios de la plataforma, el usuario acepta libre y expresamente el tratamiento de sus datos conforme a los términos de esta política. El consentimiento puede ser revocado en cualquier momento, sin efecto retroactivo, a través de los mecanismos establecidos en este documento.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h2>
                <p className="text-gray-700 mb-4">
                  El titular de los datos puede ejercer en cualquier momento los siguientes derechos:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Acceso:</strong> Conocer qué datos personales se poseen</li>
                  <li><strong>Rectificación:</strong> Corregir datos incorrectos, inexactos o incompletos</li>
                  <li><strong>Cancelación:</strong> Solicitar la eliminación de los datos cuando ya no sean necesarios</li>
                  <li><strong>Oposición:</strong> Negarse al uso de los datos para finalidades específicas, siempre que exista causa legítima</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  Estos derechos serán atendidos sin costo alguno conforme a la legislación vigente.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Medios de Contacto y Mecanismos para Ejercer Derechos</h2>
                <p className="text-gray-700">
                  Para ejercer cualquiera de estos derechos o resolver dudas sobre el tratamiento de datos, el usuario puede enviar una solicitud al correo: <a href="mailto:legal@referenciaslocales.com.mx" className="text-primary hover:underline">legal@referenciaslocales.com.mx</a>
                </p>
                <p className="text-gray-700 mt-4">
                  La solicitud será atendida en un plazo máximo de 15 días hábiles, previa validación de identidad.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Conservación, Almacenamiento y Eliminación de Datos</h2>
                <p className="text-gray-700">
                  Los datos personales se conservarán únicamente durante el tiempo necesario para cumplir con las finalidades informadas o según lo requiera la legislación aplicable. Al finalizar este periodo, los datos serán eliminados o anonimizados, salvo que exista un requerimiento legal que justifique su almacenamiento adicional.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Entrega de Información a Autoridades</h2>
                <p className="text-gray-700">
                  ReferenciasLocales.com.mx se reserva el derecho de proporcionar información a autoridades administrativas, fiscales o judiciales cuando sea requerido por orden o solicitud debidamente fundada, y conforme a los procedimientos legales aplicables. El usuario reconoce y acepta esta posibilidad como parte del funcionamiento normal de la plataforma.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Política de Cookies</h2>
                <p className="text-gray-700 mb-4">
                  ReferenciasLocales.com.mx utiliza cookies propias y de terceros para optimizar la experiencia del usuario. Entre las principales categorías de cookies utilizadas están:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Cookies técnicas:</strong> Necesarias para el funcionamiento básico de la plataforma</li>
                  <li><strong>Cookies de análisis:</strong> Permiten recopilar datos estadísticos sobre el comportamiento de navegación</li>
                  <li><strong>Cookies de personalización:</strong> Recuerdan las preferencias del usuario como idioma o configuraciones locales</li>
                  <li><strong>Cookies publicitarias:</strong> Gestionadas por terceros, para mostrar anuncios relevantes al usuario</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  El uso de cookies permite a ReferenciasLocales.com.mx mejorar continuamente su funcionamiento técnico, adaptar el contenido a las preferencias del usuario, analizar patrones de uso y ofrecer una navegación más segura, rápida y personalizada. En ningún caso las cookies utilizadas almacenan información personal sensible ni acceden a contenidos del dispositivo del usuario.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Gestión, Configuración y Eliminación de Cookies</h2>
                <p className="text-gray-700">
                  El usuario tiene control total sobre la gestión de cookies. Puede configurar su navegador para aceptar, bloquear o eliminar cookies en cualquier momento. Las instrucciones específicas para cada navegador se encuentran en los sitios de soporte oficiales del navegador. Al deshabilitar ciertas cookies, algunas funcionalidades de la plataforma pueden verse limitadas.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modificaciones a la Política de Privacidad</h2>
                <p className="text-gray-700">
                  ReferenciasLocales.com.mx se reserva el derecho de actualizar esta política para reflejar cambios legislativos, tecnológicos o estratégicos, notificando dichas actualizaciones en la misma sección de la plataforma.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contacto</h2>
                <p className="text-gray-700">
                  Para consultas sobre esta política de privacidad, puede contactarnos en: <a href="mailto:legal@referenciaslocales.com.mx" className="text-primary hover:underline">legal@referenciaslocales.com.mx</a>
                </p>
              </section>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Purposes of Personal Data Processing</h2>
                <p className="text-gray-700 mb-4">
                  ReferenciasLocales.com.mx collects, processes, and safeguards personal data exclusively for legitimate, proportional, and necessary purposes in relation to the operation of its platform. The main purposes include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Registration of users, suppliers, administrators, and other participants</li>
                  <li>Facilitation of contact and commercial interaction between the parties</li>
                  <li>Manage access, notifications, payments, billing, and service tracking</li>
                  <li>Continuous improvement of the user experience through functional and statistical analysis</li>
                  <li>Compliance with legal, tax, contractual, or regulatory obligations</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  The data will not be used for other purposes unless the explicit consent of the owner is obtained.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Informed and Explicit Consent</h2>
                <p className="text-gray-700">
                  By registering or using the services of the platform, the user freely and expressly accepts the processing of their data following the terms of this policy. Consent may be revoked at any time, without retroactive effect, through the mechanisms established in this document.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Exercise of Rights of Access, Rectification, Cancellation and Opposition</h2>
                <p className="text-gray-700 mb-4">
                  The owner of the data may exercise the following rights at any time:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Access:</strong> Know what personal data is held</li>
                  <li><strong>Rectification:</strong> Correcting incorrect, inaccurate, or incomplete data</li>
                  <li><strong>Cancellation:</strong> Request the deletion of the data when it is no longer necessary</li>
                  <li><strong>Opposition:</strong> Refuse to use the data for specific purposes, provided that there is a legitimate cause</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  These rights will be attended to at no cost following current legislation.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Means of Contact and Mechanisms for Exercising Rights</h2>
                <p className="text-gray-700">
                  To exercise any of these rights or resolve doubts about data processing, the user may send a request to the email: <a href="mailto:legal@referenciaslocales.com.mx" className="text-primary hover:underline">legal@referenciaslocales.com.mx</a>
                </p>
                <p className="text-gray-700 mt-4">
                  The request will be attended to within a maximum period of 15 business days, after validation of identity.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention, Storage, and Deletion</h2>
                <p className="text-gray-700">
                  Personal data will be kept only for the time necessary to comply with the purposes reported or as required by applicable legislation. At the end of this period, the data will be deleted or anonymised, unless there is a legal requirement that justifies its additional storage.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Delivery of Information to Authorities</h2>
                <p className="text-gray-700">
                  ReferenciasLocales.com.mx reserves the right to provide information to administrative, fiscal, or judicial authorities when required by order or a duly founded request, and by applicable legal procedures. The user acknowledges and accepts this possibility as part of the platform's normal operation.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookie Policy</h2>
                <p className="text-gray-700 mb-4">
                  ReferenciasLocales.com.mx uses its own and third-party cookies to optimize the user experience. Among the main categories of cookies used are:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Technical cookies:</strong> Necessary for the basic functioning of the platform</li>
                  <li><strong>Analysis cookies:</strong> Allow us to collect statistical data on browsing behaviour</li>
                  <li><strong>Personalisation cookies:</strong> Remember user preferences such as language or local settings</li>
                  <li><strong>Advertising cookies:</strong> Managed by third parties, to show relevant ads to the user</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  The use of cookies allows ReferenciasLocales.com.mx to continuously improve its technical operation, adapt the content to the user's preferences, analyse usage patterns, and offer safer, faster, and more personalised browsing. Under no circumstances do the cookies used store sensitive personal information or access content on the user's device.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Management, Configuration, and Deletion of Cookies</h2>
                <p className="text-gray-700">
                  The user has full control over the management of cookies. You can set your browser to accept, block, or delete cookies at any time. Specific instructions for each browser can be found on the browser's official support sites. By disabling certain cookies, some functionalities of the platform may be limited.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Privacy Policy</h2>
                <p className="text-gray-700">
                  ReferenciasLocales.com.mx reserves the right to update this policy to reflect legislative, technological, or strategic changes, notifying such updates in the same section of the platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
                <p className="text-gray-700">
                  For inquiries about this privacy policy, you can contact us at: <a href="mailto:legal@referenciaslocales.com.mx" className="text-primary hover:underline">legal@referenciaslocales.com.mx</a>
                </p>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
