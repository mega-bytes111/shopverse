# 🛒 ShopVerse – Full Stack MERN E-Commerce Platform

## 🚀 Live Demo

**Frontend:**  
https://shopverse-a7k8.onrender.com  

**Backend API:**  
https://shopverse-backend-uubo.onrender.com  

---

## 📌 Overview

ShopVerse is a full-stack production-ready e-commerce platform built using the MERN stack.

It includes:

- User Authentication (JWT)
- Admin Panel
- Wishlist
- Cart & Checkout
- Razorpay Online Payment
- Order Tracking
- Email Notifications
- Product Reviews
- MongoDB Atlas (Cloud Database)
- Fully deployed on Render

This project demonstrates a complete real-world e-commerce workflow.

---

## ⚙️ Tech Stack

### 🔹 Frontend
- React (Vite)
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- Razorpay Checkout

### 🔹 Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Nodemailer (Email)
- Razorpay SDK

### 🔹 Deployment
- Frontend: Render (Static Site)
- Backend: Render (Web Service)
- Database: MongoDB Atlas

---

## ✅ Features

### 🔐 Authentication
- Register / Login
- JWT Protected Routes
- Role-based Access (User / Admin)

### 🛍️ Products
- Categories
- Search
- Filtering
- Sorting
- Pagination
- Reviews & Ratings

### ❤️ Wishlist
- Add / Remove products
- Move to Cart

### 🛒 Cart
- Quantity update
- Remove items
- Dynamic total calculation

### 💳 Payments
- Cash on Delivery (COD)
- Razorpay Online Payment
- Secure Payment Verification
- Retry Payment for Pending Orders

### 📦 Orders
- Order history
- Cancel order with reason
- Payment status
- Order details page
- Email notifications (Order Placed & Delivered)

### 🛠️ Admin Panel
- Dashboard
- Manage Products
- Create Products (Image Upload)
- Manage Orders
- Update Order Status

---

## 🧠 Order Flow

```
Add to Cart → Checkout → Choose COD / Razorpay
→ Create Order
→ If COD → Confirmed
→ If Razorpay → Payment Pending → Verify → Confirmed
→ Email Notification
```

---

## 📁 Project Structure

```
ecommerce-platform/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seedProducts.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── static.json
│   └── package.json
│
└── README.md
```

---

## 🔧 Environment Variables

### Backend (.env)

```
NODE_ENV=production
PORT=5000

MONGO_URI=your_mongodb_atlas_uri

JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxx

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=yourgmail@gmail.com

APP_NAME=ShopVerse
FRONTEND_URL=https://your-frontend-domain
```

---

### Frontend (.env)

```
VITE_API_BASE=https://your-backend-domain/api
VITE_BACKEND_URL=https://your-backend-domain
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

---

## 🚀 Local Setup

### 1️⃣ Clone Repository
---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment

### Backend
- Render Web Service
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

### Frontend
- Render Static Site
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

---

## 📧 Email Notifications

- ✅ Order Placed
- ✅ Order Delivered
- Sent via Gmail SMTP (App Password)

---

## 💡 Future Improvements

- Cloudinary for image hosting
- Stripe integration
- Wishlist persistence optimization
- Analytics dashboard
- Order return system
- Multi-language support
- Performance optimization

---

## 👨‍💻 Author

**Arpan Tiwari**  
Full Stack MERN Developer  

---

## ⭐ If you like this project

Give it a star ⭐ on GitHub!
