# WorkBoard – Task Management System

A full-stack task management application built with **FastAPI, React, SQLite, and JWT Authentication**. WorkBoard allows users to securely manage their tasks through a clean, responsive dashboard.

## Overview

WorkBoard is designed to provide a simple and secure workspace where users can create, organize, update, and track their tasks.

The application follows a client-server architecture:
- **Frontend:** React provides the user interface.
- **Backend:** FastAPI handles API requests and business logic.
- **Database:** SQLite stores user and task information.
- **Authentication:** JWT secures protected endpoints and identifies authenticated users.

## Features

### Authentication and Security
- User registration and login.
- Password hashing using Argon2.
- JWT-based authentication.
- Protected API endpoints.
- User-specific task access.

### Task Management
- Create new tasks.
- View all tasks.
- Update task details.
- Delete tasks.
- Track task status:
  - Pending
  - In Progress
  - Completed

### Dashboard
- Responsive React interface.
- Task statistics and overview.
- Search tasks.
- Filter tasks by status.
- User profile and logout functionality.

## Technology Stack

| Category | Technology |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| HTTP Client | Axios |
| Routing | React Router |
| Backend | Python, FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| Authentication | JWT |
| Password Hashing | Argon2 |
| API Documentation | Swagger UI |

## Project Structure

```text
workboard/
│
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   └── models.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── styles.css
│   │   ├── utils.js
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

Make sure the following are installed:

- Python 3.10+
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/richajoshi-debug/Workboard.git
cd Workboard
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python3 -m venv ../venv
source ../venv/bin/activate
```

Install the required dependencies:

```bash
pip install fastapi uvicorn sqlalchemy pyjwt "pwdlib[argon2]" python-multipart
```

Start the FastAPI development server:

```bash
uvicorn main:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Frontend URL:

`http://localhost:5173`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Retrieve authenticated user details |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Retrieve user's tasks |
| POST | `/tasks` | Create a new task |
| GET | `/tasks/{task_id}` | Retrieve a specific task |
| PUT | `/tasks/{task_id}` | Update a task |
| DELETE | `/tasks/{task_id}` | Delete a task |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check backend health |

## Authentication Flow

WorkBoard uses JSON Web Tokens (JWT) to authenticate users.

1. A user registers with an email and password.
2. The password is hashed before being stored in the database.
3. The user logs in with their credentials.
4. The backend verifies the credentials and generates a JWT access token.
5. The frontend stores the token and attaches it to protected API requests using the Bearer authentication scheme.
6. The backend validates the token and identifies the authenticated user.
7. Task queries are restricted to the authenticated user's data.

## Configuration

The frontend API service uses the following default backend URL:

```javascript
http://127.0.0.1:8000
```

It can also be configured using the `VITE_API_URL` environment variable.

For local development, ensure the backend allows requests from:

```text
http://localhost:5173
```

## Future Improvements

- Refresh token implementation.
- Improved validation and error handling.
- Database migrations.
- Pagination and advanced task filtering.
- Redis caching.
- Background task processing.
- Automated testing.
- Production deployment.

## Learning Outcomes

This project demonstrates practical implementation of:

- REST API development using FastAPI.
- Frontend development using React.
- Database integration using SQLAlchemy.
- User authentication and authorization using JWT.
- Password hashing and secure credential handling.
- Frontend-backend API communication.
- Git and GitHub version control.

## Author

**Richa Joshi**

GitHub: [richajoshi-debug](https://github.com/richajoshi-debug)

**Project:** [WorkBoard – Task Management System](https://github.com/richajoshi-debug/Workboard)

---

*WorkBoard – Make progress, one task at a time.*
