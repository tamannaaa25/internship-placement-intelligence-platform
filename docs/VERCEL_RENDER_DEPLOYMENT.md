# Vercel and Render Deployment Guide

This document details the configuration and step-by-step process to deploy the **Internship & Placement Intelligence Platform** to managed cloud services: **Vercel** for the frontend, **Render** for the backend, **MongoDB Atlas** for operational data, and **Managed MySQL** for analytics.

---

## Prerequisites
1. A GitHub repository containing the latest codebase.
2. A free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for the application database.
3. A managed MySQL database (e.g., [Aiven](https://aiven.io/), AWS RDS, or PlanetScale) for the analytics database.
4. A free account on [Render](https://render.com/) for backend hosting.
5. A free account on [Vercel](https://vercel.com/) for frontend hosting.

---

## 1. Managed Databases Setup (MongoDB Atlas & MySQL)

### 1.1 MongoDB Atlas Setup
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Free M0 cluster named `placement-intelligence-cluster`.
3. Create a database user and allow access from all IPs (`0.0.0.0/0`).
4. Copy the URI (`MONGODB_URI`).

### 1.2 Managed MySQL Setup
1. Provision a free/developer MySQL 8.0 instance.
2. Run `Placement & Internship Intelligence/SQL/data_cleaning.sql` to populate `placement_records`.
3. Save the host, port, user, password, and database (`placement_analytics`).

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
   - **Branch**: `main` (or active branch).
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Scroll down to **Environment Variables** and add:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *(Your MongoDB Atlas Connection String)*
   - `MYSQL_HOST`: *(Your MySQL Host)*
   - `MYSQL_USER`: *(Your MySQL User)*
   - `MYSQL_PASSWORD`: *(Your MySQL Password)*
   - `MYSQL_DATABASE`: `placement_analytics`
   - `MYSQL_PORT`: `3306`
   - `JWT_SECRET`: *(A random, secure cryptographic string)*
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
