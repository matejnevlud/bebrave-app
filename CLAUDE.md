# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BeBrave Studio is a Next.js 15 fitness studio application for managing group fitness classes, reservations, and trainer schedules. It serves as both a customer-facing website and an administration platform.

## Development Commands

### Essential Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run lint` - Run ESLint with auto-fix
- `npm run start` - Start production server

### Database Commands

- `npx drizzle-kit generate` - Generate database migrations
- `npx drizzle-kit migrate` - Run database migrations
- `npx drizzle-kit studio` - Open Drizzle Studio for database management

## Architecture Overview

### Tech Stack

- **Next.js 15** with App Router and TypeScript
- **HeroUI v2** for components, **Tailwind CSS** for styling
- **Drizzle ORM** with **PostgreSQL** database
- **Nexi** for payment processing with hosted payment pages
- **Puppeteer** for PDF invoice generation
- **Resend** for email notifications
- **HLS.js** with Cloudflare Stream for video playback
- **Framer Motion** for animations

### Route Structure

The app uses route groups:

- `(web)/` - Public website with navbar layout
- `(administration)/` - Admin dashboard with sidebar layout

### Key Directories

- `app/` - Next.js App Router pages and layouts
- `db/` - Database schema, server actions, and email templates
- `lib/` - Services (payment, email, PDF) and utilities
- `components/` - Reusable UI components
- `public/` - Static assets and images
- `drizzle/` - Database migrations

### Database Schema

Core entities managed through Drizzle ORM:

- **Trainers** - Profiles with specializations and bio
- **ClassTypes** - Class definitions with pricing/capacity
- **Classes** - Scheduled instances with trainer assignments (supports dual trainers)
- **Reservations** - Bookings with comprehensive payment tracking
- **Users** - Customer profiles
- **Invoices** - Invoice generation with VAT support
- **TrainerClassTypes** - Many-to-many relationship

### Component Architecture

- HeroUI components for consistent design system
- Custom components in `components/` directory
- Server actions in `lib/actions/` for database operations
- Type definitions alongside implementation files

## Development Patterns

### Database Operations

- Use server actions for all database interactions
- Import schema from `db/schema`
- Use Drizzle ORM for type-safe queries
- Handle errors with appropriate user feedback

### UI Components

- Import from HeroUI (`@heroui/react`) for standard components
- Use Tailwind classes for styling
- Implement responsive design with mobile-first approach
- Use Framer Motion for animations

### Email System

- Email templates in `db/` directory
- Use Resend service for delivery
- Include reservation confirmations and updates

## Important Notes

### Configuration

- React strict mode is disabled in next.config.js
- Custom fonts (Filson Pro, Runalto) configured in Tailwind
- Theme provider setup in app/providers.tsx
- Database connection configured via environment variables

### No Testing Framework

The project currently has no testing setup. When adding tests, consider Jest + React Testing Library.

### Video Streaming

Uses HLS.js for video playback on homepage with Cloudflare Stream integration.

## Payment and Invoice System

### Payment Integration

- **Nexi payment gateway** for credit card processing
- Multiple payment methods: on-site, QR, credit card, customer credit
- Payment webhook handling at `/api/payment/webhook`
- Security tokens and hosted payment pages
- Transaction status tracking and validation

### Invoice Management

- Automated invoice generation with sequential numbering
- PDF generation using Puppeteer at `/api/invoices/[id]/pdf`
- Email delivery via Resend at `/api/invoices/[id]/email`
- VAT calculation support
- Admin PDF viewer component for invoice preview

## API Routes

- `/api/invoices/[id]/pdf` - Generate and download invoice PDFs
- `/api/invoices/[id]/email` - Send invoices via email
- `/api/payment/webhook` - Handle Nexi payment notifications
- `/api/uploads/[query]` - File upload handling

### Admin Features

Administrative functions are in `(administration)/admin/` with sidebar navigation for class and reservation management, invoice generation, and trainer management.