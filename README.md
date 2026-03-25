# 🍽️ RecipeBook

A full-stack recipe sharing web app built with **React + Vite**, **Node.js + Express**, and **MySQL**.

---

## 📁 Folder Structure

```
recipebook/
├── backend/
│   ├── config/db.js              ← MySQL pool (mysql2 promise)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── recipeController.js
│   │   └── commentController.js
│   ├── middleware/authMiddleware.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── recipes.js
│   │   └── comments.js
│   ├── uploads/                  ← auto-created on first run
│   ├── .env                      ← copy from .env.example
│   ├── package.json
│   ├── schema.sql                ← DB schema + sample data
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AuthContext.jsx   ← global auth state
    │   │   ├── Navbar.jsx
    │   │   ├── RecipeCard.jsx
    │   │   └── RecipeForm.jsx    ← shared create/edit form
    │   ├── pages/
    │   │   ├── Home.jsx          ← hero, featured, category cards
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Profile.jsx       ← my recipes + edit profile
    │   │   ├── Explore.jsx       ← search + category filter
    │   │   ├── RecipeDetail.jsx  ← ingredients, steps, comments
    │   │   ├── CreateRecipe.jsx
    │   │   └── EditRecipe.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

---

## 🚀 Setup & Run Instructions

### Prerequisites
- **Node.js** v18+ 
- **MySQL** 8.0+ running locally (or via XAMPP / MySQL Workbench)

---

### Step 1 — Create the Database

Open your MySQL client and run:

```bash
mysql -u root -p < backend/schema.sql
```

Or paste the contents of `backend/schema.sql` into MySQL Workbench and execute.

This creates the `recipebook` database with tables `users`, `recipes`, `comments` and inserts sample data.

---

### Step 2 — Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=recipebook
JWT_SECRET=change_this_to_a_long_random_string
FRONTEND_URL=http://localhost:5173
```

---

### Step 3 — Install & Run Backend

```bash
cd backend
npm install
npm run dev        # uses nodemon for hot reload
# or: npm start   # production
```

You should see:
```
✅ MySQL connected successfully
🚀 RecipeBook API running on http://localhost:5000
```

---

### Step 4 — Install & Run Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Sample User Credentials

All sample users have password: `password123`

| Username    | Email                  |
|-------------|------------------------|
| chef_marco  | marco@example.com      |
| sarah_bakes | sarah@example.com      |
| spice_king  | raj@example.com        |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint             | Auth | Description         |
|--------|----------------------|------|---------------------|
| POST   | /api/auth/register   | ✗    | Register user       |
| POST   | /api/auth/login      | ✗    | Login               |
| GET    | /api/auth/me         | ✓    | Get current user    |
| PUT    | /api/auth/profile    | ✓    | Update profile      |

### Recipes
| Method | Endpoint                   | Auth | Description              |
|--------|----------------------------|------|--------------------------|
| GET    | /api/recipes               | ✗    | List (search + category) |
| GET    | /api/recipes/featured      | ✗    | Featured recipes         |
| GET    | /api/recipes/user/:userId  | ✗    | User's recipes           |
| GET    | /api/recipes/:slug         | ✗    | Single recipe            |
| POST   | /api/recipes               | ✓    | Create recipe            |
| PUT    | /api/recipes/:id           | ✓    | Update (owner only)      |
| DELETE | /api/recipes/:id           | ✓    | Delete (owner only)      |

### Comments
| Method | Endpoint                  | Auth | Description            |
|--------|---------------------------|------|------------------------|
| GET    | /api/comments/:recipeId   | ✗    | Get recipe comments    |
| POST   | /api/comments/:recipeId   | ✓    | Post comment           |
| DELETE | /api/comments/:commentId  | ✓    | Delete own comment     |

---

## ✨ Features

- **Landing page** — hero search, featured recipes, category cards, CTA banner
- **Auth** — JWT-based login/register with bcrypt hashing, password strength meter
- **Explore page** — real-time search + category filter + pagination
- **Recipe detail** — interactive step checklist, comment section, owner controls
- **Create/Edit recipe** — dynamic ingredient & instruction lists, image upload
- **Profile page** — my recipes list, edit username/bio/avatar
- **Global navbar search** — redirects to /recipes with query pre-filled
- **Owner-only controls** — edit/delete buttons only visible to recipe owner
- **Comments** — logged-in users only; users can delete their own

---

## 🎨 Design System

| Token       | Value         |
|-------------|---------------|
| Font display | Playfair Display |
| Font body   | DM Sans       |
| Primary     | Terracotta `#D4603A` |
| Background  | Cream `#fdf9ec` |
| Text        | Bark `#2E1A0A` |
| Accent      | Sage `#7A9E6A` |

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express 4, mysql2 (promise pool), bcryptjs, jsonwebtoken, multer, slugify, dotenv, cors

**Frontend:** React 18, React Router v6, Tailwind CSS v3, axios, lucide-react, Vite 5

**Database:** MySQL 8 — tables: `users`, `recipes` (JSON columns), `comments`
