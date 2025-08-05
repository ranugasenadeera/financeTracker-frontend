# 🚀 Complete Free Deployment Guide

This guide covers deploying both your Finance Tracker Frontend and Backend completely free.

## 📋 Overview

We'll use the following free services:
- **Frontend**: Vercel (unlimited projects, 100GB bandwidth)
- **Backend**: Railway/Render + Supabase
- **Database**: Supabase (PostgreSQL + Auth)
- **File Storage**: Supabase (50MB free)

---

## 🎯 Option 1: Full-Stack with Supabase (Recommended)

### Why Supabase?
- ✅ **Free PostgreSQL database** (500MB)
- ✅ **Built-in authentication** (email, social logins)
- ✅ **Real-time subscriptions**
- ✅ **Auto-generated REST APIs**
- ✅ **File storage** (50MB free)
- ✅ **Row Level Security**

### Step 1: Setup Supabase Backend

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com
   # Sign up with GitHub
   # Create new project
   # Note down: Project URL, API Key (anon), API Key (service_role)
   ```

2. **Create Database Tables**
   ```sql
   -- Users table (auto-created with auth)
   -- Transactions table
   CREATE TABLE transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     amount DECIMAL(10,2) NOT NULL,
     description TEXT NOT NULL,
     category VARCHAR(50) NOT NULL,
     type VARCHAR(20) CHECK (type IN ('income', 'expense')) NOT NULL,
     date DATE NOT NULL DEFAULT CURRENT_DATE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Budgets table
   CREATE TABLE budgets (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     category VARCHAR(50) NOT NULL,
     amount DECIMAL(10,2) NOT NULL,
     period VARCHAR(20) DEFAULT 'monthly',
     start_date DATE NOT NULL,
     end_date DATE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Goals table
   CREATE TABLE goals (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     title VARCHAR(100) NOT NULL,
     description TEXT,
     target_amount DECIMAL(10,2) NOT NULL,
     current_amount DECIMAL(10,2) DEFAULT 0,
     target_date DATE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Enable Row Level Security**
   ```sql
   -- Enable RLS
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
   ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own transactions" ON transactions
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own transactions" ON transactions
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own transactions" ON transactions
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own transactions" ON transactions
     FOR DELETE USING (auth.uid() = user_id);

   -- Repeat similar policies for budgets and goals
   ```

### Step 2: Configure Frontend for Supabase

1. **Install Supabase Client**
   ```bash
   cd financeTracker-frontend
   npm install @supabase/supabase-js
   ```

2. **Create Supabase Client**
   ```typescript
   // lib/supabase.ts
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

3. **Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Step 3: Deploy Frontend to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Supabase integration"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

---

## 🎯 Option 2: Separate Backend + Frontend

### Step 1: Deploy Backend

#### Option A: Railway (Recommended)
```bash
# 1. Sign up at railway.app
# 2. Connect GitHub
# 3. Create new project from repo
# 4. Add environment variables
# 5. Deploy automatically
```

#### Option B: Render
```bash
# 1. Sign up at render.com
# 2. Create new web service
# 3. Connect GitHub repository
# 4. Configure:
#    - Build Command: npm install
#    - Start Command: npm start
# 5. Add environment variables
# 6. Deploy
```

#### Option C: Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and launch
fly auth login
cd your-backend-directory
fly launch
fly deploy
```

### Step 2: Deploy Database

Choose one of these free database options:

#### PlanetScale (MySQL)
```bash
# 1. Sign up at planetscale.com
# 2. Create database
# 3. Get connection string
# 4. Add to backend environment variables
```

#### Neon (PostgreSQL)
```bash
# 1. Sign up at neon.tech
# 2. Create database
# 3. Get connection string
# 4. Configure in backend
```

### Step 3: Deploy Frontend

Same as Option 1 - use Vercel, but point to your deployed backend API.

---

## 📱 Mobile App (Optional)

### React Native with Expo
```bash
# Install Expo CLI
npm install -g @expo/cli

# Create React Native app
npx create-expo-app FinanceTrackerMobile
cd FinanceTrackerMobile

# Share code with web app
# Use same Supabase backend
# Deploy to Expo Go for free testing
```

---

## 🔧 Environment Variables Guide

### Frontend (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API (if using separate backend)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key

# CORS
FRONTEND_URL=https://your-app.vercel.app

# Port
PORT=3001
```

---

## 🚀 Quick Start Commands

### Frontend Deployment
```bash
# 1. Clone and setup
git clone https://github.com/ranugasenadeera/financeTracker-frontend.git
cd financeTracker-frontend
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Test locally
npm run dev

# 4. Deploy to Vercel
# Push to GitHub, then import to Vercel
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Backend with Supabase (No separate backend needed!)
```bash
# 1. Create Supabase project
# 2. Run SQL commands from Step 1 above
# 3. Get API keys
# 4. Add to frontend environment variables
# 5. Deploy frontend - you're done!
```

---

## 💡 Pro Tips

### 1. **Free Tier Limits**
- **Vercel**: 100GB bandwidth/month (plenty for most apps)
- **Supabase**: 500MB database, 2GB bandwidth
- **Railway**: 500 hours/month (sleep after 5min inactivity)
- **Render**: 750 hours/month (sleeps after 15min)

### 2. **Cost Optimization**
- Use Supabase for everything (backend + database)
- Implement caching to reduce API calls
- Optimize images and assets
- Use CDN for static content

### 3. **Monitoring**
- Set up Vercel Analytics (free)
- Use Supabase Dashboard for database monitoring
- Enable error tracking with Sentry (free tier)

### 4. **Custom Domains**
- **Vercel**: Free custom domains
- **Railway**: Custom domains on paid plans
- **Render**: Free custom domains

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Free)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🆘 Troubleshooting

### Common Issues
1. **CORS Errors**: Configure backend CORS settings
2. **Environment Variables**: Double-check all variables are set
3. **Database Connection**: Verify connection strings
4. **Build Errors**: Check Node.js version compatibility

### Getting Help
- **Vercel**: [Discord](https://vercel.com/discord)
- **Supabase**: [Discord](https://discord.supabase.com)
- **Railway**: [Discord](https://discord.gg/railway)

---

## 🎉 Next Steps

After deployment:
1. ✅ **Set up monitoring** (Vercel Analytics, Supabase Dashboard)
2. ✅ **Configure custom domain** (optional)
3. ✅ **Set up error tracking** (Sentry)
4. ✅ **Add authentication** (Supabase Auth)
5. ✅ **Implement real-time features** (Supabase Realtime)
6. ✅ **Add mobile app** (React Native + Expo)

---

**🚀 Happy Deploying!**
