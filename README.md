# InstaShare

A real-time anonymous collaboration platform for instant communication, code sharing, and media exchange.

## Live Demo

Frontend: https://insta-share-ten.vercel.app

Backend API: https://insta-share-aw41.onrender.com

## Features

* Real-time messaging using Socket.IO
* Anonymous room creation
* Join rooms using room codes
* Room-specific usernames
* Password-protected rooms
* Code snippet sharing with syntax highlighting
* Image and video sharing
* Participant presence tracking
* Typing indicators
* Message replies
* Emoji reactions
* Automatic room cleanup

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Socket.IO Client
* Supabase

### Backend

* Node.js
* Express
* TypeScript
* Socket.IO
* Supabase

### Database & Storage

* Supabase PostgreSQL
* Supabase Storage

## Architecture

Frontend (React + Vite)
|
|
Socket.IO / REST
|
|
Backend (Express + Socket.IO)
|
|
Supabase Database + Storage

## Installation

### Clone Repository

```bash
git clone https://github.com/jeetshawXX/insta-share.git
cd insta-share
```

### Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=3001
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY
SUPABASE_BUCKET=room-media
FRONTEND_URL=http://localhost:8080
```

Run:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_WS_URL=http://localhost:3001
VITE_SUPABASE_BUCKET=room-media
```

Run:

```bash
npm run dev
```

## Deployment

Frontend deployed on Vercel.

Backend deployed on Render.

Database and storage powered by Supabase.

## Future Improvements

* End-to-end encryption
* Room analytics dashboard
* PWA support
* AI-assisted code explanations
* Message search
* Temporary guest links

## Author

Jeet Shaw

GitHub: https://github.com/jeetshawXX
