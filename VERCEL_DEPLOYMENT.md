# Vercel Deployment Guide

This guide outlines the steps to deploy your Church Management System to Vercel.

## 1. Prerequisites

### Hosted MySQL Database

Since Vercel is a serverless platform, you cannot use a local database (like the one running on your computer). You need a hosted MySQL database that is accessible over the internet.
**Recommended Providers:**

- **PlanetScale** (Excellent for serverless MySQL)
- **Aiven**
- **Railway**
- **DigitalOcean** (Managed Databases)
- **AWS RDS**

**Required Information:**

- **Connection String (URI)**: Usually in the format `mysql://user:password@host:port/database_name`

### Vercel Account

- Sign up at [vercel.com](https://vercel.com).
- Install Vercel CLI (optional but recommended) or connect your GitHub/GitLab/Bitbucket repository.

## 2. Configuration

### Environment Variables

You must configure the following environment variables in your Vercel Project Settings:

| Variable Name  | Description                                    | Example Value                                     |
| :------------- | :--------------------------------------------- | :------------------------------------------------ |
| `DATABASE_URL` | Your hosted database connection string.        | `mysql://admin:pass@db-host.com:3306/clc_finance` |
| `FORCE_MYSQL`  | Forces the app to use MySQL instead of SQLite. | `true`                                            |

_(Note: `ELECTRON` variable should NOT be set, or set to `false`)_

## 3. Deployment Steps

### Option A: Deploy via Git (Recommended)

1.  Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2.  Log in to Vercel and click **"Add New..."** -> **"Project"**.
3.  Import your repository.
4.  In the **"Configure Project"** screen:
    - Expand **"Environment Variables"**.
    - Add `DATABASE_URL` and `FORCE_MYSQL` as defined above.
5.  Click **"Deploy"**.

### Option B: Deploy via CLI

1.  Run `npm i -g vercel` to install the CLI.
2.  Run `vercel login`.
3.  Run `vercel` in the project root.
4.  Follow the prompts.
5.  When asked about environment variables, choose to add them or set them up in the dashboard later (the deployment might fail first if DB is unreachable).

## 4. Post-Deployment

- **Database Initialization**: The application is configured to automatically create necessary tables and seed initial data upon the first successful connection (`src/lib/database.ts`).
- **Verification**: Open the deployed URL. Try logging in with the default admin credentials (if seeded) or the ones you manually set up in your database.

## Troubleshooting

- **Build Failed**: Check the build logs. If it mentions database connection errors, ensure your hosted database is running and the `DATABASE_URL` is correct.
- **Login Fails**: Check database connectivity. Ensure your IP address (or Vercel's IP range) is allowed to connect to your database.
