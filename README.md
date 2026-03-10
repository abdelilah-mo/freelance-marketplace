# Freelance Marketplace

Full-stack freelance marketplace similar to Fiverr.

## Stack

- Backend: Laravel 12 REST API
- Frontend: React 19 + Vite
- Database: MySQL
- Payments: Stripe Checkout with a mock fallback when Stripe keys are not configured

## Project Structure

```text
.
|-- backend
|   |-- app
|   |   |-- Http
|   |   |   |-- Controllers
|   |   |   |   `-- Api
|   |   |   |       |-- Admin
|   |   |   |       |-- AuthController.php
|   |   |   |       |-- CategoryController.php
|   |   |   |       |-- DashboardController.php
|   |   |   |       |-- OrderController.php
|   |   |   |       |-- PaymentController.php
|   |   |   |       `-- ServiceController.php
|   |   |   `-- Middleware
|   |   |-- Models
|   |   `-- Services
|   |-- config
|   |-- database
|   |   |-- migrations
|   |   |-- seeders
|   |   `-- schema-example.sql
|   `-- routes
|       `-- api.php
`-- frontend
    `-- src
        |-- components
        |-- context
        |-- lib
        `-- pages
```

## Backend Features

- Token-based authentication for `client`, `freelancer`, and `admin`
- Service CRUD for freelancers
- Marketplace browse/search endpoints
- Order management with `pending`, `in_progress`, and `completed`
- Payment records with Stripe or mock checkout
- Admin management endpoints for users, services, and orders

## Frontend Pages

- Home page with service list and filters
- Service details page
- Login and registration
- User dashboard
- Create/edit service page
- Order checkout page
- Payment result page
- Admin dashboard

## Local Run

### Backend

```bash
cd backend
composer dump-autoload
php artisan storage:link
php artisan migrate --seed
php artisan serve
```

Update `backend/.env` with your MySQL credentials before running migrations.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Seeded Accounts

- Admin: `admin@marketplace.test` / `password`
- Freelancer: `freelancer@marketplace.test` / `password`
- Client: `client@marketplace.test` / `password`

## Stripe

- Configure `STRIPE_SECRET_KEY` in `backend/.env`
- Configure `VITE_STRIPE_PUBLISHABLE_KEY` in `frontend/.env` if you want to extend the client checkout experience
- If Stripe is not configured, the app uses the built-in mock checkout flow and still records payment status
