# Task Management System (TMS)

A full-stack collaborative Task Management System featuring role-based access control, task assignments, real-time notifications via WebSockets, and a modern responsive React frontend.

## Features

- **Role-Based Access Control (RBAC):** Users, Project Managers, and Admins.
- **Authentication:** JWT-based login with mandatory initial password reset.
- **Task Management:** Create, assign, comment on, and track the status of tasks.
- **Real-time Notifications:** Instant WebSockets notifications for task assignments and status updates.
- **API Documentation:** Interactive Swagger UI for exploring the backend API.
- **Dockerized:** Fully dockerized backend, frontend, and MySQL database for easy deployment.

## Tech Stack

- **Frontend:** React, React Router, Vite, Socket.io-client.
- **Backend:** Node.js, Express, Prisma ORM, Socket.io, Swagger.
- **Database:** PostgreSQL.
- **Deployment:** Docker, Docker Compose, Nginx.

## Running Locally (Without Docker)

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL running locally

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure your `.env` file with `DATABASE_URL` (PostgreSQL) and `JWT_SECRET`.
4. Run migrations: `npx prisma migrate dev`
5. Seed data: `npx prisma db seed` (if available)
6. Start the server: `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Start the dev server: `npm run dev`

## Running with Docker Compose

You can easily run the entire application (Database, Backend, and Frontend) using Docker.

1. Ensure you have Docker and Docker Compose installed.
2. From the root of the project, run:
   ```bash
   docker-compose up --build
   ```
3. Once all containers are up and running:
   - **Frontend:** [http://localhost](http://localhost)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)
   - **API Documentation:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## License
MIT