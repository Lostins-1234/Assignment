# Fuel EU Maritime Compliance Platform

A full-stack application for managing Fuel EU Maritime compliance, featuring route management, compliance balance calculation, banking, and pooling functionality.

## 🚀 Quick Start Guide

Follow these steps to get the application running locally in minutes.

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (Local or Cloud like Neon/Supabase)
- **Git**

### 1. Repository Setup
```bash
git clone <your-repo-url>
cd fuel-eu-maritime
```

### 2. Backend Setup
The backend handles the business logic and database connections.

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure Environment Variables
# Create a .env file with your database content
echo "DATABASE_URL=\"postgresql://user:password@host:5432/dbname\"" > .env
# (Replace the connection string with your actual PostgreSQL URL)

# Setup Database (Migrate and Seed)
npx prisma generate
npm run db:migrate
npm run db:seed

# Start the Backend Server
npm run dev
```
*Backend runs on: `http://localhost:3001`*

### 3. Frontend Setup
The frontend is the user interface built with React and Vite.

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the Frontend
npm run dev
```
*Frontend runs on: `http://localhost:5173` (or similar, check terminal output)*

---

## 🏗️ Architecture

The project follows **Hexagonal Architecture** principles for maintainability and testing.

- **Frontend**: React, TypeScript, Tailwind CSS, Vite.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Database**: PostgreSQL.

### Project Structure
```
fuel-eu-maritime/
├── backend/
│   ├── src/
│   │   ├── core/           # Domain logic & Use/Cases
│   │   ├── adapters/       # HTTP Handlers & DB Repositories
│   │   └── infrastructure/ # Framework setup
│   └── prisma/             # Database Schema
├── frontend/
│   ├── src/
│   │   ├── core/           # Domain Models
│   │   ├── adapters/       # UI Components
│   │   └── shared/         # Hooks & Utils
```

## ✨ Features

- **Route Management**: Track vessel routes, fuel consumption, and GHG intensity.
- **Compliance Calculation**: Automatically calculate Compliance Balance (CB) based on EU regulations.
- **Banking**: Bank surplus compliance credits for future years.
- **Pooling**: Group vessels to share compliance targets.
- **Visualizations**: Interactive charts for comparing route emissions.

## 🛠️ Development Commands

| Component | Command | Description |
|-----------|---------|-------------|
| **Backend** | `npm run dev` | Start dev server |
| | `npm run db:migrate` | Run DB migrations |
| | `npm run db:studio` | View DB data in browser |
| **Frontend** | `npm run dev` | Start React dev server |
| | `npm run build` | Build for production |

## 📸 Screenshots

| Dashboard | Comparison |
|-----------|------------|
| ![Dashboard](screenshots/dashboard.png) | ![Comparison](screenshots/comparison.png) |

| Banking | Pooling |
|---------|---------|
| ![Banking](screenshots/banking.png) | ![Pooling](screenshots/pooling.png) |

## ❓ Troubleshooting

**Database Connection Failed?**
- Ensure your PostgreSQL server is running.
- Verify the `DATABASE_URL` in `backend/.env` is correct.
- If using a cloud DB (Neon), ensure your IP is allowed.

**Port Configs**
- Backend defaults to port `3001`.
- Frontend defaults to port `5173` (Vite default) or `3000`.

## 📜 License
ISC
