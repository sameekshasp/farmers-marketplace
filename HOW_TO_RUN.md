# 🚀 How to Run This Project

## Quick Start (3 Steps)

### Step 1: Start the Servers
```bash
npm run dev
```

This starts:
- **Backend** on http://localhost:5000
- **Frontend** on http://localhost:3000

### Step 2: Seed the Database (First Time Only)
```bash
npm run seed --prefix backend
```

This creates:
- ✅ 5 Farmers with profiles
- ✅ 15 Products with images
- ✅ 8 Forum posts with comments
- ✅ 5 Product reviews
- ✅ Sample users (admin, buyers, farmers)

### Step 3: Open Your Browser
Visit: **http://localhost:3000**

---

## 🔐 Login Credentials

### Admin Account
- **Email:** admin@farmersmarket.com
- **Password:** admin123
- **Access:** Full system access, user management

### Buyer Account
- **Email:** buyer@example.com
- **Password:** buyer123
- **Access:** Browse products, place orders, write reviews

### Farmer Account
- **Email:** farmer1@example.com
- **Password:** farmer123
- **Access:** Farmer dashboard, manage products, view orders

---

## 📋 What You'll See

### Home Page
- Featured products from farmers
- Top-rated farmers
- Seasonal crop calendar
- Search functionality

### Products Page
- Browse all products
- Filter by category
- Search by name
- View product details

### Farmer Dashboard (Login as Farmer)
- Manage your products
- View orders
- Dashboard analytics
- Add new products

### Community Forum
- Browse farming tips
- Read recipes
- Post questions
- Comment and like posts

### Shopping Features (Login as Buyer)
- Add products to cart
- Place orders
- Write reviews
- Track orders

---

## 🛠 Common Commands

```bash
# Start development servers (with warnings suppressed)
npm run dev

# Or use the clean start script (Windows)
start-clean.bat

# Start backend only
npm run backend

# Start frontend only
npm run frontend

# Seed database with sample data
npm run seed --prefix backend

# Install all dependencies
npm run install:all

# Build frontend for production
npm run build --prefix frontend
```

---

## 🐛 Troubleshooting

### Issue: "Port already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Database connection failed"
**Solution:**
1. Make sure MySQL is running
2. Check `backend/.env` has correct credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=farmers_marketplace
   ```

### Issue: "No products showing"
**Solution:**
Run the seed script:
```bash
npm run seed --prefix backend
```

### Issue: "Module not found"
**Solution:**
```bash
npm run install:all
```

---

## 📊 Database Status Check

To verify your database has data:

```sql
-- Open MySQL Workbench and run:
USE farmers_marketplace;

SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_farmers FROM farmers;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_posts FROM posts;
```

Expected results after seeding:
- Users: 9 (1 admin + 3 buyers + 5 farmers)
- Farmers: 5
- Products: 15
- Posts: 8

---

## 🎯 Testing the Application

### Test as Buyer:
1. Login with: buyer@example.com / buyer123
2. Browse products
3. Add items to cart
4. Place an order
5. Write a product review

### Test as Farmer:
1. Login with: farmer1@example.com / farmer123
2. Go to Farmer Dashboard
3. View your products
4. Add a new product
5. Check orders

### Test Forum:
1. Go to Community Forum
2. Browse posts
3. Read comments
4. Like posts
5. Create new post (requires login)

---

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 📱 Features to Explore

### For Buyers:
- ✅ Browse products by category
- ✅ Search products
- ✅ View farmer profiles
- ✅ Add to cart
- ✅ Place orders
- ✅ Write reviews
- ✅ Track orders
- ✅ Multi-language support

### For Farmers:
- ✅ Manage products (Add/Edit/Delete)
- ✅ View orders
- ✅ Dashboard analytics
- ✅ Update farm profile
- ✅ Upload product images
- ✅ Track sales

### Community Features:
- ✅ Forum discussions
- ✅ Post questions
- ✅ Share farming tips
- ✅ Recipe sharing
- ✅ Like and comment

### Advanced Features:
- ✅ QR code traceability
- ✅ Seasonal crop calendar
- ✅ Geo-location filtering
- ✅ Product ratings
- ✅ Order status tracking

---

## 🔄 Reset Database

If you want to start fresh:

```bash
# Method 1: Re-import schema
mysql -u root -p farmers_marketplace < database/schema_safe.sql

# Method 2: Drop and recreate
mysql -u root -p -e "DROP DATABASE farmers_marketplace; CREATE DATABASE farmers_marketplace;"
mysql -u root -p farmers_marketplace < database/schema_safe.sql

# Then seed again
npm run seed --prefix backend
```

---

## 📞 Need Help?

1. Check the terminal logs for errors
2. Check browser console (F12) for frontend errors
3. Verify MySQL is running
4. Ensure all dependencies are installed
5. Check `.env` file configuration

---

## ✅ Success Checklist

After running the project, you should see:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Database connected successfully
- [ ] Products visible on homepage
- [ ] Farmers listed on homepage
- [ ] Forum posts visible
- [ ] Can login with test credentials
- [ ] Can browse products
- [ ] Can add items to cart

---

**Your Farmers Marketplace is ready! 🎉**

Visit http://localhost:3000 and start exploring!
