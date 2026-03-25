# 🌾 Local Farmers Direct Marketplace

A full-stack web application connecting local farmers directly with consumers, enabling fresh produce sales without middlemen.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/farmersmarketplace)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Git Setup](#git-setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Features
- **User Roles**: Buyer, Farmer, Admin with role-based access control
- **Product Management**: Browse, search, filter products by category and location
- **Shopping Cart**: Persistent cart with add/update/remove functionality
- **Order Management**: Place orders, track status, view history
- **Reviews & Ratings**: 5-star rating system with comments
- **QR Code Traceability**: Track product journey from farm to table
- **Community Forum**: Discussion boards for farming tips and recipes
- **Multi-language Support**: English, Hindi, Tamil, Telugu
- **Farmer Dashboard**: Manage products, orders, and view analytics

### Advanced Features
- Secure Forgot Password flow with OTP via Email
- JWT-based authentication with bcrypt password hashing
- Cloudinary integration for image uploads
- Seasonal crop calendar
- Real-time order status updates
- Responsive design for all devices

---

## 🛠 Tech Stack

### Frontend
- React.js 18
- Tailwind CSS
- React Router v6
- Axios
- React Query
- React Hook Form
- i18next (Internationalization)
- React Hot Toast

### Backend
- Node.js
- Express.js
- MySQL
- JWT (jsonwebtoken)
- bcryptjs
- Cloudinary
- QRCode
- Helmet (Security)
- Express Rate Limit

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **npm** or **yarn** (comes with Node.js)
- **Git** (optional) - [Download](https://git-scm.com/)

### Check Installations

```bash
node --version    # Should be v16+
npm --version     # Should be 8+
mysql --version   # Should be 8+
```

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/farmersmarketplace.git
cd farmersmarketplace
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (root, backend, frontend)
npm run install:all
```

Or install individually:

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

---

## 🗄 Database Setup

### Step 1: Start MySQL Server

**Windows:**
- Open Services (Win + R → `services.msc`)
- Find "MySQL80" and start it
- Or use MySQL Workbench

**Mac/Linux:**
```bash
sudo systemctl start mysql
# or
brew services start mysql
```

### Step 2: Create Database

**Option A - MySQL Workbench (Recommended):**

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Click "Create Schema" icon or run:
   ```sql
   CREATE DATABASE farmers_marketplace 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;
   ```

**Option B - Command Line:**

```bash
mysql -u root -p
```

Then in MySQL prompt:
```sql
CREATE DATABASE farmers_marketplace 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
exit;
```

### Step 3: Import Schema

**Option A - MySQL Workbench:**

1. File → Open SQL Script
2. Navigate to `database/schema_safe.sql`
3. Select `farmers_marketplace` database
4. Click Execute (⚡ button)

**Option B - Command Line:**

```bash
mysql -u root -p farmers_marketplace < database/schema_safe.sql
```

### Step 4: Verify Database

```sql
USE farmers_marketplace;
SHOW TABLES;  -- Should show 12 tables
```

Expected tables:
- users, farmers, products, cart, orders, order_items
- reviews, posts, comments, post_likes
- seasonal_calendar, traceability

---

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=farmers_marketplace

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Cloudinary Configuration (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Maps API (Optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# SMTP Configuration (Required for Forgot Password OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="FarmersMarket" <your_email@gmail.com>
OTP_EXPIRE_MINUTES=10
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Environment Variables

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api

# Optional
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Build Configuration
GENERATE_SOURCEMAP=false
DISABLE_ESLINT_PLUGIN=true
```

---

## 🏃 Running the Application

### Quick Start (All Services)

```bash
npm run dev
```

This starts:
- **Backend** on http://localhost:5000
- **Frontend** on http://localhost:3000

### Run Services Individually

```bash
# Backend only
npm run backend

# Frontend only
npm run frontend
```

### Seed Database with Sample Data

```bash
npm run seed
```

This creates:
- 9 users (1 admin, 3 buyers, 5 farmers)
- 15 products with images
- 8 forum posts with comments
- 5 product reviews
- 10 seasonal crops

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 🔐 Demo Accounts

After seeding, use these credentials:

**Admin:**
```
Email: admin@farmersmarket.com
Password: admin123
```

**Buyer:**
```
Email: buyer@example.com
Password: buyer123
```

**Farmer:**
```
Email: farmer1@example.com
Password: farmer123
```

---

## 🔧 Git Setup

### Push to GitHub

See [GIT_SETUP.md](GIT_SETUP.md) for detailed instructions on:
- Initializing Git repository
- Creating GitHub repository
- Pushing code to GitHub
- Branch strategies
- Protecting sensitive data
- Collaboration workflow

**Quick Start:**

```bash
# Initialize Git
git init

# Create .env files (copy from .env.example)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Add files
git add .

# Commit
git commit -m "Initial commit: Farmers Marketplace"

# Add remote (replace with your GitHub URL)
git remote add origin https://github.com/yourusername/farmers-marketplace.git

# Push
git branch -M main
git push -u origin main
```

**Important:** Never commit `.env` files! They're already in `.gitignore`.

---

## 🌐 Deployment

### Deploy to Vercel

#### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Cloud MySQL database (PlanetScale, Railway, or AWS RDS)

#### Step 1: Prepare Database

**Option A - PlanetScale (Recommended - Free Tier):**

1. Sign up at https://planetscale.com
2. Create database: `farmers_marketplace`
3. Get connection string
4. Import schema using PlanetScale CLI

**Option B - Railway:**

1. Sign up at https://railway.app
2. Create MySQL service
3. Get connection details
4. Import schema

#### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/farmersmarketplace.git
git push -u origin main
```

### Deploy Backend to Render

1. Go to https://render.com and sign up
2. Click "New" -> "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

5. Add Environment Variables (Advanced -> Environment Variables):
   ```
   DB_HOST=your_cloud_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=farmers_marketplace
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=production
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM="FarmersMarket" <your_email@gmail.com>
   OTP_EXPIRE_MINUTES=10
   ```

6. Click "Create Web Service"
7. Note your Render URL (e.g., `https://farmersmarket-backend.onrender.com`)

#### Step 4: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Import same repository
3. Configure:
   - **Framework**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://farmersmarket-backend.onrender.com/api
   ```

5. Deploy

#### Step 5: Update CORS

Update `backend/server.js` CORS settings before deploying:
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));
```

Commit and push - Vercel will auto-deploy.

---

## 📁 Project Structure

```
farmersmarketplace/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── productController.js # Product CRUD
│   │   ├── cartController.js    # Cart management
│   │   ├── orderController.js   # Order processing
│   │   └── reviewController.js  # Reviews
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── products.js          # Product endpoints
│   │   ├── cart.js              # Cart endpoints
│   │   ├── orders.js            # Order endpoints
│   │   ├── reviews.js           # Review endpoints
│   │   ├── forum.js             # Forum endpoints
│   │   ├── traceability.js      # QR code endpoints
│   │   └── farmers.js           # Farmer endpoints
│   ├── scripts/
│   │   └── seed.js              # Database seeding
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   ├── AuthContext.js   # Auth state
│   │   │   └── CartContext.js   # Cart state
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Products.js
│   │   │   ├── ProductDetails.js
│   │   │   ├── Cart.js
│   │   │   ├── Checkout.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Profile.js
│   │   │   ├── Orders.js
│   │   │   ├── FarmerDashboard.js
│   │   │   └── Forum.js
│   │   ├── services/
│   │   │   └── api.js           # Axios config
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   ├── hi.json
│   │   │   ├── ta.json
│   │   │   └── te.json
│   │   ├── App.js
│   │   ├── index.js
│   │   └── i18n.js
│   ├── .env
│   ├── package.json
│   └── tailwind.config.js
├── database/
│   └── schema_safe.sql          # Database schema
├── .gitignore
├── package.json
├── vercel.json                  # Vercel config
├── README.md                    # This file
├── DEPLOYMENT.md                # Deployment guide
└── HOW_TO_RUN.md               # Quick start guide
```

---

## 🔌 API Documentation

### Authentication

```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/profile       - Get user profile (protected)
PUT    /api/auth/profile       - Update profile (protected)
```

### Products

```
GET    /api/products                    - Get all products
GET    /api/products/:id                - Get product details
GET    /api/products/categories         - Get categories
GET    /api/products/farmer/my-products - Get farmer's products (farmer only)
POST   /api/products                    - Add product (farmer only)
PUT    /api/products/:id                - Update product (farmer only)
DELETE /api/products/:id                - Delete product (farmer only)
```

### Cart

```
GET    /api/cart               - Get cart items (protected)
GET    /api/cart/summary       - Get cart summary (protected)
POST   /api/cart/add           - Add item (protected)
PUT    /api/cart/:id           - Update item (protected)
DELETE /api/cart/:id           - Remove item (protected)
DELETE /api/cart               - Clear cart (protected)
```

### Orders

```
POST   /api/orders             - Create order (protected)
GET    /api/orders/user        - Get user orders (protected)
GET    /api/orders/user/:id    - Get order details (protected)
GET    /api/orders/farmer      - Get farmer orders (farmer only)
PUT    /api/orders/:id/status  - Update status (farmer only)
```

### Reviews

```
GET    /api/reviews/product/:id - Get product reviews
POST   /api/reviews             - Add review (protected)
GET    /api/reviews/user        - Get user reviews (protected)
PUT    /api/reviews/:id         - Update review (protected)
DELETE /api/reviews/:id         - Delete review (protected)
```

### Forum

```
GET    /api/forum              - Get all posts
GET    /api/forum/:id          - Get post with comments
POST   /api/forum              - Create post (protected)
POST   /api/forum/:id/comments - Add comment (protected)
POST   /api/forum/:id/like     - Like/unlike post (protected)
```

### Farmers

```
GET    /api/farmers                  - Get all farmers
GET    /api/farmers/:id              - Get farmer profile
PUT    /api/farmers/profile          - Update profile (farmer only)
GET    /api/farmers/dashboard/stats  - Get dashboard stats (farmer only)
```

### Traceability

```
GET    /api/trace/:batchId              - Get traceability info
POST   /api/trace/generate/:batchId     - Generate QR code
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F

netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed

1. Check MySQL is running
2. Verify credentials in `backend/.env`
3. Ensure database exists:
   ```sql
   SHOW DATABASES LIKE 'farmers_marketplace';
   ```

### Module Not Found

```bash
npm run install:all
```

### Frontend Build Errors

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..
```

### CORS Errors

1. Check `REACT_APP_API_URL` in `frontend/.env`
2. Verify CORS configuration in `backend/server.js`
3. Restart both servers

---

## 📊 Available Scripts

```bash
# Development
npm run dev              # Start both backend and frontend
npm run backend          # Start backend only
npm run frontend         # Start frontend only

# Installation
npm run install:all      # Install all dependencies

# Database
npm run seed             # Seed database with sample data

# Production
npm run build            # Build frontend for production
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- Your Name - [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Farmers and agricultural communities
- Open source contributors
- React and Node.js communities

---

## 📞 Support

For issues and questions:
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/farmersmarketplace/issues)
- **Email**: support@farmersmarket.com

---

**Built with ❤️ for local farmers and sustainable agriculture**

