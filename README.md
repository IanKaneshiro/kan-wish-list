# Christmas Wishlist Web App

A collaborative web platform for creating and sharing holiday wishlists within groups. Built with Next.js, MongoDB, and real-time features.

## Features

- 🎄 **Group Wishlists**: Create and join groups to share wishlists with family and friends
- 🎁 **Secret Gift Claiming**: Claim gifts without the recipient knowing (surprise preserved!)
- 💰 **Group Funding**: Pool money for expensive gifts with multiple contributors
- 🔄 **Real-time Updates**: See changes instantly with Socket.io
- 🎨 **Festive Animations**: Christmas-themed animations (can be disabled for accessibility)
- 📱 **Responsive Design**: Works great on all devices
- 🔔 **Smart Notifications**: In-app and optional email notifications

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (Google OAuth)
- **Drag & Drop**: @dnd-kit
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (Atlas account or local instance)
- Google OAuth credentials

### Installation

1. Clone the repository

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- (Optional) Email server configuration for notifications

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Set these in Vercel:

```
MONGODB_URI=<your-mongodb-atlas-uri>
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-new-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
EMAIL_SERVER=<optional-smtp-server>
EMAIL_FROM=<optional-sender-email>
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── ...
├── components/            # React components
│   ├── animations/       # Christmas animations
│   ├── layout/           # Layout components
│   ├── ui/               # Reusable UI components
│   └── wishlist/         # Wishlist-specific components
├── lib/                   # Utilities and configurations
│   ├── models/           # MongoDB models
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database connection
│   └── socket.ts         # Socket.io setup
└── types/                 # TypeScript type definitions
```

## Key Features Implementation

### Secret Claiming

Items claimed by non-owners are hidden from the wishlist owner but visible to other group members.

### Group Funding

Multiple users can contribute to a single gift with pledge tracking and payment links.

### Real-time Updates

Socket.io broadcasts events for claims, funding updates, and item changes.

## License

MIT
