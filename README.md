# SmartStudy – Student Task & Study Planner

A beginner-friendly MERN stack project. Features: registration/login, dashboard statistics, task CRUD, subject management, task status, and due dates.

## Requirements
- Node.js (LTS)
- MongoDB Community Server running locally, or a MongoDB Atlas connection
- VS Code

## 1. Start MongoDB
For local MongoDB, make sure the MongoDB service is running. The default connection is:
`mongodb://127.0.0.1:27017/smartstudy`

## 2. Start backend
Open a terminal:
```bash
cd SmartStudy/backend
npm install
```
Copy `.env.example` to `.env` and update `JWT_SECRET` with a long random value. Keep `.env` private.
```bash
npm run dev
```
Backend runs at http://localhost:5000

## 3. Start frontend
Open a second terminal:
```bash
cd SmartStudy/frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal, usually http://localhost:5173

## 4. Use the app
Register an account, add subjects, add study tasks, mark tasks complete, and view progress. Data is saved in MongoDB.

## API overview
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET/POST `/api/subjects`
- DELETE `/api/subjects/:id`
- GET/POST `/api/tasks`
- PUT/DELETE `/api/tasks/:id`

All subject/task routes require `Authorization: Bearer <token>`.

## Notes
- This is a learning/demo project. Before public deployment, configure production CORS, HTTPS, environment secrets, input validation, and deployment-specific API URLs.
- Passwords are hashed with bcryptjs; JWT tokens are used for login sessions.
