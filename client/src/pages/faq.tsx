import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { Search, HelpCircle, MessageCircle } from "lucide-react";
import Footer from "@/components/footer";

export default function FAQ() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const faqItems = [
    { id: "1", question: t('faq.q1.question'), answer: t('faq.q1.answer') },
    { id: "2", question: t('faq.q2.question'), answer: t('faq.q2.answer') },
    { id: "3", question: t('faq.q3.question'), answer: t('faq.q3.answer') },
    { id: "4", question: t('faq.q4.question'), answer: t('faq.q4.answer') },
    { id: "5", question: t('faq.q5.question'), answer: t('faq.q5.answer') },
    { id: "6", question: t('faq.q6.question'), answer: t('faq.q6.answer') },
    { id: "7", question: t('faq.q7.question'), answer: t('faq.q7.answer') },
    { id: "8", question: t('faq.q8.question'), answer: t('faq.q8.answer') },
    { id: "9", question: t('faq.q9.question'), answer: t('faq.q9.answer') },
    { id: "10", question: t('faq.q10.question'), answer: t('faq.q10.answer') },
  ];

  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="faq-title">
            {t('faq.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="faq-subtitle">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={t('faq.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              data-testid="input-faq-search"
            />
          </div>
        </div>

        {/* FAQ Accordion */}
        {filteredFAQs.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Accordion type="single" collapsible className="w-full" data-testid="faq-accordion">
              {filteredFAQs.map((item, index) => (
                <AccordionItem 
                  key={item.id} 
                  value={`item-${item.id}`}
                  className={index !== filteredFAQs.length - 1 ? "border-b" : ""}
                  data-testid={`faq-item-${item.id}`}
                >
                  <AccordionTrigger 
                    className="px-6 py-4 hover:bg-gray-50 text-left"
                    data-testid={`faq-question-${item.id}`}
                  >
                    <span className="font-semibold text-gray-900 pr-4">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent 
                    className="px-6 pb-4 text-gray-700 leading-relaxed"
                    data-testid={`faq-answer-${item.id}`}
                  >
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid="faq-no-results">
              {t('faq.noResults')}
            </h3>
            <p className="text-gray-600">
              {t('faq.tryDifferent')}
            </p>
          </div>
        )}

        {/* Contact Support Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-orange-500 rounded-lg shadow-lg p-8 text-white">
            <MessageCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">
              {t('faq.stillNeedHelp')}
            </h2>
            <p className="text-blue-50 mb-6 max-w-md mx-auto">
              {t('nav.contactAdmin')}
            </p>
            <Link href="/contact-admin">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                data-testid="button-contact-support"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {t('faq.contactSupport')}
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
