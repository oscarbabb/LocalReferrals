import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-terms-title">
            {t('legal.terms.title')}
          </h1>
          <p className="text-gray-600 mb-8" data-testid="text-terms-updated">
            {t('legal.terms.lastUpdated')}
          </p>

          {language === 'es' ? (
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Reglas de Comportamiento y Participación</h2>
                <p className="text-gray-700 mb-4">
                  Todos los usuarios, proveedores, administradores y visitantes de la plataforma deben comportarse con respeto, buena fe y seguir las reglas de convivencia digital. Está estrictamente prohibido:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Publicar contenido ofensivo, difamatorio, violento o ilegal</li>
                  <li>Realizar suplantación de identidad o registros falsos</li>
                  <li>Promover servicios que no cumplan con disposiciones sanitarias, fiscales o legales</li>
                  <li>Usar la plataforma para fines distintos a los establecidos</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  La comunidad puede reportar comportamientos inapropiados, los cuales serán evaluados y sancionados según las reglas internas.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Alcance de los Servicios Ofrecidos</h2>
                <p className="text-gray-700">
                  ReferenciasLocales.com.mx actúa como plataforma de intermediación digital que facilita el contacto y visibilidad entre residentes y proveedores de servicios dentro de una comunidad georeferenciada. No se compromete ni garantiza la prestación efectiva de servicios ni la legalidad, calidad o puntualidad de los mismos. No actúa como empleador, representante legal o responsable de las obligaciones fiscales, laborales, contractuales o sanitarias entre las partes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Obligaciones y Responsabilidades de los Usuarios</h2>
                <p className="text-gray-700 mb-4">
                  Los residentes y usuarios registrados se comprometen a:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>Usar la plataforma únicamente para fines lícitos</li>
                  <li>Mantener la confidencialidad de su contraseña y cuenta</li>
                  <li>Evaluar y asumir responsabilidad por cualquier contacto, pago o contratación con proveedores dentro o fuera de la plataforma</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Obligaciones y Responsabilidades de los Proveedores</h2>
                <p className="text-gray-700 mb-4">
                  Los proveedores de servicios y productos registrados deben:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Contar con los permisos, licencias y conocimientos necesarios para prestar el servicio ofrecido</li>
                  <li>Emitir facturas, recibos o comprobantes cuando sea legalmente aplicable</li>
                  <li>Cumplir con la legislación local de protección al consumidor, higiene, seguridad, propiedad intelectual e impuestos</li>
                  <li>Responder ante sus clientes por la calidad y resultados del servicio</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  ReferenciasLocales.com.mx no certifica, audita ni avala la identidad, capacidad profesional o cumplimiento normativo de los proveedores.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Proceso de Registro, Verificación y Cancelación de Cuenta</h2>
                <p className="text-gray-700 mb-4">
                  El registro en la plataforma implica el consentimiento pleno y expreso de estos términos y condiciones. La plataforma se reserva el derecho de:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Solicitar documentación adicional para verificar identidad o actividad</li>
                  <li>Suspender temporalmente cuentas bajo revisión</li>
                  <li>Dar de baja cuentas con historial de abuso, fraude, quejas recurrentes o incumplimientos</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  La cancelación también puede realizarse a solicitud del usuario, en cuyo caso sus datos serán eliminados conforme a la política de privacidad.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitaciones de Uso y Sanciones</h2>
                <p className="text-gray-700 mb-4">
                  Queda prohibido usar la plataforma para fines comerciales masivos, spam, piratería de servicios, publicidad externa no autorizada o acciones que afecten el funcionamiento, seguridad o reputación del sitio. El incumplimiento puede resultar en:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Suspensión temporal de acceso</li>
                  <li>Cancelación permanente del perfil</li>
                  <li>Inclusión en listas internas de bloqueo</li>
                  <li>Denuncia ante autoridades competentes, si corresponde</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Descargo de Responsabilidad</h2>
                <p className="text-gray-700 mb-4">
                  ReferenciasLocales.com.mx actúa como plataforma de intermediación de información digital. Las recomendaciones, calificaciones, comentarios o reseñas publicadas en el sitio son expresiones personales de los usuarios y no representan una garantía por parte de la plataforma sobre la calidad, legalidad o cumplimiento de los servicios o productos ofrecidos por los proveedores.
                </p>
                <p className="text-gray-700">
                  ReferenciasLocales.com.mx no asume responsabilidad alguna por daños, perjuicios o pérdidas derivadas de la relación entre usuarios y proveedores de servicios, aun cuando esta se haya iniciado a través de la plataforma. Cualquier contratación, acuerdo o intercambio entre partes externas se realiza bajo su exclusiva responsabilidad y conforme a las leyes aplicables en su jurisdicción.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Uso Voluntario e Informado</h2>
                <p className="text-gray-700">
                  El uso de la plataforma se realiza de manera libre, voluntaria e informada. Al registrarse y participar, los usuarios aceptan expresamente los términos, condiciones y limitaciones del servicio. ReferenciasLocales.com.mx no garantiza disponibilidad continua ni resultados específicos, y puede modificar o discontinuar servicios en cualquier momento, sin previo aviso.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Casos de Fuerza Mayor</h2>
                <p className="text-gray-700">
                  La plataforma no será responsable en casos de fuerza mayor, caso fortuito o eventos fuera de su control, tales como pandemias, desastres naturales, interrupciones de internet, ciberataques, conflictos militares o restricciones gubernamentales. Asimismo, se deslinda de cualquier consecuencia derivada del uso impropio, tergiversación o mala interpretación de la información contenida en la plataforma por parte de cualquier usuario o tercero.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contacto</h2>
                <p className="text-gray-700">
                  Para consultas sobre estos términos y condiciones, puede contactarnos en: <a href="mailto:legal@referenciaslocales.com.mx" className="text-primary hover:underline">legal@referenciaslocales.com.mx</a>
                </p>
              </section>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Rules of Behavior and Participation</h2>
                <p className="text-gray-700 mb-4">
                  All users, suppliers, administrators, and visitors to the platform must behave with respect, good faith and follow the rules of digital coexistence. It is strictly forbidden:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Post offensive, defamatory, violent, or illegal content</li>
                  <li>Carrying out identity theft or false registrations</li>
                  <li>Promoting services that do not comply with health, tax, or legal provisions</li>
                  <li>Use the platform for purposes other than those established</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  The community may report inappropriate behavior, which will be evaluated and sanctioned according to internal rules.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Scope of Services Offered</h2>
                <p className="text-gray-700">
                  ReferenciasLocales.com.mx acts as a digital intermediation platform that facilitates contact and visibility between residents and service providers within a georeferenced community. It does not undertake or guarantee the effective provision of services or the legality, quality, or timeliness of the same. It does not act as an employer, legal representative, or responsible party for the fiscal, labor, contractual, or health obligations between the parties.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Obligations and Responsibilities of Users</h2>
                <p className="text-gray-700 mb-4">
                  Residents and registered users agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide truthful and up-to-date information</li>
                  <li>Use the platform only for lawful purposes</li>
                  <li>Maintain the confidentiality of your password and account</li>
                  <li>Evaluate and assume responsibility for any contact, payment, or contracting with suppliers inside or outside the platform</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Obligations and Responsibilities of Suppliers</h2>
                <p className="text-gray-700 mb-4">
                  Registered service and product providers must:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Have the necessary permits, licenses, and knowledge to provide the service offered</li>
                  <li>Issue invoices, receipts, or vouchers when legally applicable</li>
                  <li>Comply with local consumer protection, hygiene, safety, intellectual property, and tax legislation</li>
                  <li>To respond to its customers regarding the quality and results of the service</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  ReferenciasLocales.com.mx does not certify, audit, or endorse the identity, professional capacity, or regulatory compliance of suppliers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Account Registration, Verification, and Cancellation Process</h2>
                <p className="text-gray-700 mb-4">
                  Registration on the platform implies full and express consent to these terms and conditions. The platform reserves the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Request additional documentation to verify identity or activity</li>
                  <li>Temporarily suspend accounts under review</li>
                  <li>Terminate accounts with a history of abuse, fraud, recurring complaints, or non-compliance</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  Cancellation can also be made at the request of the user, in which case their data will be deleted following the privacy policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitations on Use and Penalties</h2>
                <p className="text-gray-700 mb-4">
                  It is forbidden to use the platform for mass commercial purposes, spam, piracy of services, unauthorized external advertising, or actions that affect the operation, security, or reputation of the site. Failure to comply with these rules may result in:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Temporary suspension of access</li>
                  <li>Permanent cancellation of the profile</li>
                  <li>Inclusion in internal block lists</li>
                  <li>Complaint to competent authorities, if applicable</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimer</h2>
                <p className="text-gray-700 mb-4">
                  ReferenciasLocales.com.mx acts as a digital information intermediation platform. The recommendations, ratings, comments, or reviews published on the site are personal expressions of the users and do not represent a guarantee on the part of the platform about the quality, legality, or compliance of the services or products offered by the providers.
                </p>
                <p className="text-gray-700">
                  ReferenciasLocales.com.mx assumes no liability for damages, losses, or losses arising from the relationship between users and service providers, even if this has been initiated through the platform. Any contracting, agreement, or exchange between external parties is carried out under your sole responsibility and following the applicable laws in your jurisdiction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Voluntary and Informed Use</h2>
                <p className="text-gray-700">
                  The use of the platform is done in a free, voluntary, and informed manner. By registering and participating, users expressly agree to the terms, conditions, and limitations of the service. ReferenciasLocales.com.mx does not guarantee continuous availability or specific results, and may modify or discontinue services at any time, without prior notice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Force Majeure</h2>
                <p className="text-gray-700">
                  The platform will not be responsible in cases of force majeure, fortuitous event, or events beyond its control, such as pandemics, natural disasters, internet outages, cyberattacks, military conflicts, or government restrictions. Likewise, it disclaims any consequences derived from the improper use, misrepresentation, or misinterpretation of the information contained in the platform by any user or third party.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
                <p className="text-gray-700">
                  For inquiries about these terms and conditions, you can contact us at: <a href="mailto:legal@referenciaslocales.com.mx" className="text-primary hover:underline">legal@referenciaslocales.com.mx</a>
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
