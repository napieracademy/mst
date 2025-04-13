import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendContactFormEmail, addContact } from '@/services/email/resend';
import { z } from 'zod';

// Email request validation schema
const contactFormSchema = z.object({
  name: z.string().min(1, 'Nome è richiesto'),
  email: z.string().email('Email non valida'),
  message: z.string().min(10, 'Il messaggio deve contenere almeno 10 caratteri'),
  subscribeNewsletter: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    try {
      contactFormSchema.parse(body);
    } catch (error) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error },
        { status: 400 }
      );
    }
    
    const { name, email, message, subscribeNewsletter } = body;
    
    // Send email using the contact form template
    const result = await sendContactFormEmail({
      name,
      email,
      message,
    });
    
    if (!result.success) {
      console.error('Failed to send email:', result.error);
      return NextResponse.json(
        { error: 'Errore durante l\'invio dell\'email' },
        { status: 500 }
      );
    }
    
    // Se l'utente ha richiesto di iscriversi alla newsletter, aggiungi il contatto a Resend
    if (subscribeNewsletter) {
      const names = name.split(' ');
      const firstName = names[0];
      const lastName = names.length > 1 ? names.slice(1).join(' ') : '';
      
      try {
        await addContact({
          email,
          firstName,
          lastName,
          unsubscribed: false,
        });
        
        console.log(`Utente ${email} aggiunto alla mailing list`);
      } catch (error) {
        // Non blocchiamo la risposta se l'aggiunta alla mailing list fallisce
        console.error('Failed to add contact to Resend:', error);
      }
    }
    
    return NextResponse.json({ success: true, message: 'Email inviata con successo' });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}