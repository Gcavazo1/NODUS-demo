import { NextRequest, NextResponse } from 'next/server';
// import { headers } from 'next/headers'; // Unused in demo
// import crypto from 'crypto'; // Unused in demo
// import { Event } from 'coinbase-commerce-node'; // Unused in demo
// import { getAdminFirestoreInstance } from '@/lib/firebase-admin'; // Unused in demo
// import { // Unused in demo
//   checkWebhookEventProcessed,
//   recordWebhookEvent,
//   updateWebhookEventStatus,
//   checkPaymentExistsByMetadata,
//   processCompletedCoinbaseCharge,
//   WebhookPayload
// } from '@/lib/server-firestore';
// import { CoinbaseWebhookEvent } from '@/types/coinbase'; // Unused in demo

// Coinbase Commerce webhook handler - DISABLED FOR DEMO
export async function POST(request: NextRequest) {
  // --- Verify the webhook signature (DISABLED FOR DEMO) --- 
  /* // Original verification logic
  const headersList = headers();
  const signature = headersList.get('x-cc-webhook-signature');
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: 'Coinbase signature missing' }, { status: 400 });
  }

  const webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
  if (!webhookSecret) {
     console.error('Coinbase webhook secret is not set.');
     return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Event;
  try {
    // Verify the event using the library
    // Note: The library might have internal issues or require specific Node crypto features
    event = Event.verifyWebhookSig(rawBody, signature, webhookSecret);
  } catch (error: any) {
    console.error('Error verifying Coinbase webhook signature:', error.message);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }
  */
  
  // --- Log receipt and exit (DEMO MODE) ---
   console.log("[DEMO MODE] Coinbase webhook endpoint hit, but processing is disabled.");
   try {
     const body = await request.json(); // Try to parse body for logging
     console.log("[DEMO MODE] Received Coinbase event type:", body?.event?.type);
   } catch { // Remove unused variable declaration
     console.warn("[DEMO MODE] Could not parse Coinbase webhook body.")
   }
   return NextResponse.json({ received: true, message: "Demo mode: Coinbase webhook processing disabled." });

/* --- Original Event Handling Logic (Disabled for Demo) ---
  const db = await getAdminFirestoreInstance();
  
  // Check if event already processed (implement this logic)
  const isProcessed = await checkWebhookEventProcessed(db, event.id, 'coinbase');
  if (isProcessed) {
     return NextResponse.json({ received: true, message: 'Event already processed' });
  }

  // Record the webhook event
  const webhookEventRef = await recordWebhookEvent(
    db,
    event.id,
    'coinbase',
    event.type,
    event as unknown as WebhookPayload // Cast might need refinement
  );

  try {
    // Handle specific event types
    if (event.type === 'charge:confirmed' || event.type === 'charge:resolved') {
      const charge = event.data as CoinbaseWebhookEvent['data']; // Use type
      
      // Check if payment exists using metadata (implement logic)
      const paymentExists = await checkPaymentExistsByMetadata(db, charge.metadata); 
      if (paymentExists) {
          await updateWebhookEventStatus(webhookEventRef, 'skipped_duplicate');
          return NextResponse.json({ received: true, message: 'Payment already exists' });
      }
      
      // Process the confirmed/resolved charge
      const result = await processCompletedCoinbaseCharge(db, charge);
      await updateWebhookEventStatus(
        webhookEventRef, 
        result.success ? 'processed' : 'failed', 
        result.error
      );
    } else if (event.type === 'charge:failed') {
      // Handle failed charge - update status, notify admin, etc.
       console.warn(`Coinbase charge failed: ${event.data.code}`);
       await updateWebhookEventStatus(webhookEventRef, 'processed_failed_charge'); // Mark as processed
    } else {
      // Handle other event types if necessary
       console.log(`Received unhandled Coinbase event type: ${event.type}`);
       await updateWebhookEventStatus(webhookEventRef, 'processed_unhandled');
    }

    // Return a 200 OK response to Coinbase
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error processing Coinbase event:', error);
    if (webhookEventRef) {
      await updateWebhookEventStatus(webhookEventRef, 'failed', error.message);
    }
    return NextResponse.json(
      { error: 'Error processing Coinbase event' },
      { status: 500 }
    );
  }
*/
} 