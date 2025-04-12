import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { ResendWebhookEvent } from './types';

// Webhook secret from environment variable
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

async function verifyWebhookSignature(payload: string, signature: string | null) {
  if (!WEBHOOK_SECRET) {
    console.warn('RESEND_WEBHOOK_SECRET is not set');
    return false;
  }
  
  if (!signature) {
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureUint8 = Uint8Array.from(
      signature.split(',').map(byte => parseInt(byte, 16))
    );

    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureUint8,
      encoder.encode(payload)
    );
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return false;
  }
}

// Email event handlers
async function handleEmailSent(data: ResendWebhookEvent['data']) {
  console.log('Email sent:', data);
  // Implement your email sent logic here
}

async function handleEmailDelivered(data: ResendWebhookEvent['data']) {
  console.log('Email delivered:', data);
  // Implement your email delivered logic here
}

async function handleEmailBounced(data: ResendWebhookEvent['data']) {
  console.log('Email bounced:', data);
  // Implement your bounce handling logic here
}

async function handleEmailComplained(data: ResendWebhookEvent['data']) {
  console.log('Email complained:', data);
  // Implement your complaint handling logic here
}

async function handleEmailOpened(data: ResendWebhookEvent['data']) {
  console.log('Email opened:', data);
  // Implement your email opened logic here
}

async function handleEmailClicked(data: ResendWebhookEvent['data']) {
  console.log('Email clicked:', data);
  // Implement your email clicked logic here
}

async function handleEmailDeliveryDelayed(data: ResendWebhookEvent['data']) {
  console.log('Email delivery delayed:', data);
  // Implement your delivery delay logic here
}

// Contact event handlers
async function handleContactCreated(data: ResendWebhookEvent['data']) {
  console.log('Contact created:', data);
  // Implement your contact created logic here
}

async function handleContactUpdated(data: ResendWebhookEvent['data']) {
  console.log('Contact updated:', data);
  // Implement your contact updated logic here
}

async function handleContactDeleted(data: ResendWebhookEvent['data']) {
  console.log('Contact deleted:', data);
  // Implement your contact deleted logic here
}

// Domain event handlers
async function handleDomainCreated(data: ResendWebhookEvent['data']) {
  console.log('Domain created:', data);
  // Implement your domain created logic here
}

async function handleDomainUpdated(data: ResendWebhookEvent['data']) {
  console.log('Domain updated:', data);
  // Implement your domain updated logic here
}

async function handleDomainDeleted(data: ResendWebhookEvent['data']) {
  console.log('Domain deleted:', data);
  // Implement your domain deleted logic here
}

export async function POST(request: Request) {
  const payload = await request.text();
  const headersList = headers();
  const signature = headersList.get('resend-signature');

  // Verify webhook signature
  const isValid = await verifyWebhookSignature(payload, signature);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  try {
    const event = JSON.parse(payload) as ResendWebhookEvent;

    // Handle different event types
    switch (event.type) {
      case 'email.sent':
        await handleEmailSent(event.data);
        break;
      case 'email.delivered':
        await handleEmailDelivered(event.data);
        break;
      case 'email.bounced':
        await handleEmailBounced(event.data);
        break;
      case 'email.complained':
        await handleEmailComplained(event.data);
        break;
      case 'email.opened':
        await handleEmailOpened(event.data);
        break;
      case 'email.clicked':
        await handleEmailClicked(event.data);
        break;
      case 'email.delivery_delayed':
        await handleEmailDeliveryDelayed(event.data);
        break;
      case 'contact.created':
        await handleContactCreated(event.data);
        break;
      case 'contact.updated':
        await handleContactUpdated(event.data);
        break;
      case 'contact.deleted':
        await handleContactDeleted(event.data);
        break;
      case 'domain.created':
        await handleDomainCreated(event.data);
        break;
      case 'domain.updated':
        await handleDomainUpdated(event.data);
        break;
      case 'domain.deleted':
        await handleDomainDeleted(event.data);
        break;
      default:
        console.warn('Unhandled event type:', event.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}