# WorkBoard Frontend

React + Vite frontend for the WorkBoard FastAPI backend.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Backend assumptions

This frontend is wired to these API routes:

- `POST /auth/register` — accepts `email` and `password` as query parameters
- `POST /auth/login` — OAuth2 form fields `username` and `password`
- `GET /auth/me` — returns the authenticated user's details
- `GET /tasks` — returns the authenticated user's tasks
- `POST /tasks` — creates a task with `title`, `description`, `status`
- `PUT /tasks/{task_id}` — updates a task with `title`, `description`, `status`
- `DELETE /tasks/{task_id}` — deletes a task

Task objects are expected to contain `id`, `title`, `description`, and `status`.

If your backend uses `PATCH` rather than `PUT`, or a different registration body format, adjust the corresponding call in `src/App.jsx`.

## CORS

Your FastAPI app should allow the React origin:

```python
allow_origins=["http://localhost:5173"]
```

## API URL

By default the app connects to `http://127.0.0.1:8000`. To override, copy `.env.example` to `.env` and set `VITE_API_URL`.

## Note about token storage

For this learning project, the access token is stored in `localStorage`. This is convenient for development, but production applications should consider an HttpOnly, Secure, SameSite cookie-based authentication design and appropriate CSRF protections.
