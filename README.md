# DeFi Staking Platform

A full-stack Single Page Application (SPA) simulating a decentralized finance (DeFi) staking platform. Users can stake crypto assets into liquidity pools to earn rewards based on APY. The project implements role-based access control, internationalization, and real-time data processing.

## 🛠 Tech Stack

* **Frontend:** Vue.js 3, Vite, Vue Router, Pinia (State Management), Vue-i18n.
* **Backend:** Node.js, Express.js.
* **Database:** SQLite (Relational DB with Many-to-Many relationships).
* **Security:** JWT (JSON Web Tokens), bcryptjs (Password Hashing).

---

## How to Run the Project

### Prerequisites
* Node.js installed (v14 or higher).
* NPM (Node Package Manager).

### Step 1: Backend Setup

1.  Open a terminal and navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` folder and paste the following:
    ```env
    PORT=3000
    JWT_SECRET=super_secret_defi_key_2025
    DB_PATH=./database.sqlite
    ```
4.  Initialize the Database (Create tables & Seed data):
    ```bash
    node setup_db.js
    ```
    *(You should see "Tables created successfully" and "Sample data inserted")*

5.  Start the Server:
    ```bash
    node server.js
    ```
    *Server runs at: http://localhost:3000*

### Step 2: Frontend Setup

1.  Open a **new** terminal window and navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open the link shown in the terminal (usually `http://localhost:5173`) in your browser.

---

## 🔑 Test Credentials

The database is pre-seeded with the following accounts for testing roles:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@defi.com` | `admin123` | Can create new Pools, View all pools. |
| **User** | `investor@defi.com` | `user123` | Can Stake, View own stakes, Claim rewards, Update Profile. |
| **Guest** | *(No login)* | - | Can view pools only. Must register to stake. |

---

## 📂 Project Structure

```text
defi-staking-project/
├── backend/                 # API & Database
│   ├── config/              # DB Connection
│   ├── controllers/         # Business Logic
│   ├── middleware/          # Auth & Role checks
│   ├── routes/              # API Endpoints
│   ├── database.sqlite      # SQLite File (Created after setup)
│   ├── server.js            # Entry point
│   └── setup_db.js          # DB Init Script
│
└── frontend/                # Vue.js SPA
    ├── src/
    │   ├── assets/          # CSS Styles
    │   ├── locales/         # Translation files (en.js, ua.js)
    │   ├── router/          # Vue Router config
    │   ├── services/        # Axios setup
    │   ├── stores/          # Pinia State (Auth)
    │   └── views/           # Pages (Dashboard, Login, Profile...)
    └── package.json
