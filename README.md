#  Finance Dashboard Backend

A production-grade REST API for a **Finance Data Processing and Access Control** system. Built with **Node.js (ES6+)**, **Express**, and **Mongoose (MongoDB Atlas)**.

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |
| Logging | Morgan |

---

##  Project Structure

```
finance-dashboard/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile
│   │   ├── userController.js      # Admin user management
│   │   ├── transactionController.js # CRUD for financial records
│   │   └── dashboardController.js # Analytics & aggregations
│   ├── middlewares/
│   │   ├── auth.js                # JWT protect + role authorize
│   │   ├── errorHandler.js        # Global error handler
│   │   └── validate.js            # express-validator runner
│   ├── models/
│   │   ├── User.js                # User schema with role & status
│   │   └── Transaction.js         # Financial record schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   ├── apiResponse.js         # Standardized response helpers
│   │   ├── jwt.js                 # Token generate & verify
│   │   └── seeder.js              # Demo data seeder
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── transactionValidator.js
│   ├── app.js                     # Express app setup
│   └── server.js                  # Entry point
├── .env.example
├── .gitignore
└── package.json
```

---

##  Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/finance-dashboard.git
cd finance-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/finance_dashboard
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 4. Seed the database (optional but recommended)

```bash
npm run seed
```

This creates 3 demo users and 16 sample transactions.

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@finance.com      | admin123    |
| Analyst | analyst@finance.com    | analyst123  |
| Viewer  | viewer@finance.com     | viewer123   |

### 5. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

##  Role Permissions Matrix

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| Login / Register | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| Create transactions | ❌ | ✅ | ✅ |
| Update own transactions | ❌ | ✅ | ✅ |
| Update any transaction | ❌ | ❌ | ✅ |
| Delete / Restore transactions | ❌ | ❌ | ✅ |
| Category & trend analytics | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View admin stats | ❌ | ❌ | ✅ |

---

## API Reference

All responses follow a consistent structure:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... },
  "meta": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
}
```

Base URL: `http://localhost:5000/api/v1`

---

###  Auth Endpoints

#### Register
```
POST /auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "viewer"
}
```

#### Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "admin@finance.com",
  "password": "admin123"
}
```
**Response includes a `token`** — use it as `Authorization: Bearer <token>` for all protected routes.

#### Get My Profile
```
GET /auth/me
Authorization: Bearer <token>
```

#### Update My Profile
```
PATCH /auth/me
Authorization: Bearer <token>
```
**Body (any field):**
```json
{
  "name": "New Name",
  "password": "newpassword123"
}
```

---

###  User Management (Admin Only)

#### Get All Users
```
GET /users?page=1&limit=10&role=analyst&status=active
Authorization: Bearer <admin_token>
```

#### Get User by ID
```
GET /users/:id
Authorization: Bearer <admin_token>
```

#### Update User Role / Status
```
PATCH /users/:id
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "role": "analyst",
  "status": "inactive"
}
```

#### Delete User
```
DELETE /users/:id
Authorization: Bearer <admin_token>
```

---

### Transaction Endpoints

#### Get All Transactions
```
GET /transactions
Authorization: Bearer <token>
```
**Query params (all optional):**

| Param | Type | Example |
|---|---|---|
| type | string | income / expense |
| category | string | salary / food / rent |
| startDate | ISO date | 2024-01-01 |
| endDate | ISO date | 2024-03-31 |
| search | string | salary |
| page | number | 1 |
| limit | number | 10 |
| sortBy | string | date / amount |
| order | string | asc / desc |

#### Get Transaction by ID
```
GET /transactions/:id
Authorization: Bearer <token>
```

#### Create Transaction (Analyst / Admin)
```
POST /transactions
Authorization: Bearer <analyst_token>
```
**Body:**
```json
{
  "title": "Monthly Salary",
  "amount": 75000,
  "type": "income",
  "category": "salary",
  "date": "2024-03-05",
  "notes": "March salary credit"
}
```

**Valid categories:** `salary`, `freelance`, `investment`, `business`, `food`, `transport`, `utilities`, `rent`, `healthcare`, `education`, `entertainment`, `shopping`, `travel`, `other`

#### Update Transaction (Analyst / Admin)
```
PATCH /transactions/:id
Authorization: Bearer <token>
```
> Analysts can only update their own transactions. Admins can update any.

#### Delete Transaction — Soft Delete (Admin Only)
```
DELETE /transactions/:id
Authorization: Bearer <admin_token>
```

#### Restore Deleted Transaction (Admin Only)
```
PATCH /transactions/:id/restore
Authorization: Bearer <admin_token>
```

---

### 📊 Dashboard Analytics

#### Summary (All Roles)
```
GET /dashboard/summary?startDate=2024-01-01&endDate=2024-03-31
Authorization: Bearer <token>
```
**Response:**
```json
{
  "data": {
    "totalIncome": 270000,
    "totalExpenses": 57500,
    "netBalance": 212500,
    "totalTransactions": 16
  }
}
```

#### Recent Activity (All Roles)
```
GET /dashboard/recent?limit=5
Authorization: Bearer <token>
```

#### Category Breakdown (Analyst / Admin)
```
GET /dashboard/by-category?type=expense
Authorization: Bearer <token>
```

#### Monthly Trend (Analyst / Admin)
```
GET /dashboard/monthly-trend?months=6
Authorization: Bearer <token>
```

#### Weekly Trend (Analyst / Admin)
```
GET /dashboard/weekly-trend?weeks=8
Authorization: Bearer <token>
```

#### Admin Stats (Admin Only)
```
GET /dashboard/admin-stats
Authorization: Bearer <admin_token>
```
**Response:**
```json
{
  "data": {
    "users": {
      "total": 3,
      "active": 3,
      "inactive": 0,
      "byRole": [
        { "role": "admin", "count": 1 },
        { "role": "analyst", "count": 1 },
        { "role": "viewer", "count": 1 }
      ]
    },
    "transactions": {
      "total": 16,
      "deleted": 0
    }
  }
}
```

---

###  Health Check

```
GET /health
```

---

##  Security Features

- **JWT Authentication** — Stateless, token-based auth with expiry
- **Role-Based Access Control** — Middleware-level route protection
- **Helmet** — Sets secure HTTP response headers
- **Rate Limiting** — 100 requests/15 min globally; 20/15 min on auth routes
- **Input Validation** — All inputs validated via express-validator before hitting controllers
- **Password Hashing** — bcryptjs with salt factor 12
- **Soft Deletes** — Transactions are never permanently removed (admin can restore)
- **Inactive User Block** — Deactivated users are rejected at the auth middleware level
- **Request Size Limit** — JSON body capped at 10kb

---

##  Additional Features

| Feature | Details |
|---|---|
| Soft Delete + Restore | Deleted transactions are flagged, not removed. Restorable by admin. |
| Pagination | All list endpoints support `page` and `limit` |
| Search | Full-text search on transaction title and notes |
| Sorting | Sort by any field with `sortBy` and `order` |
| Date Range Filtering | Filter transactions and summaries by `startDate` / `endDate` |
| DB Indexes | Indexed on `type`, `category`, `date`, `createdBy` for query performance |
| Graceful Shutdown | SIGTERM handling for clean process exit |
| Seeder Script | Pre-populates demo users and realistic transactions |

---

##  Assumptions Made

1. **Registration is open** — Any user can self-register. Role defaults to `viewer`. Admins can later promote users.
2. **Analyst scope** — Analysts can create and edit their own transactions, but not delete them.
3. **Soft delete only** — Transactions are soft-deleted to preserve financial history integrity.
4. **Single currency** — All amounts are stored as plain numbers without currency denomination.
5. **Date stored as-is** — No timezone conversion; dates are stored in UTC as provided.
6. **No refresh tokens** — For simplicity, JWTs expire after 7 days and re-login is required.

---

##  Postman Collection

Import the collection from the `/postman` folder (if provided) or manually set:

- **Base URL:** `http://localhost:5000/api/v1`
- **Variable:** `token` — set this after login using the JWT from the response
- Add header: `Authorization: Bearer {{token}}` on protected requests

---

## Author

**Dhanush P**
Saveetha Engineering College

[![GitHub](https://img.shields.io/badge/GitHub-DhanushPalani31-181717?style=flat&logo=github)](https://github.com/DhanushPalani31/)
