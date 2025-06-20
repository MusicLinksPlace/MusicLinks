import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQSection = ({ items = [] }) => {
  if (items.length === 0) {
    const defaultFaqItems = [
      {
        question: "Y a-t-il des questions fréquemment posées ?",
        answer: "Il semble qu'aucune question n'ait encore été configurée pour ce profil."
      }
    ];
    items = defaultFaqItems;
  }

  return (
    <div className="bg-white px-6 pb-6 rounded-b-2xl">
      <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Questions Fréquemment Posées</h3>
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="font-semibold text-gray-800 hover:text-blue-600 text-left hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

export default FAQSection; 