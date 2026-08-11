# Setup Guide

> Step-by-step guide to set up LearnXChain development environment

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** or **pnpm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Code Editor** (VS Code recommended)

### Recommended VS Code Extensions

- **Prisma** - Syntax highlighting for Prisma schema
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind class autocomplete
- **GitLens** - Enhanced Git integration

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd LearnXChain

# Or if using SSH
git clone git@github.com:username/LearnXChain.git
cd LearnXChain
```

---

## Step 2: Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

This will install all required dependencies listed in `package.json`.

---

## Step 3: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. **Install PostgreSQL** on your machine

2. **Create a new database**:
   ```bash
   # Access PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE learnxchain;
   
   # Create user (optional)
   CREATE USER lxc_user WITH PASSWORD 'your_password';
   
   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE learnxchain TO lxc_user;
   
   # Exit
   \q
   ```

3. **Get your connection string**:
   ```
   postgresql://lxc_user:your_password@localhost:5432/learnxchain
   ```

### Option B: Cloud PostgreSQL (Neon, Supabase, etc.)

1. **Sign up** for a cloud PostgreSQL provider:
   - [Neon](https://neon.tech/) - Serverless PostgreSQL
   - [Supabase](https://supabase.com/) - Open source Firebase alternative
   - [Railway](https://railway.app/) - Simple deployment platform

2. **Create a new database** through their dashboard

3. **Copy the connection string** provided

---

## Step 4: Configure Environment Variables

1. **Create `.env` file** in the root directory:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your configuration:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_ACCESS_TOKEN_SECRET=your_random_secret_key_here_min_32_chars
JWT_REFRESH_TOKEN_SECRET=your_random_refresh_secret_key_here_min_32_chars
JWT_SECRET=your_random_secret_key_here_min_32_chars

# ============================================
# CLOUDINARY CONFIGURATION (File Storage)
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# EMAIL CONFIGURATION
# ============================================
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com

# ============================================
# TWILIO CONFIGURATION (SMS)
# ============================================
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ============================================
# RAZORPAY CONFIGURATION (Payments)
# ============================================
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ============================================
# STREAM.IO CONFIGURATION (Video/Chat)
# ============================================
STREAM_API_KEY=your_api_key
STREAM_API_SECRET=your_api_secret
STREAM_APP_ID=your_app_id

# ============================================
# REDIS CONFIGURATION (Caching)
# ============================================
REDIS_URL=redis://default:password@host:port

# ============================================
# GOOGLE OAUTH CONFIGURATION
# ============================================
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# ============================================
# FRONTEND URL
# ============================================
FRONTEND_URL=http://localhost:3000

# ============================================
# OPTIONAL SERVICES
# ============================================
FACE_SERVICE_URL=http://localhost:5002
TIMETABLE_AI_URL=http://localhost:8000/generate-timetable
```

### How to Get API Keys

#### Cloudinary (File Storage)
1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

#### Gmail (Email)
1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use this password in `EMAIL_SERVER_PASSWORD`

#### Twilio (SMS)
1. Sign up at [twilio.com](https://www.twilio.com/)
2. Get a phone number
3. Copy Account SID and Auth Token from Console

#### Razorpay (Payments)
1. Sign up at [razorpay.com](https://razorpay.com/)
2. Go to Settings → API Keys
3. Generate Test/Live keys

#### Stream.io (Video/Chat)
1. Sign up at [getstream.io](https://getstream.io/)
2. Create a new app
3. Copy API Key, Secret, and App ID

#### Redis (Optional)
1. Use [Redis Cloud](https://redis.com/try-free/) for free hosting
2. Or install locally: `brew install redis` (Mac) or `sudo apt install redis` (Linux)

---

## Step 5: Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or create and run migrations (recommended for production)
npx prisma migrate dev --name init
```

This will:
1. Generate the Prisma Client based on your schema
2. Create all tables in your PostgreSQL database
3. Set up relationships and indexes

### Verify Database Setup

```bash
# Open Prisma Studio (Database GUI)
npm run db:studio
```

This opens a web interface at `http://localhost:5555` where you can view and edit your database.

---

## Step 6: Seed the Database (Optional)

Create initial data for testing:

1. **Create seed file** `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a superadmin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const superadmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@learnxchain.com',
      phone: '+1234567890',
      password: hashedPassword,
      address: '123 Admin St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      pincode: '10001',
      bloodType: 'O+',
      sex: 'MALE',
      role: 'superadmin',
    },
  });

  console.log('Created superadmin:', superadmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

2. **Add to package.json**:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

3. **Run seed**:

```bash
npx prisma db seed
```

---

## Step 7: Start Development Server

```bash
# Start Next.js development server
npm run dev

# Server will start at http://localhost:3000
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 8: Verify Installation

### Test API Endpoints

1. **Health Check**:
   ```bash
   curl http://localhost:3000/api/hello
   ```

2. **Login** (if you seeded the database):
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@learnxchain.com","password":"admin123"}'
   ```

### Test Database Connection

```bash
# Open Prisma Studio
npm run db:studio
```

---

## Common Setup Issues

### Issue: Database Connection Failed

**Error**: `Can't reach database server`

**Solutions**:
1. Check if PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Check firewall settings
4. Ensure database exists

### Issue: Prisma Client Not Found

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npm run db:generate
```

### Issue: Port 3000 Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:
1. Kill the process using port 3000:
   ```bash
   # On Mac/Linux
   lsof -ti:3000 | xargs kill -9
   
   # On Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Or use a different port:
   ```bash
   PORT=3001 npm run dev
   ```

### Issue: Module Not Found Errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Environment Variables Not Loading

**Solutions**:
1. Ensure `.env` file is in root directory
2. Restart development server
3. Check for typos in variable names
4. Don't use quotes around values (unless they contain spaces)

---

## Development Tools Setup

### ESLint Configuration

The project comes with ESLint configured. To run linting:

```bash
npm run lint
```

### Prettier Configuration (Optional)

1. **Install Prettier**:
   ```bash
   npm install --save-dev prettier
   ```

2. **Create `.prettierrc`**:
   ```json
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 80,
     "tabWidth": 2
   }
   ```

3. **Format code**:
   ```bash
   npx prettier --write .
   ```

### Git Hooks with Husky (Optional)

1. **Install Husky**:
   ```bash
   npm install --save-dev husky lint-staged
   npx husky install
   ```

2. **Add pre-commit hook**:
   ```bash
   npx husky add .husky/pre-commit "npx lint-staged"
   ```

3. **Configure lint-staged** in `package.json`:
   ```json
   {
     "lint-staged": {
       "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
       "*.{json,md}": ["prettier --write"]
     }
   }
   ```

---

## Next Steps

After successful setup:

1. ✅ Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for architecture overview
2. ✅ Review [API_REFERENCE.md](./API_REFERENCE.md) for API documentation
3. ✅ Check [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for database structure
4. ✅ Explore the codebase starting with `pages/` and `lib/services/`
5. ✅ Try creating a simple feature to understand the workflow

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Getting Help

If you encounter issues:

1. Check this documentation
2. Search existing GitHub issues
3. Ask team members on Slack/Discord
4. Create a new GitHub issue with:
   - Detailed description
   - Steps to reproduce
   - Error messages
   - Environment details (OS, Node version, etc.)

---

**Setup Complete!** 🎉

You're now ready to start developing with LearnXChain.

---

**Last Updated:** January 2026
