# FocusBee

A modern focus and productivity application with real-time synchronization between web and mobile devices.

## Architecture

FocusBee consists of two main components:

- **Next.js Frontend** - Web interface deployed on Vercel
- **WebSocket Server** - Real-time communication server deployed on Render

## Features

- 🎯 Focus sessions with customizable timers
- 📱 Mobile and web synchronization
- 🔄 Real-time updates between devices
- 🎵 Ambient sounds and notifications
- 📊 Session tracking and analytics
- 🔗 QR code session sharing

## Quick Start

### Local Development

1. **Clone the repository**

```bash
git clone <repository-url>
cd focusbee
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Start the WebSocket server**

```bash
cd websocket-server
npm install
cp .env.example .env
npm run dev
```

5. **Start the frontend** (in a new terminal)

```bash
# In the main project directory
npm run dev
```

6. **Open the application**
   - Web: [http://localhost:3000](http://localhost:3000)
   - WebSocket Health: [http://localhost:3001/health](http://localhost:3001/health)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Summary

1. **WebSocket Server** → Deploy `websocket-server/` to Render
2. **Frontend** → Deploy main project to Vercel
3. **Configure** environment variables in both services

## Project Structure

```
focusbee/
├── src/                    # Next.js application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utilities and configuration
├── websocket-server/      # Standalone WebSocket server
│   ├── server.js         # WebSocket server implementation
│   ├── package.json      # Server dependencies
│   └── README.md         # Server documentation
└── public/               # Static assets
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **WebSocket**: Socket.IO, Node.js
- **Database**: Supabase
- **Authentication**: Firebase Auth
- **Deployment**: Vercel (frontend) + Render (WebSocket)

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### WebSocket Server (.env)

```
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
