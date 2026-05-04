# Grind — Social Habit Tracker

Grind is a full-stack social habit tracker focused on building better daily routines through accountability, real-time progress sharing, and consistency.

Unlike a typical private todo-style habit tracker, Grind adds a social layer: users can manage their own daily habits, connect with friends, see their progress in real time, and track completed days and streaks on their profiles.

Live demo: https://grind-iota.vercel.app/

---

## Demo Accounts

You can use the following demo accounts to test the app:

| Username | Password |
|---|---|
| Adam | adam123 |
| Karol | karol123 |
| Janek | janek123 |

To test social and real-time features, open the app in two browser windows or in normal + incognito mode and log in as two different users.

---

## Features

### Authentication

Users can create an account and log in to access their personal dashboard.

![Login demo](./docs/demo/login.gif)

---

### Habit Management

Users can create, edit, delete, and complete daily habits. The main dashboard shows today's progress and allows quick habit completion.

![Habit CRUD demo](./docs/demo/habits-crud.gif)

---

### Friends System

Users can search for other users, send friend requests, accept invitations, and build their own accountability network.

![Friends demo](./docs/demo/friends.gif)

---

### Real-Time Social Dashboard

When a user completes or uncompletes a habit, their friends can see the update in real time. This is implemented with WebSockets, making the dashboard feel live and social.

![Real-time dashboard demo](./docs/demo/realtime.gif)

---

### Profiles, Completed Days & Streaks

Each user has a profile with a visual calendar of completed days. The profile also shows total completed days and streak statistics.

![Profile demo](./docs/demo/profile.gif)

---

## Tech Stack

### Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA / Hibernate
- MySQL
- JWT-based authentication
- WebSocket / STOMP for real-time updates

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- STOMP client / SockJS for WebSocket communication

### Database

- MySQL
- Docker used for local database setup

### Deployment

- Frontend deployed on Vercel
- Backend deployed on Railway
- MySQL hosted on Railway

---

## Architecture Overview

The project is separated into frontend and backend applications.

```text
Grind/
├── backend/
└── frontend/
```

### Backend Structure

The backend is organized by domain-oriented packages, for example:

```text
backend/src/main/java/com/grind/backend/
├── auth/
├── user/
├── habit/
├── friendship/
├── dashboard/
├── completedday/
├── streak/
├── profile/
└── realtime/
```

Main backend responsibilities:

- user registration and login,
- JWT token generation and validation,
- habit CRUD operations,
- daily habit completion tracking,
- friend request management,
- dashboard aggregation,
- real-time WebSocket events,
- completed days and streak calculation,
- profile aggregation endpoint.

### Frontend Structure

The frontend uses React pages, hooks, and reusable UI components.

Main frontend responsibilities:

- authentication screens,
- authenticated dashboard layout,
- habit management page,
- friends page,
- profile page,
- real-time dashboard updates,
- responsive UI for desktop and mobile.

---

## Interesting Technical Solutions

### Real-Time Habit Updates

The application uses WebSockets to send habit update events to the user and their friends. When a habit is completed, uncompleted, created, updated, or deleted, the backend publishes an event that the frontend receives and uses to refresh the dashboard.

### Completed Days

A completed day is stored when a user completes all of their habits for a given day. This makes it easy to display profile calendars and calculate streaks.

### Streaks

Current streak is calculated dynamically based on completed days. Best streak is stored separately and updated when the current streak exceeds the previous best value.

### Profile Aggregation

Instead of making multiple frontend requests for profile data, the backend exposes an aggregated profile endpoint that returns:

- user data,
- completed days count,
- completed days list,
- current streak,
- best streak.

---

## API Overview

Main API areas:

```text
/api/users
/api/auth
/api/habit
/api/friendships
/api/dashboard
/api/completed-days
/api/streaks
/api/profiles
/ws
```

Example key endpoints:

```text
POST   /api/users
POST   /api/auth/login

GET    /api/habit/habits
POST   /api/habit/habits
PUT    /api/habit/habits/{habitId}
DELETE /api/habit/habits/{habitId}

POST   /api/habit/habits/{habitId}/completions/today
DELETE /api/habit/habits/{habitId}/completions/today

GET    /api/dashboard

GET    /api/profiles/users/{userId}
```

---

## How to Run Locally

### Prerequisites

Make sure you have installed:

- Java 17+
- Node.js 18+
- npm
- Docker
- Git

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Grind
```

---

## 2. Start MySQL with Docker

If the project contains a Docker Compose file, start the database with:

```bash
docker compose up -d
```

If you use a manually started MySQL container, make sure your database configuration matches the backend `application.properties` or `application.yml`.

Example local database values:

```text
Database: grind_local
Username: grind_user
Password: grind_password
Port: 3306
```

---

## 3. Run the Backend

Go to the backend directory:

```bash
cd backend
```

Run the Spring Boot application:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

The backend should start on:

```text
http://localhost:8080
```

---

## 4. Run the Frontend

Open a second terminal and go to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create or update the frontend environment file if needed:

```env
VITE_API_URL=http://localhost:8080
```

Start the frontend:

```bash
npm run dev
```

The frontend should start on:

```text
http://localhost:5173
```

---

## 5. Test the App Locally

1. Open `http://localhost:5173`.
2. Create an account.
3. Add habits.
4. Open another browser/incognito window and log in as another user.
5. Send and accept friend requests.
6. Complete habits and observe real-time updates on the other account.
7. Visit profiles to see completed days and streaks.

---

## Environment Variables

### Frontend

```env
VITE_API_URL=http://localhost:8080
```

For production, this should point to the deployed backend URL.

### Backend

Typical backend configuration includes:

```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/grind_local
SPRING_DATASOURCE_USERNAME=grind_user
SPRING_DATASOURCE_PASSWORD=grind_password
JWT_SECRET=<your-secret>
```

Exact values may depend on your local setup.

---

## AI Usage

AI tools were used as support during development. They helped with:

- planning backend architecture,
- generating initial boilerplate for services, controllers, and DTOs,
- improving frontend UI prompts,
- refactoring React components,
- debugging dependency loops in React hooks,
- preparing README structure and demo presentation.

All generated code was reviewed, adjusted, and integrated manually.

---

## Demo Files

Demo GIFs are stored in:

```text
docs/demo/login.gif
docs/demo/habits-crud.gif
docs/demo/friends.gif
docs/demo/realtime.gif
docs/demo/profile.gif
```

---

## Project Status

Grind is an MVP created as a full-stack recruitment project. The core features are implemented:

- authentication,
- habit CRUD,
- daily completions,
- friends system,
- real-time dashboard,
- profiles,
- completed days calendar,
- streaks.
