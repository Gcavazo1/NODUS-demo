# Nodus Payment Hub - Demo Build 🚀

> A **demonstration version** of the Nodus Payment Hub template. This build showcases the frontend UI, client-side interactions, and simulated payment flows without requiring backend secrets or processing actual payments.

--- 

## ✨ Demo Features & Limitations

This demo build includes most of the frontend features:

- **Simulated Stripe Checkout:** Initiates a Stripe-like flow but redirects to a success page without actual payment processing.
- **Simulated Coinbase Checkout:** Initiates a Coinbase-like flow but redirects to a success page without actual payment processing.
- **Simulated Quotes:** Quote form saves data to **browser Local Storage** instead of Firestore.
- **Simulated Admin Dashboard:** Admin sections for Appearance and Payments read/write settings to **browser Local Storage**.
- 🎨 **Configurable Offerings:** Still defined in `src/config/offerings.ts`.
- 🧱 **Component-Based:** Built with shadcn/ui, Tailwind CSS, and reusable components.
- 📱 **Responsive Design:** Mobile-first layout with drawer navigation.
- 🌗 **Dark/Light Mode:** Theme support via `next-themes`.
- 🔗 **Dynamic Footer Links:** Manageable through the *simulated* admin panel (saved to Local Storage).
- ☁️ **Deploy-Ready:** Optimized for Vercel frontend deployment.

**Key Limitations:**

- **No Real Payments:** Payment processing is simulated on the client-side.
- **No Server-Side Logic:** API routes for webhooks, actual quote saving, etc., are disabled or bypassed.
- **No Real Admin Auth:** Admin panel does not use Firebase Auth; settings are stored locally and insecurely.
- **No Email Confirmations:** Resend integration is not used.
- **No Firestore Interaction:** Data is saved to Local Storage for demonstration purposes.

--- 

## 🛠 Tech Stack (Demo Build)

| Layer         | Tool/Service         | Purpose                               |
| ------------- | -------------------- | ------------------------------------- |
| Frontend      | Next.js (App Router) | Modern, scalable React framework      |
| UI            | Tailwind CSS         | Utility-first CSS styling             |
| Components    | shadcn/ui            | Reusable UI components                |
| Hosting       | Vercel (Recommended) | CI/CD, Preview Deployments            |
| Payments (Sim)| Stripe (Client-Side) | *Simulated* Card/Wallet Checkout Flow |
|               | Coinbase (Client-Side)| *Simulated* Crypto Checkout Flow      |
| Demo Storage  | Browser Local Storage| Demo Quote/Admin Settings             |

--- 

## 🚀 Getting Started (Demo Build)

1. **Clone:**

   ```bash
   # Ensure you have the correct repository URL for the demo build
   git clone https://github.com/your-github-username/nodus-demo-build.git 
   cd nodus-demo-build
   ```
2. **Install Dependencies:**

   ```bash
   npm install
   # or yarn / pnpm
   ```
3. **Environment Variables:**

   - Copy `.env.example` to `.env.local`.
   - **Crucially, only `NEXT_PUBLIC_` variables are needed for the demo.** Fill these in:
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Test key is fine)
     - `NEXT_PUBLIC_FIREBASE_...` variables (Needed for Firebase SDK initialization, even without backend use)
     - `NEXT_PUBLIC_APP_URL` (Set to `http://localhost:3000` for local dev)
   - **Secret keys (like `STRIPE_SECRET_KEY`, `COINBASE_COMMERCE_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_JSON`) are NOT required for this demo build.**

   ```bash
   cp .env.example .env.local
   # Now edit .env.local with only the required NEXT_PUBLIC_ keys
   ```

4. **Run Development Server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

--- 

## 🧱 Architecture Overview

(Remains largely the same as the original template, but API routes in `src/app/api/` are mostly disabled or modified for demo purposes).

```plaintext
/
├── public/             # Static assets
├── src/
│   ├── app/            # App Router (pages, layouts, API routes - DEMO MODIFIED)
│   ├── components/       # Reusable UI components (shadcn/ui based)
│   ├── config/           # Site config (metadata, offerings, navigation)
│   ├── lib/              # Utilities, hooks, service clients (Firebase client SDK only)
│   ├── styles/           # Global CSS
│   └── types/            # TypeScript definitions
├── .env.example        # Environment variable template (Demo focused)
├── next.config.mjs     # Next.js config 
├── tailwind.config.js  # Tailwind config
└── package.json        # Dependencies & scripts
```

--- 

## 🔧 Customization (Demo Build)

- **Offerings:** Modify `src/config/offerings.ts`.
- **Site Info:** Edit `src/config/site.ts`.
- **Styling:** Update `tailwind.config.js` and global CSS.
- **Admin Panel Settings:** Interact with the admin panel in the running app to modify settings stored in your browser's Local Storage.
- **Background Images:** Replace `light-background.jpg` / `dark-background.jpg` in `/public` and adjust opacity in `src/app/layout.tsx`.

--- 

## ☁️ Deployment (Demo Build)

- **Frontend:** Deploy seamlessly to [Vercel](https://vercel.com/) by connecting your GitHub repository.
- **Backend/DB:** **No backend services (Firestore, Functions, Auth) are actively used or required for this demo build.**
- **Environment Variables:** Add ONLY the required `NEXT_PUBLIC_` variables to your Vercel project settings. **Crucially, set `NEXT_PUBLIC_APP_URL` to your actual Vercel deployment URL (e.g., `https://your-demo.vercel.app`).**
- **Webhooks:** **Not applicable/needed** for the demo build as backend processing is disabled.

--- 

## ⚠️ Security Note: Coinbase SDK

The `coinbase-commerce-node` SDK dependency might still be present and report vulnerabilities (`npm audit`). As the backend usage is disabled in the demo, the direct risk is minimal, but be aware if you intend to re-enable full functionality.

--- 

## 📈 Roadmap (Original Template)

(This roadmap applies to the full, non-demo version of the template)

- [ ] Admin Dashboard Foundation
- [ ] Responsive Design & Mobile Nav
- [ ] Dynamic Footer Links
- [ ] License Key Generation / Digital Delivery
- [ ] Optional CMS Integration (Contentful, Sanity)
- [ ] Enhanced Email Automation
- [ ] Additional Payment Gateways (Square, PayPal)
- [ ] BNPL Integration (Stripe Afterpay/Klarna)

--- 

## 📄 License

*(Consider adding a specific license file, e.g., `LICENSE.md`, and referencing it here. Example: This project is licensed under the [MIT License](LICENSE.md).)*
