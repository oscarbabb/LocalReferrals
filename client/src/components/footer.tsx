import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { Mail, Shield, FileText, Cookie, HelpCircle, BookOpen } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  const footerLinks = [
    {
      title: t('home.footerLinksTitle'),
      links: [
        { href: "/services", label: t('home.footerServices'), icon: null },
        { href: "/como-funciona", label: t('nav.howItWorks'), icon: null },
        { href: "/providers", label: t('nav.providers'), icon: null },
        { href: "/faq", label: t('nav.faq'), icon: HelpCircle },
      ]
    },
    {
      title: t('home.footerLegalTitle'),
      links: [
        { href: "/terms", label: t('home.footerTerms'), icon: FileText },
        { href: "/privacy", label: t('home.footerPrivacy'), icon: Shield },
        { href: "/privacy#cookies", label: t('home.footerCookies'), icon: Cookie },
        { href: "mailto:legal@referenciaslocales.com.mx", label: t('home.footerContact'), icon: Mail },
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">RL</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                Referencias Locales
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {t('home.footerDescription')}
            </p>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="w-9 h-9 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
                data-testid="link-facebook"
              >
                📘
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-gray-700 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Twitter"
                data-testid="link-twitter"
              >
                🐦
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-gray-700 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
                data-testid="link-instagram"
              >
                📷
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => {
                  const Icon = link.icon;
                  const isExternal = link.href.startsWith('mailto:') || link.href.startsWith('http');
                  
                  return (
                    <li key={linkIdx}>
                      {isExternal ? (
                        <a 
                          href={link.href}
                          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                          data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {Icon && <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100" />}
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            {link.label}
                          </span>
                        </a>
                      ) : (
                        <Link href={link.href}>
                          <a className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 group">
                            {Icon && <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100" />}
                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                              {link.label}
                            </span>
                          </a>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mb-6"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm text-center md:text-left">
            {t('home.footerRights')}
          </p>
          <p className="text-gray-400 text-sm text-center md:text-right">
            {t('home.footerMadeWith')}
          </p>
        </div>
      </div>
    </footer>
  );
}
