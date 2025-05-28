# Venue Booking Platform

A web app for booking venues, built with Next.js, Supabase, Tailwind CSS, and Stripe. Includes an admin panel, user authentication, booking system, and simulated email notifications. Uses Feature-Sliced Design (FSD) and is deployable on Vercel for free.

## Features

- User authentication via Supabase
- Admin panel to create/edit/delete venues (`/admin`, admin-only)
- Venue booking with Stripe payments
- Image uploads to Supabase Storage
- Simulated email notifications for admins (console logs)
- Responsive UI with Tailwind CSS and animations
- FSD architecture (`features`, `entities`, `shared`)
- Stripe webhooks for payment processing

## Tech Stack

- Frontend: Next.js (App Router), React, TypeScript
- Backend: Supabase (Auth, Database, Storage), Next.js API Routes
- Payments: Stripe
- Styling: Tailwind CSS
- Tools: uuid, ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js (v18.20.4+)
- npm
- Supabase account: [supabase.com](https://supabase.com)
- Stripe account (test mode): [stripe.com](https://stripe.com)
- Git & GitHub
- Vercel account (optional, for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
2. Install dependencies:
    ```bash
    npm install
3. Set up environment variables in .env.local
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    STRIPE_SECRET_KEY=sk_test
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test
    STRIPE_WEBHOOK_SECRET=whsec
4. Configure Supabase:
  * Create venues
    ```sql
    create table venues (
      id uuid primary key default uuid_generate_v4(),
      name text not null,
      address text not null,
      capacity integer not null,
      phone text,
      image_url text,
      event_date timestamp,
      owner_user_id uuid references auth.users(id),
      created_at timestamp default now()
    );
  * Create profiles 
    ```sql
    create table profiles (
      id uuid primary key references auth.users(id),
      role text not null default 'user'
    );
  * Create venue-images bucket in Supabase → Storage.



  * Set storage permissions:
    ```sql
    grant all on storage.objects to authenticated;
    grant all on storage.objects to anon;
5. Set up Stripe:
* Get test keys from Stripe Dashboard.
### running
* ```bash
   npm run dev
  
