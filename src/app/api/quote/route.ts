import { NextResponse } from 'next/server';
// Removed Firestore imports: getAdminFirestoreInstance, FieldValue
// Removed Email import: sendQuoteAcknowledgementEmail
// Kept definitions and siteConfig if needed for validation/response structure
// import { QuoteRequest } from '@/lib/definitions'; 
// import { siteConfig } from '@/config/site'; 

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Interface for Firestore data (kept for structure reference, but not used for writing)
/*
interface QuoteRequestData {
  name: string;
  email: string;
  projectType: string;
  description: string;
  company?: string;
  phone?: string;
  budget?: string;
  timeline?: string;
  status: string; 
  createdAt: FieldValue; 
  updatedAt: FieldValue; 
}
*/

export async function POST(request: Request) {
  console.log('--- DEMO MODE: QUOTE API ROUTE HIT ---');
  
  // --- Database Initialization Removed ---
  /*
  let db;
  try {
    db = await getAdminFirestoreInstance();
    console.log('[Quote API] Firestore Admin instance obtained.');
  } catch (error) {
    console.error('[Quote API] Error getting Firestore instance:', error);
    return NextResponse.json({ error: 'Failed to initialize database connection.' }, { status: 500 });
  }
  */

  try {
    const body = await request.json();
    console.log("[Quote API - Demo] Quote submission received (not saved):", body);

    // --- Input Validation (Kept) ---
    if (!body.email || !body.message) {
      return NextResponse.json({ error: 'Missing required fields (email, message).' }, { status: 400 });
    }
    if (typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }
    if (typeof body.message !== 'string' || body.message.length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters long.' }, { status: 400 });
    }
    // --- End Validation ---

    // --- Firestore Write Removed ---
    /*
    const quoteData: QuoteRequestData = { ... }; // Prepare data
    const quoteRef = await db.collection('quoteRequests').add(quoteData);
    const requestId = quoteRef.id;
    console.log(`[Quote API] Quote request ${requestId} added successfully.`);
    */
    const demoRequestId = `demo-${Date.now()}`;
    console.log(`[Quote API - Demo] Simulated successful submission with ID: ${demoRequestId}.`);

    // --- Email Sending Removed ---
    /*
    if (process.env.RESEND_API_KEY && quoteDataForEmail) {
       // ... email sending logic ...
    } else {
      console.log(`[Quote API] Skipping quote acknowledgement email: Resend API key not configured.`);
    }
    */
   console.log("[Quote API - Demo] Skipping database save and email notification.");

    // --- Return Demo Success Response ---
    return NextResponse.json({ 
      message: "Demo Mode: Quote request simulated successfully!", 
      requestId: demoRequestId, // Provide a dummy ID
      demo: true
    });

  } catch (error) {
    console.error("[Quote API - Demo] Error processing quote request:", error);
    // Handle JSON parsing errors or other specific errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    // Generic error
    return NextResponse.json({ error: 'Failed to process quote request (Demo Mode).' }, { status: 500 });
  }
} 