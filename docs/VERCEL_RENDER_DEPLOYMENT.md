# Vercel and Render Deployment Guide

This document details the configuration and step-by-step process to deploy the **Internship & Placement Intelligence Platform** to managed cloud services: **Vercel** for the frontend, **Render** for the backend, and **Neon** (or Supabase) for the PostgreSQL database.

---

## Prerequisites
1. A GitHub repository containing the latest codebase.
2. A free account on [Neon](https://neon.tech/) (or Supabase) for the database.
3. A free account on [Render](https://render.com/) for backend hosting.
4. A free account on [Vercel](https://vercel.com/) for frontend hosting.

---

## 1. Managed PostgreSQL Database Setup (Neon)

We migrate the database from the local instance to a managed PostgreSQL cluster on Neon.

### Steps:
1. Log in to [Neon Console](https://neon.tech/).
2. Click **Create Project**.
3. Name your project (e.g., `placement-intelligence-db`), select PostgreSQL version (default `16` or `15` is fine), and choose your preferred region.
4. Click **Create Project**.
5. Once created, copy the **Connection string** from the dashboard. Ensure it looks like:
   ```text
   postgresql://<user>:<password>@<endpoint>/neondb?sslmode=require
   ```
6. Keep this connection string safe. This will be your production `DATABASE_URL`.

---

## 2. Deploy Backend API to Render

We host the Node/Express backend on Render as a Web Service.

### Steps:
1. Log in to [Render](https://render.com/).
2. Click **New** (top right) -> **Web Service**.
3. Link your GitHub repository.
4. Set the following settings:
   - **Name**: `placement-intelligence-backend`
   - **Environment**: `Node`
   - **Region**: Choose the region closest to your Neon database region.
   - **Branch**: `main` (or the branch you want to deploy).
   - **Root Directory**: `backend` *(Crucial: set this so Render knows where the backend code resides)*.
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx prisma db push && npm start` *(Note: `db push` ensures that Neon is synced with schema models on startup).*
5. Scroll down to **Environment Variables** and add the following keys:
   - `PORT`: `10000` (or let Render assign it automatically)
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *(Your Neon Connection String)*
   - `JWT_SECRET`: *(A random, secure cryptographic string, e.g., `supersecretkey123`)*
   - `JWT_EXPIRES_IN`: `7d`
   - `GEMINI_API_KEY`: *(Optional: your Google Gemini API key if using AI analyzer features)*
   - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`: *(Optional: if configuring S3 bucket for PDF storage. If left out, backend falls back to mock storage)*
6. Click **Create Web Service**.
7. Wait for the build and deployment process to finish. Once done, Render will display a public URL (e.g., `https://placement-intelligence-backend.onrender.com`).
8. Copy this backend URL. You will need it for the frontend configuration.

---

## 3. Deploy Frontend App to Vercel

We host the Next.js frontend on Vercel.

### Steps:
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. In the Project Configuration, configure:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend` *(Crucial: set this so Vercel knows where the Next.js project is)*.
5. Expand the **Environment Variables** section and add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://<your-backend-app-name>.onrender.com/api/v1` *(Make sure to replace this with your actual Render URL and append `/api/v1`)*
6. Click **Deploy**.
7. Vercel will build the frontend pages and deploy them. Once complete, it will provide your live website domain (e.g., `https://placement-intelligence-frontend.vercel.app`).

---

## 4. Post-Deployment Verification

1. Access your live Vercel frontend URL in a browser.
2. Navigate to `/register` and create a student user account.
3. Log in with the newly created credentials.
4. Try creating internship applications in the tracker and uploading a PDF resume for analysis to verify integration.
