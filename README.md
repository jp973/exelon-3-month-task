# Multi-Role Auth Backend

A scalable Node.js + Express + TypeScript backend with JWT-based authentication and role-based access control for `admin`, `member`, and `user` roles. Built with clean architecture and middleware-driven request handling.

---

## 🚀 Features

- 🔐 JWT Authentication (Access + Refresh Tokens)
- 👥 Role-Based Access Control (Admin, Member, User)
- 🧾 Swagger API Documentation
- 🍪 Secure Cookie-Based Token Storage
- 🔄 Token Revocation & Logout
- 📦 MongoDB (with Mongoose ODM)
- ⚙️ Middleware Logging (Entry/Exit Logs)
- 🧪 Validation using `express-validator`
- 📁 Scalable Project Structure

---

## 📁 Project Structure

project/
├── src/
│ ├── controllers/
│ ├── db/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ └── index.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md


---

## 📦 Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- Passport.js (Bearer Strategy)
- JSON Web Tokens (JWT)
- dotenv, bcryptjs, express-validator
- Swagger for API Docs

---

## 🛠️ Setup Instructions

```bash
# 1. Clone the repo
git clone https://github.com/jp973/exelon-internship-tasks.git

# 2. Navigate to project
cd multi-role-auth-backend

# 3. Install dependencies
npm install

# 4. Setup .env file
cp .env.example .env
# Fill in your environment variables

# 5. Seed Admin
npm run seed:admin

# 6. Start the server
npm run dev

🌐 API Docs
Swagger UI available at:
http://localhost:3000/api-docs

📜 Environment Variables (.env)

PORT=3000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret
NODE_ENV=development

👨‍💻 Author
jayaprakash
🔗 GitHub

