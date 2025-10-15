import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft, ArrowRight, ChevronDown, Sparkles, Users, Search, Calendar, Shield, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import type { ServiceCategory } from "@shared/schema";

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const getTourSteps = (t: (key: string) => string) => [
  {
    id: "welcome",
    title: t('components.onboarding.welcomeTitle'),
    description: t('components.onboarding.welcomeDesc'),
    icon: Sparkles,
    color: "from-blue-500 to-purple-600"
  },
  {
    id: "categories",
    title: t('components.onboarding.categoriesTitle'),
    description: t('components.onboarding.categoriesDesc'),
    icon: Search,
    color: "from-green-500 to-teal-600"
  },
  {
    id: "providers",
    title: t('components.onboarding.providersTitle'),
    description: t('components.onboarding.providersDesc'),
    icon: Shield,
    color: "from-orange-500 to-red-600"
  },
  {
    id: "community",
    title: t('components.onboarding.communityTitle'),
    description: t('components.onboarding.communityDesc'),
    icon: Users,
    color: "from-purple-500 to-pink-600"
  },
  {
    id: "booking",
    title: t('components.onboarding.bookingTitle'),
    description: t('components.onboarding.bookingDesc'),
    icon: Calendar,
    color: "from-teal-500 to-blue-600"
  }
];

export default function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const { t } = useLanguage();
  const tourSteps = getTourSteps(t);
  const [currentStep, setCurrentStep] = useState(0);
  const [showcaseCategories, setShowcaseCategories] = useState<ServiceCategory[]>([]);
  
  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    if (categories.length > 0 && currentStep === 1) {
      // Select 6 diverse categories for showcase
      const featured = [
        categories.find(c => c.name.includes("Limpieza")),
        categories.find(c => c.name.includes("Reparaciones")),
        categories.find(c => c.name.includes("Tutorías")),
        categories.find(c => c.name.includes("Medicina")),
        categories.find(c => c.name.includes("Belleza")),
        categories.find(c => c.name.includes("Fotografía"))
      ].filter(Boolean) as ServiceCategory[];
      
      setShowcaseCategories(featured);
    }
  }, [categories, currentStep]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentTourStep = tourSteps[currentStep];
  const IconComponent = currentTourStep.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto"
        data-testid="onboarding-overlay"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-4xl my-4 sm:my-8"
        >
          <Card className="bg-white shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white p-4 sm:p-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skip}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:bg-white/20"
                  data-testid="button-skip-tour"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-3 sm:gap-4 pr-10">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${currentTourStep.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-2xl font-bold leading-tight" data-testid="text-tour-title">
                      {currentTourStep.title}
                    </h2>
                    <p className="text-orange-100 text-sm sm:text-base leading-tight" data-testid="text-tour-description">
                      {currentTourStep.description}
                    </p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-orange-100 mb-2">
                    <span>{t('components.onboarding.step')} {currentStep + 1} {t('components.onboarding.of')} {tourSteps.length}</span>
                    <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-orange-600/30 rounded-full h-2">
                    <motion.div
                      className="bg-white rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4 sm:p-6 lg:p-8 min-h-[300px] sm:min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {currentStep === 0 && (
                      <div className="text-center space-y-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                        >
                          <img 
                            src="/logo.png" 
                            alt="Referencias Locales" 
                            className="w-24 h-24 mx-auto mb-4"
                          />
                        </motion.div>
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {t('components.onboarding.platformTitle')}
                          </h3>
                          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {t('components.onboarding.platformDesc')}
                          </p>
                          <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Users className="w-6 h-6 text-blue-600" />
                              </div>
                              <p className="text-sm text-gray-600">{t('components.onboarding.community')}</p>
                            </div>
                            <div className="text-center">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Shield className="w-6 h-6 text-green-600" />
                              </div>
                              <p className="text-sm text-gray-600">{t('components.onboarding.verified')}</p>
                            </div>
                            <div className="text-center">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Calendar className="w-6 h-6 text-purple-600" />
                              </div>
                              <p className="text-sm text-gray-600">{t('components.onboarding.easy')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('components.onboarding.exploreCategories')}
                          </h3>
                          <p className="text-gray-600">
                            {t('components.onboarding.categoriesCount')}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {showcaseCategories.map((category, index) => (
                            <motion.div
                              key={category.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="group cursor-pointer"
                            >
                              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <CardContent className="p-4 text-center">
                                  <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto"
                                    style={{ backgroundColor: category.color }}
                                  >
                                    <span className="text-2xl">{category.icon}</span>
                                  </div>
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {category.name}
                                  </h4>
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {category.description}
                                  </p>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>

                        <div className="text-center">
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            {t('components.onboarding.moreCategories')}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('components.onboarding.verifiedProviders')}
                          </h3>
                          <p className="text-gray-600">
                            {t('components.onboarding.verifiedProvidersDesc')}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <Shield className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{t('components.onboarding.experienceValidation')}</h4>
                                <p className="text-sm text-gray-600">{t('components.onboarding.experienceValidationDesc')}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <Users className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{t('components.onboarding.workRegistry')}</h4>
                                <p className="text-sm text-gray-600">{t('components.onboarding.workRegistryDesc')}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{t('components.onboarding.reputationTracking')}</h4>
                                <p className="text-sm text-gray-600">{t('components.onboarding.reputationTrackingDesc')}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <Users className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{t('components.onboarding.realReferences')}</h4>
                                <p className="text-sm text-gray-600">{t('components.onboarding.realReferencesDesc')}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 text-white" />
                              </div>
                              <h4 className="font-bold text-green-900 mb-2">{t('components.onboarding.realReferences')}</h4>
                              <p className="text-sm text-green-700">
                                {t('components.onboarding.verificationRequired')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('components.onboarding.localCommunity')}
                          </h3>
                          <p className="text-gray-600">
                            {t('components.onboarding.localCommunityDesc')}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-center p-6 bg-blue-50 rounded-xl"
                          >
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{t('components.onboarding.trustableNeighbors')}</h4>
                            <p className="text-sm text-gray-600">
                              {t('components.onboarding.trustableNeighborsDesc')}
                            </p>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center p-6 bg-green-50 rounded-xl"
                          >
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Search className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{t('components.onboarding.localSearch')}</h4>
                            <p className="text-sm text-gray-600">
                              {t('components.onboarding.localSearchDesc')}
                            </p>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center p-6 bg-purple-50 rounded-xl"
                          >
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{t('components.onboarding.realReviews')}</h4>
                            <p className="text-sm text-gray-600">
                              {t('components.onboarding.realReviewsDesc')}
                            </p>
                          </motion.div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mt-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{t('components.onboarding.areYouProvider')}</h4>
                              <p className="text-sm text-gray-600">
                                {t('components.onboarding.areYouProviderDesc')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('components.onboarding.socialPlatform')}
                          </h3>
                          <p className="text-gray-600">
                            {t('components.onboarding.socialPlatformDesc')}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                1
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{t('components.onboarding.exploreServices')}</h4>
                                <p className="text-sm text-gray-600">{t('components.onboarding.exploreServicesDesc')}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                2
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{t('components.onboarding.requestService')}</h4>
                                <p className="text-sm text-gray-600">{t('components.onboarding.requestServiceDesc')}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                3
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{t('components.onboarding.waitConfirmation')}</h4>
                                <p className="text-sm text-gray-600">{t('components.onboarding.waitConfirmationDesc')}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                            <div className="text-center">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
                              >
                                <Users className="w-8 h-8 text-white" />
                              </motion.div>
                              <h4 className="font-bold text-orange-900 mb-2">{t('components.onboarding.connectCommunity')}</h4>
                              <p className="text-sm text-orange-700 mb-4">
                                {t('components.onboarding.connectCommunityDesc')}
                              </p>
                              <Button 
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={nextStep}
                                data-testid="button-start-exploring"
                              >
                                {t('components.onboarding.exploreServicesButton')}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Navigation */}
              <div className="border-t bg-gray-50 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Mobile: Step indicators on top */}
                  <div className="flex gap-2 order-1 sm:order-2">
                    {tourSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full transition-colors ${
                          index === currentStep ? 'bg-orange-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex justify-between w-full sm:w-auto order-2 sm:order-none">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="min-w-[100px] sm:min-w-auto"
                      data-testid="button-prev-step"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{t('components.onboarding.previous')}</span>
                      <span className="sm:hidden">{t('components.onboarding.back')}</span>
                    </Button>

                    <Button
                      onClick={nextStep}
                      className="bg-orange-500 hover:bg-orange-600 text-white min-w-[100px] sm:min-w-auto ml-4 sm:ml-0"
                      data-testid="button-next-step"
                    >
                      <span className="hidden sm:inline">
                        {currentStep === tourSteps.length - 1 ? t('components.onboarding.finish') : t('components.onboarding.next')}
                      </span>
                      <span className="sm:hidden">
                        {currentStep === tourSteps.length - 1 ? t('components.onboarding.end') : t('components.onboarding.nextShort')}
                      </span>
                      <ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}