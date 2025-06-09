# AncestryChain Deployment Guide

## Quick Start

### 1. Environment Setup

Copy the appropriate environment template:

**For Development:**
```bash
cp .env.local.template .env.local
```

**For Production:**
```bash
cp .env.production.template .env.production
```

Edit the environment file and fill in your actual values:
- Supabase URL and keys
- NextAuth.js secret and URL
- Google OAuth credentials

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### 4. Docker Deployment

```bash
# Build the container
docker-compose build --no-cache

# Start the services
docker-compose up -d

# Check health
curl http://localhost:3000/api/health
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@host:5432/db` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | `your-secret-key` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-abcdefghijklmnop` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `APP_NAME` | Application name | `AncestryChain` |
| `RESEND_API_KEY` | Email service API key | - |

## Health Check

The application includes a health check endpoint at `/api/health` that returns:

```json
{
  "status": "ok",
  "timestamp": "2025-06-08T16:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

## Troubleshooting

### Common Issues

1. **Docker build fails**
   - Ensure all MongoDB references are removed
   - Check that environment variables are properly set
   - Verify Docker daemon is running

2. **Health check fails**
   - Check if the application is running on port 3000
   - Verify the health endpoint is accessible
   - Check Docker container logs

3. **Environment variable errors**
   - Ensure all required variables are set
   - Check variable naming (NEXT_PUBLIC_ prefix for client-side)
   - Verify Supabase credentials are correct

### Debugging Commands

```bash
# Check container status
docker-compose ps

# View application logs
docker-compose logs app

# Test health endpoint
curl -v http://localhost:3000/api/health

# Check environment variables
docker-compose exec app env | grep NEXT_PUBLIC
```

## Production Deployment

1. Set up production environment variables
2. Configure domain and SSL certificates
3. Update NEXTAUTH_URL to production domain
4. Deploy using Docker or your preferred platform
5. Monitor health endpoint for service status

## Support

For issues related to these fixes, check:
1. Environment variable configuration
2. Docker container health
3. Supabase connectivity
4. Application logs

