# 🚀 Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All features tested locally
- [ ] No console.log statements in production code
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] API endpoints tested
- [ ] Frontend build successful (`npm run build`)
- [ ] No hardcoded credentials

### ✅ Database Setup
- [ ] Cloud database created (PlanetScale/AWS RDS/Railway)
- [ ] Schema imported successfully
- [ ] Database connection tested
- [ ] Backup strategy in place
- [ ] Connection string secured

### ✅ Environment Variables
- [ ] All `.env` files configured
- [ ] JWT secret generated (32+ characters)
- [ ] Cloudinary credentials obtained
- [ ] Database credentials secured
- [ ] API URLs updated for production

### ✅ Security
- [ ] Passwords hashed with bcrypt
- [ ] JWT authentication implemented
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers active
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)

### ✅ Git & GitHub
- [ ] Repository created on GitHub
- [ ] `.gitignore` properly configured
- [ ] `.env` files NOT committed
- [ ] All changes committed
- [ ] Pushed to main branch

---

## Vercel Deployment Steps

### Backend Deployment

1. **Create Vercel Project**
   - Go to https://vercel.com/new
   - Import GitHub repository
   - Select `backend` as root directory

2. **Configure Build Settings**
   - Framework: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

3. **Add Environment Variables**
   ```
   DB_HOST=your_cloud_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=farmers_marketplace
   JWT_SECRET=your_jwt_secret_min_32_chars
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=production
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your backend URL: `https://your-backend.vercel.app`

5. **Test Backend**
   - Visit: `https://your-backend.vercel.app/api/health`
   - Should return: `{"status":"OK",...}`

### Frontend Deployment

1. **Create Vercel Project**
   - Go to https://vercel.com/new
   - Import same GitHub repository
   - Select `frontend` as root directory

2. **Configure Build Settings**
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Add Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app is live at: `https://your-frontend.vercel.app`

5. **Test Frontend**
   - Visit your frontend URL
   - Test registration, login, product browsing
   - Check browser console for errors

### Post-Deployment Configuration

1. **Update Backend CORS**
   - Edit `backend/server.js`
   - Update CORS origin to your frontend URL:
   ```javascript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? ['https://your-frontend.vercel.app'] 
       : ['http://localhost:3000'],
     credentials: true
   }));
   ```
   - Commit and push (auto-deploys)

2. **Test Full Flow**
   - [ ] User registration works
   - [ ] User login works
   - [ ] Product listing loads
   - [ ] Cart functionality works
   - [ ] Order placement works
   - [ ] Image upload works (Cloudinary)
   - [ ] Multi-language switching works

---

## Database Options

### Option 1: PlanetScale (Recommended)
**Pros:** Free tier, serverless, easy scaling, built-in branching
**Cons:** No foreign keys in free tier (use application-level constraints)

**Setup:**
1. Sign up at https://planetscale.com
2. Create database: `farmers_marketplace`
3. Get connection string
4. Import schema using PlanetScale CLI:
   ```bash
   pscale shell farmers_marketplace main < database/schema_safe.sql
   ```

### Option 2: Railway
**Pros:** Simple setup, free tier, supports MySQL
**Cons:** Limited free tier resources

**Setup:**
1. Sign up at https://railway.app
2. Create new project → Add MySQL
3. Get connection details from Variables tab
4. Import schema using MySQL client

### Option 3: AWS RDS
**Pros:** Highly scalable, reliable, full MySQL features
**Cons:** No free tier, more complex setup

**Setup:**
1. Create RDS MySQL instance
2. Configure security groups (allow Vercel IPs)
3. Get connection endpoint
4. Import schema using MySQL Workbench

---

## Environment Variables Reference

### Backend Required Variables
```env
# Database (Required)
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=farmers_marketplace

# JWT (Required)
JWT_SECRET=min_32_character_random_string
JWT_EXPIRE=7d

# Server (Required)
PORT=5000
NODE_ENV=production

# Cloudinary (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Frontend Required Variables
```env
REACT_APP_API_URL=https://your-backend.vercel.app/api
```

---

## Troubleshooting

### Backend Issues

**Error: Database connection failed**
- Check database is running
- Verify connection string
- Check firewall/security groups
- Ensure database allows connections from Vercel IPs

**Error: JWT secret not defined**
- Add `JWT_SECRET` to Vercel environment variables
- Redeploy

**Error: CORS policy blocked**
- Update CORS origin in `backend/server.js`
- Ensure frontend URL is correct
- Redeploy backend

### Frontend Issues

**Error: API calls failing**
- Check `REACT_APP_API_URL` is correct
- Verify backend is deployed and running
- Check browser console for CORS errors
- Test backend health endpoint

**Error: Build failed**
- Check for TypeScript errors
- Verify all dependencies installed
- Check build logs in Vercel dashboard

**Error: Environment variables not working**
- Ensure variables start with `REACT_APP_`
- Redeploy after adding variables
- Clear browser cache

---

## Performance Optimization

### Backend
- [ ] Enable compression middleware
- [ ] Implement caching (Redis)
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Use connection pooling

### Frontend
- [ ] Code splitting
- [ ] Lazy loading routes
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] CDN for static assets

---

## Monitoring & Maintenance

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Monitor API response times
- [ ] Track database performance
- [ ] Set up uptime monitoring
- [ ] Configure alerts

### Backups
- [ ] Daily database backups
- [ ] Store backups securely
- [ ] Test restore process
- [ ] Document backup procedure

### Updates
- [ ] Regular dependency updates
- [ ] Security patches
- [ ] Database migrations
- [ ] Feature deployments

---

## Custom Domain Setup (Optional)

1. **Purchase Domain**
   - Namecheap, GoDaddy, Google Domains, etc.

2. **Configure in Vercel**
   - Project Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

3. **Update Environment Variables**
   - Update CORS origins
   - Update API URLs
   - Redeploy

---

## Rollback Procedure

If deployment fails:

1. **Vercel Dashboard**
   - Go to Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Git Revert**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Database Rollback**
   - Restore from backup
   - Run migration scripts if needed

---

## Success Criteria

Deployment is successful when:
- ✅ Backend health endpoint returns 200
- ✅ Frontend loads without errors
- ✅ User can register and login
- ✅ Products display correctly
- ✅ Cart functionality works
- ✅ Orders can be placed
- ✅ Images upload successfully
- ✅ No console errors
- ✅ Mobile responsive
- ✅ All API endpoints working

---

## Post-Deployment Tasks

- [ ] Test all user flows
- [ ] Create admin account
- [ ] Seed initial data
- [ ] Update documentation
- [ ] Share URLs with team
- [ ] Monitor error logs
- [ ] Set up analytics
- [ ] Configure SEO
- [ ] Submit to search engines

---

**Deployment Complete! 🎉**

Your Farmers Marketplace is now live and ready to connect farmers with consumers!
