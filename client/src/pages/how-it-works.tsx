import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Users, 
  MessageCircle, 
  Star, 
  Shield, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  Home, 
  UserCheck, 
  Clock, 
  Award,
  ArrowLeft,
  PlayCircle,
  Smartphone,
  MapPin,
  CreditCard,
  HeartHandshake
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  color: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

function StepCard({ step, isActive, onClick, t }: { step: Step; isActive: boolean; onClick: () => void; t: (key: string) => string }) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isActive ? 'ring-2 ring-orange-500 shadow-lg scale-105' : 'hover:scale-102'
      }`}
      onClick={onClick}
      data-testid={`card-step-${step.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white mr-4`}>
            {step.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {t('howItWorks.stepLabel')} {step.id}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{step.description}</p>
        
        {isActive && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
            {step.details.map((detail, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{detail}</span>
              </div>
            ))}
          </div>
        )}
        
        {!isActive && (
          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 p-0">
            {t('howItWorks.viewDetails')} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300" data-testid="card-feature">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 mr-4">
            {feature.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
        </div>
        
        <p className="text-gray-600 mb-4">{feature.description}</p>
        
        <div className="space-y-2">
          {feature.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HowItWorks() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(1);

  const steps: Step[] = [
    {
      id: 1,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      icon: <Search className="w-8 h-8" />,
      details: [
        t('howItWorks.step1.detail1'),
        t('howItWorks.step1.detail2'),
        t('howItWorks.step1.detail3'),
        t('howItWorks.step1.detail4')
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      icon: <Users className="w-8 h-8" />,
      details: [
        t('howItWorks.step2.detail1'),
        t('howItWorks.step2.detail2'),
        t('howItWorks.step2.detail3'),
        t('howItWorks.step2.detail4')
      ],
      color: "from-green-500 to-green-600"
    },
    {
      id: 3,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      icon: <Calendar className="w-8 h-8" />,
      details: [
        t('howItWorks.step3.detail1'),
        t('howItWorks.step3.detail2'),
        t('howItWorks.step3.detail3'),
        t('howItWorks.step3.detail4')
      ],
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 4,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
      icon: <Star className="w-8 h-8" />,
      details: [
        t('howItWorks.step4.detail1'),
        t('howItWorks.step4.detail2'),
        t('howItWorks.step4.detail3'),
        t('howItWorks.step4.detail4')
      ],
      color: "from-purple-500 to-purple-600"
    }
  ];

  const features: Feature[] = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('howItWorks.feature1.title'),
      description: t('howItWorks.feature1.description'),
      benefits: [
        t('howItWorks.feature1.benefit1'),
        t('howItWorks.feature1.benefit2'),
        t('howItWorks.feature1.benefit3'),
        t('howItWorks.feature1.benefit4')
      ]
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: t('howItWorks.feature2.title'),
      description: t('howItWorks.feature2.description'),
      benefits: [
        t('howItWorks.feature2.benefit1'),
        t('howItWorks.feature2.benefit2'),
        t('howItWorks.feature2.benefit3'),
        t('howItWorks.feature2.benefit4')
      ]
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t('howItWorks.feature3.title'),
      description: t('howItWorks.feature3.description'),
      benefits: [
        t('howItWorks.feature3.benefit1'),
        t('howItWorks.feature3.benefit2'),
        t('howItWorks.feature3.benefit3'),
        t('howItWorks.feature3.benefit4')
      ]
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: t('howItWorks.feature4.title'),
      description: t('howItWorks.feature4.description'),
      benefits: [
        t('howItWorks.feature4.benefit1'),
        t('howItWorks.feature4.benefit2'),
        t('howItWorks.feature4.benefit3'),
        t('howItWorks.feature4.benefit4')
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('howItWorks.backToHome')}
            </Link>
            
            <div className="flex justify-center items-center mb-6">
              <PlayCircle className="w-8 h-8 mr-3" />
              <h1 className="text-4xl font-bold">
                {t('howItWorks.mainTitle')}
              </h1>
            </div>
            
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t('howItWorks.mainDescription')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">4</div>
                <div className="text-sm text-blue-200">{t('howItWorks.simpleSteps')}</div>
              </div>
              
              <div className="hidden sm:block w-px h-12 bg-blue-300"></div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-sm text-blue-200">{t('howItWorks.verified')}</div>
              </div>
              
              <div className="hidden sm:block w-px h-12 bg-blue-300"></div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-blue-200">{t('howItWorks.available')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Steps Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('howItWorks.processTitle')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('howItWorks.processDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              isActive={activeStep === step.id}
              onClick={() => setActiveStep(step.id)}
              t={t}
            />
          ))}
        </div>

        {/* Process Flow Visualization */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {t('howItWorks.processFlowTitle')}
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
                  {step.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600 max-w-32">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-gray-400 mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mb-6 shadow-lg">
              <HeartHandshake className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('howItWorks.whyChooseTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('howItWorks.whyChooseDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-orange-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t('howItWorks.communityBenefitsTitle')}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('howItWorks.forResidents.title')}</h3>
                    <p className="text-gray-600">
                      {t('howItWorks.forResidents.description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('howItWorks.forProviders.title')}</h3>
                    <p className="text-gray-600">
                      {t('howItWorks.forProviders.description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('howItWorks.forCommunity.title')}</h3>
                    <p className="text-gray-600">
                      {t('howItWorks.forCommunity.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Smartphone className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">{t('howItWorks.easyToUse.title')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('howItWorks.easyToUse.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <CreditCard className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">{t('howItWorks.noFees.title')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('howItWorks.noFees.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">{t('howItWorks.secure.title')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('howItWorks.secure.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">{t('howItWorks.availability.title')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('howItWorks.availability.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('howItWorks.readyToStart.title')}
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            {t('howItWorks.readyToStart.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg w-full sm:w-auto shadow-lg" data-testid="button-explore-services">
                {t('howItWorks.exploreServices')}
              </Button>
            </Link>
            <Link href="/providers">
              <Button size="lg" variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg w-full sm:w-auto shadow-lg" data-testid="button-become-provider">
                {t('howItWorks.becomeProvider')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
