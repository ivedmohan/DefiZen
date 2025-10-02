# 🚀 Deployment to Railway

## ✅ Changes Ready for Deployment

### 1. **Cron Schedule Updated**
- Changed from: `*/1 * * * *` (every minute - testing)
- Changed to: `0 */6 * * *` (every 6 hours - production)
- Runs at: 00:00, 06:00, 12:00, 18:00 (midnight, 6am, noon, 6pm)

### 2. **New Features**
- ✅ 50/50 deposit strategy (50% to pools, 50% liquid)
- ✅ YieldPosition database tracking
- ✅ Duplicate deposit prevention
- ✅ Position query endpoints

### 3. **Database Schema**
- ✅ YieldPosition table created
- ✅ Migrations ready
- ✅ Indexes added for performance

## 📊 View Database Data

### Method 1: Using Node Script
```bash
cd /home/ved-mohan/Desktop/HackerGames_backend
node dist/scripts/queryPositions.js
```

### Method 2: Via API (when server running)
```bash
# Check active positions
curl "https://your-railway-url.up.railway.app/autonomous/positions?agentWallet=0x..."

# Check position history
curl "https://your-railway-url.up.railway.app/autonomous/positions/history?agentWallet=0x..."
```

### Method 3: Direct SQL (Supabase Dashboard)
1. Go to: https://supabase.com/dashboard
2. Select your project: `hdczpuejczmmkytvyyqq`
3. Click "SQL Editor"
4. Run query:
```sql
SELECT * FROM "YieldPosition" 
WHERE status = 'active' 
ORDER BY "depositedAt" DESC;
```

### Method 4: Using psql
```bash
psql "postgresql://postgres:LNUwd%24P8-%24_gyzz@db.hdczpuejczmmkytvyyqq.supabase.co:5432/postgres"

-- Then run:
SELECT * FROM "YieldPosition" LIMIT 10;
```

## 🚀 Deploy to Railway

### Step 1: Commit Changes
```bash
cd /home/ved-mohan/Desktop/HackerGames_backend

# Check what changed
git status

# Add all changes
git add .

# Commit with message
git commit -m "feat: 50/50 strategy + position tracking + 6hr cron

- Changed deposit strategy from 95% to 50% max
- Keep 50% liquid for volatility swaps
- Added YieldPosition database table
- Implemented duplicate deposit prevention
- Updated cron schedule to every 6 hours
- Added position query endpoints and scripts
- Documented Vesu pool experience"

# Push to GitHub
git push origin main
```

### Step 2: Railway Auto-Deploy
Railway will automatically:
1. ✅ Detect the push to `main` branch
2. ✅ Build the project (`pnpm build`)
3. ✅ Run database migrations (`prisma db push`)
4. ✅ Deploy the new version
5. ✅ Restart the server with new cron schedule

### Step 3: Verify Deployment
After ~2-3 minutes:

```bash
# Check if server is up
curl https://your-railway-url.up.railway.app/

# Check autonomous status
curl "https://your-railway-url.up.railway.app/autonomous/status?agentId=0x..."

# Check positions
curl "https://your-railway-url.up.railway.app/autonomous/positions?agentWallet=0x..."
```

## 📋 Pre-Deployment Checklist

- [x] Cron schedule changed to 6 hours
- [x] Code built successfully
- [x] Database schema updated
- [x] 50/50 strategy implemented
- [x] Position tracking added
- [x] Documentation complete
- [ ] Git commit and push
- [ ] Verify Railway deployment
- [ ] Check first cron run (6 hours after deploy)
- [ ] Monitor logs for errors

## 🔍 Post-Deployment Monitoring

### Check Logs on Railway
1. Go to: https://railway.app/
2. Select your project: `HackerGames_backend`
3. Click "Deployments" → Latest deployment
4. Click "View Logs"

### What to Look For:
```
✅ Server is running at http://...
✅ Database connected successfully
🤖 Running autonomous trading job (every 6 hours)...
```

### First Cron Run:
- Will happen 6 hours after deployment
- Check logs at that time to verify:
  - Job starts correctly
  - 50/50 split is applied
  - Positions are saved to DB
  - No errors occur

## 📊 Query Positions After Deployment

### From Your Local Machine:
```bash
# Update the script with your Railway URL
RAILWAY_URL="https://your-app.up.railway.app"

# Check positions
curl "$RAILWAY_URL/autonomous/positions?agentWallet=0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61"
```

### From Railway Console:
```bash
# SSH into Railway (if enabled)
railway run node dist/scripts/queryPositions.js
```

## 🛠️ Troubleshooting

### If Cron Job Doesn't Run:
- Check Railway logs for errors
- Verify timezone is set correctly (Asia/Kolkata)
- Check database connection

### If Database Query Fails:
- Verify DATABASE_URL is set in Railway
- Check Supabase is accessible
- Run migrations: `npx prisma db push`

### If Deployment Fails:
- Check Railway build logs
- Verify package.json scripts
- Check for TypeScript errors

## 📝 Cron Schedule Explanation

```
0 */6 * * *
│  │  │ │ │
│  │  │ │ └─── Day of week (0-7, 0 & 7 = Sunday)
│  │  │ └───── Month (1-12)
│  │  └─────── Day of month (1-31)
│  └────────── Hour (0-23, */6 = every 6 hours)
└──────────── Minute (0 = at minute 0)

Runs at: 00:00, 06:00, 12:00, 18:00 UTC
```

## 🎯 Expected Behavior

### Every 6 Hours:
1. Cron job triggers
2. Fetches all agent wallets with deposits
3. For each wallet:
   - Checks current balances
   - Analyzes yield opportunities
   - Checks for existing positions (prevents duplicates)
   - Deposits 50% max to best pool
   - Keeps 50% liquid for volatility swaps
   - Saves position to YieldPosition table
4. Logs complete

### Between Cron Runs:
- Server handles API requests
- Position endpoints available
- Manual actions still possible

## 📈 Success Metrics

After first few runs, you should see:
- ✅ Positions in YieldPosition table
- ✅ 50% deposited, 50% in wallet
- ✅ No duplicate deposits (checked against DB)
- ✅ Earnings accumulating in pools

## 🔗 Important Links

- **Railway Dashboard**: https://railway.app/
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vesu Pool**: https://app.troves.fi/strategy/vesu_fusion_strk
- **StrkFarm**: https://strkfarm.xyz/
- **GitHub Repo**: https://github.com/ivedmohan/DefiZen

---

**Ready to deploy?** Run the git commands above! 🚀
