# ProjectHub — Project Management Tool

**CodSoft Internship | Level 3 | Task 2**

Built a full-stack MERN project management platform with JWT authentication, Kanban workflows, task tracking, dashboard analytics, and responsive UI architecture.

---

## Live Demo
Frontend: [Deploying to Vercel...]
Backend: [Deploying to Render...]
Database: MongoDB Atlas

---

## Screenshots

![Dashboard](assets/screenshots/dashboard.png)
![Login](assets/screenshots/login.png)
![Kanban Board](assets/screenshots/kanban.png)

---

## Demo Login

| Field    | Value                 |
|----------|-----------------------|
| Email    | demo@projecthub.com   |
| Password | demo1234              |

> On the login page, click **"Auto-fill ⚡"** to fill credentials automatically, then click **Sign In**.

The demo account includes **3 pre-built projects** with tasks across all statuses (Todo, In Progress, Done).

---

## Features

- Register and login with JWT-based authentication
- Dashboard with live stats — projects, tasks, completed count, overall progress %
- Create projects with title, description, and deadline
- Delete a project (automatically deletes all its tasks too)
- Kanban board per project — **Todo → In Progress → Done**
- Add tasks with title, description, assignee name, and due date
- Animated progress bar per project
- Color-coded status badges (yellow / blue / green)
- Toast notifications on all actions (success & error)
- Mobile responsive with hamburger menu
- White & blue clean UI theme

---

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | React 18 + Vite                    |
| Styling   | Tailwind CSS v4 + Plain CSS        |
| Routing   | React Router DOM v6                |
| HTTP      | Axios                              |
| Backend   | Node.js + Express.js               |
| Database  | MongoDB Atlas + Mongoose           |
| Auth      | JWT (jsonwebtoken) + bcryptjs      |
| Toasts    | react-hot-toast                    |
| Icons     | lucide-react                       |

---

## Ports

| Project              | Backend | Frontend |
|----------------------|---------|----------|
| **This app**         | `5001`  | `3001`   |
| E-Commerce (CODSOFT) | `5000`  | `5173`   |

Both projects can run at the same time with no port conflicts.

---

## Folder Structure

```
CODESOFT2/
├── client/                          React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           Sticky top navbar with mobile menu
│   │   │   ├── ProjectCard.jsx      Project card with progress bar
│   │   │   ├── TaskCard.jsx         Task card with status badge & actions
│   │   │   └── ProtectedRoute.jsx   Redirects to /login if not logged in
│   │   ├── context/
│   │   │   └── AuthContext.jsx      JWT + user stored in localStorage
│   │   ├── pages/
│   │   │   ├── Login.jsx            Sign in page with demo credentials box
│   │   │   ├── Register.jsx         Create account page
│   │   │   ├── Dashboard.jsx        Stats overview + all projects grid
│   │   │   ├── CreateProject.jsx    New project form
│   │   │   └── ProjectDetail.jsx    Kanban board + add task modal
│   │   ├── App.jsx                  Routes + Toaster config
│   │   ├── main.jsx                 React entry point
│   │   └── index.css                CSS variables, card, button, input styles
│   ├── index.html                   HTML entry (Inter font, meta tags)
│   ├── vite.config.js               Vite + Tailwind plugin + API proxy
│   └── package.json
│
└── server/                          Node.js + Express backend
    ├── models/
    │   ├── User.js                  Schema with bcrypt pre-save hook
    │   ├── Project.js               Schema with owner ref to User
    │   └── Task.js                  Schema with status enum
    ├── routes/
    │   ├── auth.js                  POST /register, POST /login
    │   ├── projects.js              GET / POST / GET:id / DELETE:id
    │   └── tasks.js                 GET:projectId / POST / PATCH:status / DELETE
    ├── middleware/
    │   └── authMiddleware.js        Verifies JWT Bearer token on all protected routes
    ├── seed.js                      Seeds demo user + 3 projects + 13 tasks
    ├── server.js                    Express app, MongoDB connect, route mount
    ├── .env                         Port, Mongo URI, JWT secret
    └── package.json
```

---

## Setup Instructions

### 1. MongoDB Atlas (free cloud database)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → Sign up free
2. Click **Build a Database** → choose **M0 Free** → Create
3. Under **Security Quickstart**:
   - Set a **username** and **password** — save them
   - Click **Add My Current IP Address** → Finish
4. Go to **Network Access** → check the IP list shows `0.0.0.0/0`
   - If you see `00.00.00.00/0` → delete it (invalid) → add `0.0.0.0/0` instead
5. On cluster page → **Connect** → **Drivers** → copy the connection string
6. Edit `server/.env` — paste connection string and add database name:

```env
PORT=5001
MONGO_URI=mongodb+srv://your_user:your_pass@cluster0.xxxxx.mongodb.net/project-manager?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=any_secret_string_here
```

> ⚠️ If your password contains special characters like `@`, `#`, `!` — encode them:
> - `@` → `%40`
> - `#` → `%23`
> - `!` → `%21`

---

### 2. Install Dependencies

Install root, backend, and frontend dependencies all at once:

```bash
# In the root CODESOFT2 directory
npm install
npm run install-all
```

---

### 3. Seed Demo Data

```bash
cd server
node seed.js
```

Output when successful:
```
✅ Connected to MongoDB
👤 Demo user created: demo@projecthub.com / demo1234
🌱 Demo projects and tasks seeded!
✅ Done.
```

---

### 4. Start the Servers

You can start both the frontend and backend simultaneously from the root directory using the `concurrently` setup:

```bash
# In the root CODESOFT2 directory
npm run dev
```

Expected output:
```
[server] ✅ Connected to MongoDB
[server] 🚀 Server running on http://localhost:5001
[client] VITE ready in xxx ms
[client] ➜  Local: http://localhost:3001/
```

*(Alternatively, you can run them in separate terminals by navigating into the `server` and `client` folders and running `npm run dev` in each.)*

---

### 5. Open the App

Go to → **http://localhost:3001**

- Click **Auto-fill ⚡** on the login page → Sign In
- Or register a new account

---

## API Reference

All protected routes require header:
```
Authorization: Bearer <jwt_token>
```

### Auth
| Method | Endpoint              | Auth | Description             |
|--------|-----------------------|------|-------------------------|
| POST   | /api/auth/register    | ❌   | Register, returns JWT   |
| POST   | /api/auth/login       | ❌   | Login, returns JWT      |

### Projects
| Method | Endpoint              | Auth | Description                      |
|--------|-----------------------|------|----------------------------------|
| GET    | /api/projects         | ✅   | All projects of logged-in user   |
| POST   | /api/projects         | ✅   | Create project                   |
| GET    | /api/projects/:id     | ✅   | Single project                   |
| DELETE | /api/projects/:id     | ✅   | Delete project + all its tasks   |

### Tasks
| Method | Endpoint                   | Auth | Description              |
|--------|----------------------------|------|--------------------------|
| GET    | /api/tasks/:projectId      | ✅   | All tasks in a project   |
| POST   | /api/tasks                 | ✅   | Create task              |
| PATCH  | /api/tasks/:id/status      | ✅   | Update task status       |
| DELETE | /api/tasks/:id             | ✅   | Delete task              |

---

## Database Schemas

### User
| Field     | Type   | Rules                   |
|-----------|--------|-------------------------|
| name      | String | required                |
| email     | String | required, unique        |
| password  | String | required, bcrypt hashed |
| createdAt | Date   | auto                    |

### Project
| Field       | Type     | Rules              |
|-------------|----------|--------------------|
| title       | String   | required           |
| description | String   | optional           |
| deadline    | Date     | optional           |
| owner       | ObjectId | ref: User          |
| createdAt   | Date     | auto               |

### Task
| Field       | Type     | Rules                            |
|-------------|----------|----------------------------------|
| title       | String   | required                         |
| description | String   | optional                         |
| assignee    | String   | optional                         |
| dueDate     | Date     | optional                         |
| status      | String   | "Todo" / "In Progress" / "Done"  |
| project     | ObjectId | ref: Project                     |
| createdAt   | Date     | auto                             |

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `bad auth: authentication failed` | Wrong Atlas password in `.env` | Reset password in Atlas → Database Access → Edit |
| `querySrv ENOTFOUND` | `@` or special char in password breaks URI | URL-encode it: `@` → `%40` |
| `EADDRINUSE port 5001` | Port already in use | Run `npx kill-port 5001` then restart |
| `ECONNREFUSED` | Backend not running | Run `npm run dev` in server folder |
| `queryTxt EREFUSED` | DNS flicker, retry once | Stop and run `npm run dev` again |
| `JSON.parse undefined` (AuthContext) | Corrupted localStorage | Open browser console → run `localStorage.clear()` → refresh |
| IP whitelist error | `00.00.00.00/0` is invalid | Delete it in Atlas → Network Access → add `0.0.0.0/0` |

---

*CodSoft Internship — Level 3 Task 2 | Built with React + Node.js + MongoDB*
