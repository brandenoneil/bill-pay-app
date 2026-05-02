# Bill Pay Assistant

Scan paper bills with your phone camera, extract payment details automatically using Claude's vision AI, review and confirm, then pay with one click.

## Features

- 📸 Upload or photograph paper bills
- 🤖 AI extraction of biller name, account number, amount, due date, payment URL, and PIN
- ✏️ Edit any extracted field before saving
- 💳 One-click link to payment portal
- 📋 Bill history with pending / paid / skipped status tracking
- 🖼️ Original bill image stored with each record
- 💾 All data stored locally in your browser (no server storage)

## Setup

1. **Clone and install**
   ```bash
   cd bill-pay-assistant
   npm install
   ```

2. **Configure API key**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your Anthropic API key
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Deploy to Vercel** (recommended)
   - Push to GitHub
   - Connect to Vercel
   - Add `ANTHROPIC_API_KEY` environment variable in Vercel dashboard
   - Deploy

## Usage

1. Go to **Scan Bill** tab
2. Upload a photo or take one with your phone
3. Review extracted data — edit any incorrect fields
4. Click **Save Bill** to store it, or **Pay Now** to open the payment portal
5. Track payment status in the **History** tab

## Privacy

All bill data is stored in your browser's localStorage only. No data is sent to any server except the bill image to Anthropic's API for extraction (subject to Anthropic's privacy policy). The API key never leaves the server.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude Vision API
- Browser localStorage for persistence
