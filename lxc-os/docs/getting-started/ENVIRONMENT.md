# Environment Configuration Guide

> Complete guide to environment variables and configuration

## Overview

LearnXChain uses environment variables for configuration. All sensitive data and environment-specific settings are stored in the `.env` file.

---

## Environment File Setup

### Creating .env File

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

---

## Required Environment Variables

### Database Configuration

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

**Format Breakdown:**
- `username` - Database user
- `password` - Database password
- `host` - Database host (localhost or cloud URL)
- `port` - Database port (default: 5432)
- `database` - Database name
- `sslmode=require` - SSL mode (required for cloud databases)

**Examples:**

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/learnxchain"

# Neon (Cloud)
DATABASE_URL="postgresql://user:pass@ep-example.neon.tech/dbname?sslmode=require"

# Supabase (Cloud)
DATABASE_URL="postgresql://postgres:pass@db.example.supabase.co:5432/postgres"
```

---

### JWT Configuration

```env
# JWT secrets for token generation
JWT_ACCESS_TOKEN_SECRET=your_random_secret_minimum_32_characters_long
JWT_REFRESH_TOKEN_SECRET=another_random_secret_minimum_32_characters_long
JWT_SECRET=yet_another_random_secret_minimum_32_characters_long
```

**Generating Secure Secrets:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using online tool
# Visit: https://generate-secret.vercel.app/32
```

**Security Notes:**
- Use different secrets for each environment (dev, staging, prod)
- Never commit secrets to version control
- Rotate secrets periodically
- Minimum length: 32 characters

---

### Cloudinary Configuration (File Storage)

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret_here
```

**How to Get:**
1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

**Usage:**
- Student profile pictures
- Teacher documents
- School logos
- Assignment attachments
- ID cards

---

### Email Configuration

```env
# SMTP Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password_here
EMAIL_FROM=your_email@gmail.com
```

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate app password for "Mail"
4. Use generated password (not your Gmail password)

**Alternative Email Providers:**

**SendGrid:**
```env
SENDGRID_API_KEY=SG.your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

**Mailgun:**
```env
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
```

---

### SMS Configuration (Twilio)

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**How to Get:**
1. Sign up at [twilio.com](https://www.twilio.com/)
2. Get a phone number
3. Copy Account SID and Auth Token from Console

**Usage:**
- OTP verification
- Payment confirmations
- Attendance alerts
- Emergency notifications

---

### Payment Gateway (Razorpay)

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**How to Get:**
1. Sign up at [razorpay.com](https://razorpay.com/)
2. Go to Settings → API Keys
3. Generate Test/Live keys
4. Set up webhook secret

**Test vs Live:**
- Test keys start with `rzp_test_`
- Live keys start with `rzp_live_`
- Use test keys for development

---

### Stream.io Configuration (Video/Chat)

```env
STREAM_API_KEY=your_api_key
STREAM_API_SECRET=your_api_secret
STREAM_APP_ID=your_app_id
```

**How to Get:**
1. Sign up at [getstream.io](https://getstream.io/)
2. Create a new app
3. Copy API Key, Secret, and App ID

**Usage:**
- Video calling
- Live classes
- Chat messaging
- Real-time notifications

---

### Redis Configuration (Caching)

```env
REDIS_URL=redis://default:password@host:port
```

**Options:**

**Redis Cloud (Free):**
```env
REDIS_URL=redis://default:pass@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
```

**Local Redis:**
```env
REDIS_URL=redis://localhost:6379
```

**Installation:**
```bash
# Mac
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis

# Windows
# Download from: https://github.com/microsoftarchive/redis/releases
```

---

### Google OAuth Configuration

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**How to Get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)

---

### Application URLs

```env
# Frontend URL (used in emails, redirects)
FRONTEND_URL=http://localhost:3000

# Port (optional, defaults to 3000)
PORT=3000
```

**Environment-Specific:**
- Development: `http://localhost:3000`
- Staging: `https://staging.yourdomain.com`
- Production: `https://yourdomain.com`

---

## Optional Environment Variables

### AI Services

```env
# Face recognition service
FACE_SERVICE_URL=http://localhost:5002

# AI timetable generation
TIMETABLE_AI_URL=http://localhost:8000/generate-timetable

# Face model path
FACE_MODEL_PATH=./models
```

### Zoom Integration

```env
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
ZOOM_BASE_URL=https://api.zoom.us/v2
ZOOM_REDIRECT_URI=http://localhost:3000/api/zoom/callback
```

### MSG91 (Alternative SMS)

```env
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=your_sender_id
```

### Node.js Configuration

```env
# Increase memory limit for large operations
NODE_OPTIONS=--max-old-space-size=2048
```

---

## Environment-Specific Configuration

### Development (.env.development)

```env
DATABASE_URL="postgresql://localhost:5432/learnxchain_dev"
FRONTEND_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_xxxxxxx
# ... other dev configs
```

### Production (.env.production)

```env
DATABASE_URL="postgresql://prod-host/learnxchain_prod"
FRONTEND_URL=https://yourdomain.com
RAZORPAY_KEY_ID=rzp_live_xxxxxxx
# ... other prod configs
```

### Loading Environment Files

Next.js automatically loads:
1. `.env.local` (all environments, not committed)
2. `.env.development` or `.env.production` (based on NODE_ENV)
3. `.env` (all environments)

---

## Security Best Practices

### DO ✅

- Use strong, random secrets
- Use different secrets per environment
- Keep `.env` files out of version control
- Use environment-specific files
- Rotate secrets regularly
- Use secret management tools in production

### DON'T ❌

- Commit `.env` files to Git
- Share secrets in plain text
- Use weak or predictable secrets
- Reuse secrets across projects
- Store secrets in code

---

## .gitignore Configuration

Ensure your `.gitignore` includes:

```gitignore
# Environment files
.env
.env.local
.env.development
.env.production
.env.test

# But keep the example
!.env.example
```

---

## Environment Variable Validation

Create `lib/config/env.ts` to validate environment variables:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  CLOUDINARY_CLOUD_NAME: z.string(),
  EMAIL_SERVER_HOST: z.string(),
  // ... other required variables
});

export const env = envSchema.parse(process.env);
```

---

## Accessing Environment Variables

### In API Routes

```typescript
// pages/api/example.ts
const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
```

### In Server-Side Code

```typescript
// lib/services/example.ts
const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
```

### In Client-Side Code

Only variables prefixed with `NEXT_PUBLIC_` are available:

```typescript
// components/Example.tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Note:** Never expose secrets to client-side code!

---

## Troubleshooting

### Environment Variables Not Loading

**Solutions:**
1. Restart development server
2. Check file name is exactly `.env`
3. Ensure no spaces around `=`
4. Check for typos in variable names

### Database Connection Issues

**Check:**
1. DATABASE_URL format is correct
2. Database server is running
3. Credentials are correct
4. Network/firewall allows connection

### Email Not Sending

**Check:**
1. SMTP credentials are correct
2. App password (not regular password) for Gmail
3. Port 587 is not blocked
4. EMAIL_FROM is a valid email

---

## Example .env.example File

Create this file to help other developers:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/learnxchain"

# JWT
JWT_ACCESS_TOKEN_SECRET=
JWT_REFRESH_TOKEN_SECRET=
JWT_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Stream.io
STREAM_API_KEY=
STREAM_API_SECRET=
STREAM_APP_ID=

# Redis
REDIS_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# URLs
FRONTEND_URL=http://localhost:3000
```

---

**Last Updated:** January 2026
