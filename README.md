**Mail AI — Intelligent Email Management Client**

An AI-powered web client built on Next.js 15 that integrates directly with the Gmail API to simplify inbox management, automated email drafting, translation, and natural language assistance.

**Key Features**

Google OAuth & Authentication: Secure sign-in leveraging NextAuth.js and Google OAuth 2.0 API flows.

Email Management: Fetch, filter, and view Gmail messages in real time with custom UI components (EmailList, EmailDetail, Filters).

AI Assistant & Chat: In-app AI agent integrated into the dashboard to assist with email queries, summarizing threads, and auto-composing responses.

Smart Utils: Built-in translation (utils/translator.js) and email formatting logic (utils/email-formatter.js).

State Management: Reactive, persistent client-side application state managed using Zustand (store/appState.ts).

**Technical Stack & Architecture**

Framework: Next.js 15 (App Router)

Language: TypeScript & JavaScript (ESNext)

Styling: Tailwind CSS / PostCSS

Authentication: NextAuth.js (app/api/auth/[...nextauth])

State Management: Zustand (store/appState.ts)

External APIs: Google OAuth 2.0, Gmail REST API, AI/LLM Provider API

**Project Architecture**


<img width="547" height="437" alt="image" src="https://github.com/user-attachments/assets/382a232a-b7a3-4414-a008-12c4f943308f" />



**Getting Started**

**Prerequisites**

Node.js 18.x or higher

npm / yarn / pnpm

Google Cloud Console account with Gmail API & OAuth 2.0 enabled

**Installation**
1) Clone the repository (Private Access Required):

   git clone https://github.com/<your-username>/mail-ai.git
   cd mail-ai

2) Install dependencies:

   npm install

3) Configure Environment Variables:

   Create a .env.local file in the root directory and add the following keys:

# NextAuth Config

NEXTAUTH_URL=http://localhost:3000

NEXTAUTH_SECRET=your_generated_nextauth_secret

# Google OAuth Credentials

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Agent / LLM API Key

AI_API_KEY=your_ai_provider_api_key

4) Run the Development Server:

   npm run dev

5) Open http://localhost:3000 in your browser.

**Key Architecture Decisions & Trade-offs**

1) Next.js App Router API Routes over Direct Client Calls

   Decision: All Gmail API interactions and AI operations are proxied through Server Routes (app/api/gmail, app/api/assistant).

   Trade-off: Adds minor server latency compared to direct client fetching, but prevents leakages of OAuth tokens and LLM API keys to the client side.

2) Client-State Management via Zustand

   Decision: Used Zustand (store/appState.ts) for global UI states (selected thread, assistant panel visibility, active draft) rather than native React Context.

   Trade-off: Adds a minimal bundle dependency, but significantly eliminates unnecessary re-renders across heavy components like EmailList and AssistantChat.

3) Hybrid TypeScript/JavaScript Approach for Utilities

   Decision: Kept high-level pages and API contracts strictly typed (.ts / .tsx), while maintaining rapid script iterations in utils and lib/ai/assistant.js.

   Trade-off: Reduces compile-time checking overhead for AI string manipulation, but requires runtime validation checks.

**Images/Screenshots**

<img width="1911" height="948" alt="Screenshot 2026-09-08 032631" src="https://github.com/user-attachments/assets/f1bc6eef-945a-47e5-b27b-dc87fb21780d" />

<img width="1917" height="922" alt="Screenshot 2026-09-08 032704" src="https://github.com/user-attachments/assets/df02236e-1d10-40cf-aa5f-e5876d340628" />

<img width="1916" height="912" alt="Screenshot 2026-09-08 032743" src="https://github.com/user-attachments/assets/68c32514-a911-44d2-8308-bccb2b8a6078" />

<img width="1898" height="896" alt="Screenshot 2026-09-08 034808" src="https://github.com/user-attachments/assets/f363143e-38c5-40e3-9378-67a8b600f0a8" />

**Demo**

https://github.com/Anusha-Raju2004/mail-ai/releases/download/v1.0.0/mail-ai-demo.mp4
