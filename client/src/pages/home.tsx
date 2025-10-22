import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import ServiceCard from "@/components/service-card";
import ProviderCard from "@/components/provider-card";
import TestimonialCard from "@/components/testimonial-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, MessageCircle, Handshake, UserCheck, Home as HomeIcon, ArrowRight } from "lucide-react";
import type { ServiceCategory } from "@shared/schema";
import logoPath from "@assets/Logo 2 test_1754014544538.png";

export default function Home() {
  const { t } = useLanguage();
  
  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: providers = [] } = useQuery({
    queryKey: ["/api/providers"],
  });

  const featuredProviders = (providers as any[]).slice(0, 3);

  // Calculate real provider count per category
  const getProviderCountForCategory = (categoryId: string): number => {
    return (providers as any[]).filter(provider => 
      provider.categoryId === categoryId
    ).length;
  };

  const testimonials: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-orange-50 to-blue-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Large Centered Logo */}
            <div className="mb-8 animate-bounce-in">
              <img 
                src={logoPath} 
                alt="Referencias Locales Logo" 
                className="w-40 h-40 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 mx-auto object-contain drop-shadow-lg hover-scale animate-float"
              />
              <p className="text-lg md:text-xl text-gray-600 mt-4 font-medium animate-fade-in">
                {t('home.slogan')}
              </p>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-slide-up">
              {t('home.heroTitle1')} <br className="hidden sm:block" />
              <span className="text-primary">{t('home.heroTitle2')}</span> <span className="text-accent">{t('home.heroTitle3')}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in">
              {t('home.heroParagraph')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Link href="/services">
                <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 text-white hover:from-blue-600 hover:to-primary px-8 py-4 text-lg w-full sm:w-auto shadow-lg btn-animate hover-lift" data-testid="button-explore-services">
                  {t('home.exploreServices')}
                </Button>
              </Link>
              <Link href="/review-demo">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700 px-8 py-4 text-lg w-full sm:w-auto shadow-lg btn-animate hover-lift"
                  data-testid="button-view-reviews"
                >
                  {t('home.viewReviewSystem')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section id="servicios" className="py-20 bg-gradient-to-b from-gray-50 via-orange-50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pattern-dots"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mb-6 shadow-lg">
              <HomeIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('home.categoriesTitle')} <span className="text-orange-600">{t('home.categoriesHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.categoriesDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div key={category.id} className="stagger-item">
                <ServiceCard 
                  category={category} 
                  providerCount={getProviderCountForCategory(category.id)} 
                />
              </div>
            ))}
          </div>

          {/* Call to action */}
          <div className="text-center mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-orange-200/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('home.ctaNotFound')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('home.ctaExplore')}
              </p>
              <Link href="/services">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg btn-animate hover-lift"
                  data-testid="button-view-all-services"
                >
                  {t('home.viewAllServices')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('home.featuredProvidersTitle')}</h2>
            <p className="text-xl text-gray-600">{t('home.featuredProvidersDesc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProviders.map((provider: any, index) => (
              <div key={provider.id} className="stagger-item">
                <ProviderCard provider={provider} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/providers">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-accent text-accent hover:bg-gradient-to-r hover:from-accent hover:to-orange-500 hover:text-white px-8 py-3 text-lg shadow-md btn-animate hover-lift"
                data-testid="button-view-all-providers"
              >
                {t('home.viewAllProviders')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-16 bg-gradient-to-b from-orange-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('home.howItWorksTitle')}</h2>
            <p className="text-xl text-gray-600">{t('home.howItWorksSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('home.searchFilterTitle')}</h3>
              <p className="text-gray-600 text-lg">{t('home.searchFilterDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-accent to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('home.connectDirectlyTitle')}</h3>
              <p className="text-gray-600 text-lg">{t('home.connectDirectlyDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('home.rateRecommendTitle')}</h3>
              <p className="text-gray-600 text-lg">{t('home.rateRecommendDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white pattern-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('home.trustSecurityTitle')}</h2>
            <p className="text-xl text-gray-600">{t('home.trustSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.verifiedProvidersTitle')}</h3>
              <p className="text-gray-600">{t('home.verifiedProvidersDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-50 border-2 border-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.reviewSystemTitle')}</h3>
              <p className="text-gray-600">{t('home.reviewSystemDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.localCommunityTitle')}</h3>
              <p className="text-gray-600">{t('home.localCommunityDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.completeProfilesTitle')}</h3>
              <p className="text-gray-600">{t('home.completeProfilesDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-16 bg-gradient-to-b from-gray-50 to-orange-50 pattern-dots">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('home.testimonialsTitle')}</h2>
            <p className="text-xl text-gray-600">{t('home.testimonialsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary via-blue-600 to-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('home.ctaReadyTitle')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('home.ctaText')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-lg px-8 py-4 text-lg w-full sm:w-auto">
                {t('home.ctaStartNow')}
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white bg-white/20 hover:bg-white hover:text-primary shadow-lg px-8 py-4 text-lg w-full sm:w-auto backdrop-blur-sm"
                data-testid="button-learn-more"
              >
                {t('home.ctaLearnMore')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.png" alt="Referencias Locales" className="w-10 h-10" />
                <span className="text-xl font-bold">Referencias Locales</span>
              </div>
              <p className="text-gray-300 mb-4">
                {t('home.footerDescription')}
              </p>
              <div className="flex space-x-4">
                <span className="text-2xl text-gray-400 hover:text-white cursor-pointer">📘</span>
                <span className="text-2xl text-gray-400 hover:text-white cursor-pointer">🐦</span>
                <span className="text-2xl text-gray-400 hover:text-white cursor-pointer">📷</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('home.footerLinksTitle')}</h3>
              <ul className="space-y-2">
                <li><Link href="/services" className="text-gray-300 hover:text-white">{t('home.footerServices')}</Link></li>
                <li><Link href="/como-funciona" className="text-gray-300 hover:text-white">{t('nav.howItWorks')}</Link></li>
                <li><Link href="/testimonials" className="text-gray-300 hover:text-white">{t('nav.testimonials')}</Link></li>
                <li><Link href="/verification" className="text-gray-300 hover:text-white">{t('home.footerVerification')}</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-white">{t('home.footerHelp')}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('home.footerLegalTitle')}</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-300 hover:text-white" data-testid="link-footer-terms">{t('home.footerTerms')}</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white" data-testid="link-footer-privacy">{t('home.footerPrivacy')}</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white" data-testid="link-footer-cookies">{t('home.footerCookies')}</Link></li>
                <li><a href="mailto:legal@referenciaslocales.com.mx" className="text-gray-300 hover:text-white" data-testid="link-footer-contact">{t('home.footerContact')}</a></li>
              </ul>
            </div>
          </div>

          <hr className="border-gray-800 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t('home.footerRights')}
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              {t('home.footerMadeWith')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
