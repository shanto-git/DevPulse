# DevPulse
Live URL:  https://dev-pulse-ashen.vercel.app

Features:-
Role-Based Access Control (RBAC): Restricts and grants API access based on user roles (maintainer and contributor) verified via secure JWT(json web token).

Issue Management: Complete system CRUD operations allowing users to log, view, update, and remove software bugs or feature requests.

Contributor Restrictions: Contributors possess strict boundaries; they can only update issues they personally reported, and mutations are exclusively permitted while the issue status remains 'open'.

Maintainer Privileges: Maintainers hold absolute administrative control, granting them authorization to modify or permanently delete any issue within the system.

Database Optimization: High-efficiency architecture utilizing optimized raw SQL queries that run seamlessly without relying on expensive database JOIN operations.

Tech Stack
Backend Framework: Node.js with Express.js

Programming Language: TypeScript

Database Architecture: PostgreSQL (NeonDB)

Authentication & Security: JSON Web Tokens (JWT) and bcryptjs

Setup Steps
1. Clone the Repository
git clone https://github.com/shanto-git/DevPulse.git
cd DevPulse

2. Install Dependencies
npm install

3. Configure Environment Variables
Create a .env file in the root directory of the project and populate it with the following configuration keys:
PORT= your_port_key
DATABASE_URL=your_postgresql_connection_string
SECRET=your_jwt_secret_key


4. Run the Application
Execute the following command to initiate the backend server locally with hot-reloading enabled:
npm run dev

API Endpoint List:-
Authentication Paths
POST /api/auth/signup - Registers a brand new user account inside the system.

POST /api/auth/login - Validates user credentials and returns a secure JWT bearer token.

Issue Tracker Paths
POST /api/issues - Creates and saves a new issue into the system (Authenticated access required).

GET /api/issues - Retrieves all system issues, integrated with server-side filtering and sorting metrics (Authenticated access required).

GET /api/issues/:id - Fetches specific data details of a single issue tracked by its unique ID (Authenticated access required).

PATCH /api/issues/:id - Updates fields of an issue governed strictly by user role and current open/closed status rules (Authenticated access required).

DELETE /api/issues/:id - Purges an issue completely from the system infrastructure (Strictly restricted to Maintainers only).

Database Schema Summary:-
users Table Structure:
id = SERIAL | PRIMARY KEY, UNIQUE, NOT NULL
name = VARCHAR | NOT NULL
email = VARCHAR | UNIQUE, NOT NULL
password = VARCHAR | NOT NULL
role = VARCHAR | NOT NULL (Value must be 'maintainer' or 'contributor')
created_at = TIMESTAMP | DEFAULT NOW()

issues Table Structure:
id = SERIAL | PRIMARY KEY, UNIQUE
title = VARCHAR(150) | NOT NULL
description = TEXT | NOT NULL
type = VARCHAR(20) | NOT NULL (Value must be 'bug' or 'feature')
status = VARCHAR(20) | DEFAULT 'open' (Value must be 'open', 'in_progress', or 'closed')
reporter_id = UUID / INT | FOREIGN KEY, REFERENCES users(id) ON DELETE CASCADE
created_at = TIMESTAMP | DEFAULT NOW()
updated_at = TIMESTAMP | DEFAULT NOW()