import { ContactForm } from '@/components/contact/contact-form';

export const metadata = {
  title: 'Contact Us | Mastroianni',
  description: 'Contact us through this form and we will get back to you as soon as possible.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Contattaci</h1>
      
      <div className="max-w-2xl mx-auto">
        <p className="text-gray-600 mb-8 text-center">
          Hai domande, suggerimenti o desideri collaborare? Compila il modulo sottostante
          e ti risponderemo al più presto.
        </p>
        
        <ContactForm />
      </div>
    </div>
  );
}