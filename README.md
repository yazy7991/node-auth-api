# Node Auth API

Lightweight Node.js authentication API demonstrating JWT, refresh tokens, 2FA helpers, and simple file-based data storage.

## Overview

This project implements authentication primitives (register, login, token refresh, logout) and user management endpoints. It uses Express and a small file-based datastore via `nedb-promises`. Utility modules provide token helpers, caching, and OTP/QR code support.

## Features

- JWT access tokens and refresh tokens
- Token invalidation and refresh handling
- Basic role/authorization middleware
- OTP (2FA) helper support and QR code generation
- Simple file-based storage (NeDB)

## Tech Stack

- Node.js + Express
- JSON Web Tokens (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- NeDB (`nedb-promises`) for lightweight persistence
- In-memory cache (`node-cache`)
- OTP support (`otplib`) and `qrcode`
- Environment config via `dotenv`

## Prerequisites

- Node.js 18+ recommended

## Install

Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd node-auth-api
npm install
```

## Environment

Create a `.env` file in the project root. Common variables used by this project include:

- `PORT` — port the server listens on (default: `3000`)
- `JWT_SECRET` — secret for signing access tokens
- `REFRESH_TOKEN_SECRET` — secret for refresh tokens
- `OTP_ISSUER` — (optional) issuer name used when generating OTP QR codes

Adjust these as needed for your deployment.

## Available NPM scripts

From `package.json`:

- `npm start` — start server with `node server.js`
- `npm run dev` — start server with `nodemon` for development
- `npm test` — placeholder test script

## Running the App

Start the server:

```bash
npm run dev
```

By default the app entry is `server.js` (see `main` in `package.json`).

## Project Structure

- `server.js`, `app.js` — app/server bootstrap
- `routes/` — route definitions (`auth.routes.js`, `users.routes.js`, `roles.routes.js`)
- `controllers/` — request handlers
- `middleware/` — `authenticate.js`, `authorize.js`
- `models/` — data models (NeDB-backed)
- `utils/token.js` — token helpers
- `cache/` — caching utilities

## Inspect Endpoints

See the route files in the `routes/` folder for available endpoints and required request payloads. Typical endpoints you will find:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /users` (protected)

## Notes

- This project uses a lightweight file-based datastore; for production, consider switching to a managed DB (Postgres/MongoDB).
- Secure your secrets and use HTTPS in production.

## License

ISC

## Where to look next

Open the controllers in `controllers/` and routes in `routes/` to adapt endpoints. See `middleware/` for auth/authorization hooks.
