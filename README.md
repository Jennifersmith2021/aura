# Aura — Personal Style & Beauty Companion

A mobile-first Next.js web app for closet management, makeup tracking, outfit planning, and AI-powered styling advice with local Amazon product search integration.

## Features

- **Closet Management**: Upload and organize clothing items by category, brand, price, and more.
- **Makeup Inventory**: Track makeup products with expiration dates and shelf-life warnings.
- **Outfit Planning**: Create and save outfit looks from your items.
- **Styling Advice**: Get AI-powered outfit and styling recommendations.
- **Shopping Integration**: Search Amazon and other retailers with pagination/infinite scroll.
- **Training & Wellness**: Track supplements, plan workouts, log sessions, and save affirmations with video links.
- **Offline-Ready**: All data persists to IndexedDB; optional server sync via Prisma + PostgreSQL.
- **Adult Content Safety**: Opt-in consent flow for adult-category products.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS v4, Framer Motion
- **Backend**: Next.js API Routes, Prisma 7 ORM, PostgreSQL (Docker)
- **Storage**: IndexedDB (client-side) + optional Prisma DB
- **Shopping**: Local FastAPI adapter + amazon-mcp package for real Amazon searches
- **AI**: Google Generative AI (Gemini) for styling advice

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Google Generative AI API Key (optional, for Gemini fallback)
# Get one at: https://aistudio.google.com/app/apikeys
GOOGLE_API_KEY=your_key_here

# Use local Amazon adapter (FastAPI + amazon-mcp)
USE_LOCAL_RETAILER_ADAPTER=true
RETAILER_ADAPTER_URL=http://localhost:8001
```

### 3. (Optional) Set up local Amazon adapter

If you want to search real Amazon products, install and run the local FastAPI adapter:

```powershell
# Create Python venv and install adapter dependencies
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r api-adapter/requirements.txt

# In a separate terminal, run the adapter
uvicorn api-adapter.adapter:app --reload --port 8001
```

See `api-adapter/README.md` for detailed setup, including `amazon-mcp` configuration.

### 4. (Optional) Set up PostgreSQL database

If you want server-side data persistence:

```powershell
# Start Docker container with PostgreSQL
docker-compose up -d

# Apply Prisma migrations
npx prisma db push
```

### 5. Run the development server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using Aura.

## Project Structure

```
src/
  app/           # Next.js pages and API routes
  components/    # Reusable React components
  hooks/         # Custom hooks (useStore, useWeather, etc.)
  types/         # TypeScript type definitions
  utils/         # Utility functions
  lib/           # Shared libraries (retailer adapter)

api-adapter/     # FastAPI server for amazon-mcp integration
  adapter.py     # Main FastAPI app
  requirements.txt
  README.md

docker-compose.yml  # PostgreSQL Docker setup
prisma/            # Database schema
```

## Learn More

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://pris.ly/d/prisma-schema
- **Google Generative AI**: https://github.com/google/generative-ai-js
- **amazon-mcp**: https://pypi.org/project/amazon-mcp/
- **TailwindCSS**: https://tailwindcss.com

## Deployment

For production, deploy the Next.js app to Vercel or any Node.js host. The FastAPI adapter can run:
- Locally for development
- In a separate Docker container
- Behind a reverse proxy (nginx, etc.)

Ensure environment variables are configured on your deployment platform (Vercel, AWS, etc.).

## License

Personal project — no license specified.
