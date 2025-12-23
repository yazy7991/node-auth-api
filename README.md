# REST API Authentication & Authorization (Node.js)
This project is a Node.js REST API that implements authentication and role based authorization using JWT, bcrypt and NedDB.
It supports user registration, login, access tokens, refresh tokens, and protected routes with role checks.

## 🚀 Features

- User registration with password hashing
- User login with JWT access & refresh tokens
- Refresh token rotation
- Protected routes with authentication middleware
- Role-based authorization (`admin`,`moderator`,`member`)
- Lightweight file-based database using NeDB
- Environment-based secret management

## 🛠 Tech Stack

- Node.js
- Express.js
- NeDB (nedb-promises)
- JWT (jsonwebtoken)
- bcryptjs
- dotenv

## 🔐 Authentication Flow

1. User registers
2. User logs in -> receives:
    - `access_token` (1 hour)
    - `refresh_token` (1 week)
3. Access token is sent in request headers
4. Refresh token can be used to request a new access token
5. Role-based routes validate user permissions
