# Deployment Guide for FocusBee

This guide explains how to deploy the FocusBee application with its separate WebSocket server.

## Architecture Overview

The FocusBee application consists of two parts:

1. **Next.js Frontend** - Deployed on Vercel
2. **WebSocket Server** - Deployed on Render

## WebSocket Server Deployment (Render)

### 1. Prepare the WebSocket Server

The WebSocket server is located in the `websocket-server/` directory and is ready for deployment.

### 2. Deploy to Render

1. **Create a new Web Service** on [Render](https://render.com)
2. **Connect your repository**
3. **Configure the service:**
   - **Root Directory**: `websocket-server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### 3. Environment Variables

Add these environment variables in your Render service:

```
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-custom-domain.com
SERVER_ID=focusbee-ws-production
```

**Important:** Replace `your-vercel-app.vercel.app` with your actual Vercel deployment URL.

### 4. Get Your WebSocket URL

After deployment, Render will provide a URL like:
`https://your-websocket-server.onrender.com`

## Frontend Deployment (Vercel)

### 1. Configure Environment Variables

In your Vercel project settings, add:

```
NEXT_PUBLIC_WEBSOCKET_URL=https://your-websocket-server.onrender.com
```

### 2. Deploy to Vercel

1. **Connect your repository** to Vercel
2. **Set the root directory** to `/` (the main project directory)
3. **Deploy**

## Local Development

### 1. WebSocket Server

```bash
cd websocket-server
npm install
cp .env.example .env
npm run dev
```

### 2. Frontend

```bash
# In the main project directory
cp .env.example .env.local
# Edit .env.local to use local WebSocket server
npm install
npm run dev
```

### 3. Environment Configuration

For local development, your `.env.local` should contain:

```
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
```

## Testing the Deployment

1. **Health Check**: Visit `https://your-websocket-server.onrender.com/health`
2. **WebSocket Connection**: Test the connection from your deployed frontend
3. **Cross-Device Testing**: Test connecting from different devices

## Security Considerations

1. **CORS Configuration**: Only allow your frontend domains in `ALLOWED_ORIGINS`
2. **HTTPS**: Ensure both services use HTTPS in production
3. **Rate Limiting**: Consider implementing rate limiting for production use

## Monitoring

- **Render**: Monitor your WebSocket server logs and metrics
- **Vercel**: Monitor your frontend deployment and analytics
- **Health Endpoint**: Set up uptime monitoring for `/health`

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**

   - Check `NEXT_PUBLIC_WEBSOCKET_URL` environment variable
   - Verify CORS settings in WebSocket server
   - Ensure WebSocket server is running

2. **CORS Errors**

   - Update `ALLOWED_ORIGINS` in WebSocket server
   - Verify frontend domain is included

3. **Mobile Connection Issues**
   - Ensure using HTTPS URLs
   - Check mobile network connectivity
   - Verify WebSocket server is accessible from mobile networks

## Cost Optimization

### Render (WebSocket Server)

- Use the free tier for testing
- Upgrade to paid plan for production use
- Monitor resource usage

### Vercel (Frontend)

- Free tier is usually sufficient for small projects
- Monitor bandwidth and function execution limits
