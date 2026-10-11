<!-- InstaShare README -->

<div align="center">
  <img src="https://raw.githubusercontent.com/jeetshawXX/insta-share/main/frontend/public/instashare-logo.png" alt="InstaShare logo" width="120" />
  <h1>InstaShare</h1>
  <p><strong>Real-time chat. Code sharing. One room.</strong></p>
  <p>Collaborate instantly with a simple room-based space for conversations and sharing code.</p>
  <p>
    <a href="https://insta-share-ten.vercel.app/"><strong>🌐 Live Demo</strong></a>
    ·
    <a href="https://github.com/jeetshawXX/insta-share"><strong>📦 Source Code</strong></a>
  </p>
  <p>
    <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
    <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-real--time-black?logo=socket.io" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-powered-646CFF?logo=vite&logoColor=white" />
    <img alt="Supabase" src="https://img.shields.io/badge/Supabase-integrated-3FCF8E?logo=supabase&logoColor=white" />
  </p>
</div>

---

## 📸 Screenshots

### Landing page
<p align="center">
  <a href="https://insta-share-ten.vercel.app/">
    <img src="https://image.thum.io/get/width/1200/crop/800/noanimate/https://insta-share-ten.vercel.app/" alt="InstaShare landing page screenshot" width="100%" />
  </a>
</p>

### Room experience
<p align="center">
  <a href="https://insta-share-ten.vercel.app/">
    <img src="https://image.thum.io/get/width/1200/crop/800/noanimate/https://insta-share-ten.vercel.app/room/demo" alt="InstaShare room interface preview" width="100%" />
  </a>
</p>

> Screenshots are generated from the live deployment. Open the demo to explore the current interface and create a real room.

## ✨ Overview

**InstaShare** is a web-based, room-oriented collaboration app designed to make it easy to connect and share code in real time. The project includes a React frontend and a TypeScript/Node.js backend, with Socket.IO for real-time communication and Supabase integration.

## 🚀 Features

- **Room-based collaboration** — navigate to a room using its room code.
- **Real-time communication** — Socket.IO is included for event-driven, live interactions.
- **Code sharing experience** — a code-focused interface with syntax-highlighting support.
- **Shareable rooms** — invite others to join the same room.
- **Responsive web interface** — modern frontend built with React and Tailwind CSS.
- **Helpful project pages** — includes workflow guidance, FAQs, and a privacy policy.
- **Deployed demo** — try the app without setting it up locally.

## 🧰 Tech stack

| Area | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling & UI | Tailwind CSS, Radix UI, shadcn-style components, Lucide |
| Routing & data | React Router, TanStack Query |
| Real-time | Socket.IO client and server |
| Backend | Node.js, Express, TypeScript |
| Data integration | Supabase |
| Code presentation | Prism.js |

## 🖥️ Try the live app

Visit **[insta-share-ten.vercel.app](https://insta-share-ten.vercel.app/)** to explore InstaShare.

1. Open the live application.
2. Follow the on-screen flow to create or join a room.
3. Share the room with collaborators and use the tools available inside it.

The exact available actions may depend on the current deployment and configuration.

## 🛠️ Run locally

### Prerequisites

- Node.js 18 or newer
- Bun (recommended, as lockfiles are included)
- A Supabase project and the configuration required by the application

### 1. Clone the repository

```bash
git clone https://github.com/jeetshawXX/insta-share.git
cd insta-share
```

### 2. Install frontend dependencies

```bash
cd frontend
bun install
```

Start the frontend development server:

```bash
bun run dev
```

### 3. Install backend dependencies

In a second terminal, from the repository root:

```bash
cd backend
bun install
```

Configure the backend's environment variables for your own Supabase and server setup before starting it. Do not commit credentials or secret keys.

Start the backend in development mode:

```bash
bun run dev
```

> **Configuration note:** The frontend and backend must be configured to communicate with the correct backend URL and services. Check the source configuration and deployment environment variables before running a local instance.

## 📁 Project structure

```text
insta-share/
├── frontend/
│   ├── public/           # Logo, background assets and demo video
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── hooks/       # Custom React hooks
│       ├── lib/         # Shared utilities
│       └── pages/       # Landing, room, FAQ, workflow and privacy pages
└── backend/
    └── src/
        ├── server.ts    # Express / Socket.IO server
        ├── database.ts  # Data access
        ├── storage.ts   # Storage helpers
        └── supabase.ts  # Supabase client setup
```

## 🎬 Demo video

A demo video is available in the repository: [Watch or download the InstaShare demo](https://github.com/jeetshawXX/insta-share/blob/main/frontend/public/instashare-demo-video.mp4).

## 🔐 Security & privacy

- Keep Supabase keys, database credentials, and other secrets in environment variables.
- Never commit local `.env` files or production credentials.
- Review the in-app [Privacy Policy](https://insta-share-ten.vercel.app/privacy-policy) for the application's published privacy information.

## 🧪 Useful commands

Run these commands from the relevant directory.

**Frontend**
```bash
bun run dev
bun run build
bun run lint
bun run typecheck
```

**Backend**
```bash
bun run dev
bun run build
bun run typecheck
bun run start
```

## 🗺️ Useful links

- **Live application:** https://insta-share-ten.vercel.app/
- **Repository:** https://github.com/jeetshawXX/insta-share
- **Workflow guide:** https://insta-share-ten.vercel.app/workflow
- **FAQ:** https://insta-share-ten.vercel.app/faq
- **Privacy policy:** https://insta-share-ten.vercel.app/privacy-policy

## 🤝 Contributing

Suggestions, bug reports, and improvements are welcome. Please open an issue to discuss a substantial change before submitting a pull request.

## 👨‍💻 Author

**Jeet Shaw**

- GitHub: [@jeetshawXX](https://github.com/jeetshawXX)

---

<div align="center">
  <sub>Built to make real-time collaboration simpler with InstaShare.</sub>
</div>
