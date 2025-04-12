import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Default email sender
const DEFAULT_FROM = 'noreply@mastroianni.app';

/**
 * Send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 * @param {string} options.text - Plain text content of the email
 * @param {string} [options.from] - Sender email address (defaults to noreply@mastroianni.app)
 * @returns {Promise} - Promise resolving to the email send result
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = DEFAULT_FROM,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}) {
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Send a templated email (example for contact form)
 */
export async function sendContactFormEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const subject = `Nuovo messaggio da ${name}`;
  
  const html = `
    <div>
      <h1>Nuovo messaggio dal sito</h1>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <div>
        <strong>Messaggio:</strong>
        <p>${message}</p>
      </div>
    </div>
  `;
  
  const text = `
    Nuovo messaggio dal sito
    Nome: ${name}
    Email: ${email}
    Messaggio: ${message}
  `;
  
  return sendEmail({
    to: 'contatti@mastroianni.app', // Replace with your admin email
    subject,
    html,
    text,
  });
}