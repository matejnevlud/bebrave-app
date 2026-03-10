# AGENTS.md

This file provides instructions for AI coding agents working on the BeBrave Studio codebase.

## Build/Lint/Test Commands

### Essential Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (run this before committing significant changes)
- `npm run lint` - Run ESLint with auto-fix (MUST run before committing)
- `npm run start` - Start production server locally

### Database Commands

- `npx drizzle-kit generate` - Generate database migrations after schema changes
- `npx drizzle-kit migrate` - Run database migrations
- `npx drizzle-kit studio` - Open Drizzle Studio for database management

### Testing

**There is no test framework configured.** The project currently has no automated tests. When running lint/typecheck, only use `npm run lint` and `npm run build`.

## Code Style Guidelines

### File Organization

1. **Directives first**: `"use client"` or `"use server"` must be the first line when applicable
2. **Import order** (enforced by ESLint):
   - Type imports (`import type {...}`)
   - Built-in Node modules
   - External packages (React, Next.js, HeroUI, etc.)
   - Internal imports using `@/` alias
   - Parent/sibling/index imports
   - **Blank line required between each import group**

### Import Style

```typescript
// Example import structure
"use client";

import type { RadioGroupProps } from "@heroui/react";
import type { SVGProps } from "react";

import React from "react";
import { RadioGroup } from "@heroui/react";
import { cn } from "@heroui/react";

import PaymentMethodItem from "./PaymentMethodItem";
```

### TypeScript

- **Strict mode is enabled** - all code must pass strict type checking
- Use `@/*` path alias for imports from project root
- Export types alongside implementations:
  ```typescript
  export type Trainer = typeof trainersTable.$inferSelect;
  export type TrainerWithRelations = Trainer & { trainerClassTypes: any[] };
  ```
- Prefer explicit return types for functions and components

### Component Style

```typescript
// Use arrow functions for components
export const Navbar = () => {
  // Implementation
};

// forwardRef pattern
const PaymentMethodRadioGroup = React.forwardRef<
  HTMLDivElement,
  PaymentMethodGroupProps
>(({ className, ...props }, ref) => {
  return <RadioGroup {...props} ref={ref} />;
});

PaymentMethodRadioGroup.displayName = "PaymentMethodRadioGroup";
```

### Props Sorting

ESLint enforces sorted props (shorthand first, callbacks last, reserved first):

```typescript
// Correct order
<Button
  isDisabled
  className="custom-class"
  variant="solid"
  onPress={handlePress}
>
  Click
</Button>
```

### Component Structure

- Self-closing tags for elements without children
- Blank line before `return` statements
- Use HeroUI components (`@heroui/react`) for UI elements
- Style with Tailwind CSS classes; use `cn()` for conditional class merging

### Error Handling

```typescript
// Server actions and API routes
try {
  // operation
} catch (error) {
  console.error("Error description:", error);
  throw new Error("User-friendly error message");
}

// API route responses
return NextResponse.json({ error: "Error message" }, { status: 400 });
```

### Database Operations

- **Always use server actions** (files with `"use server"`) for database interactions
- Import schema from `@/db/schema`
- Use Drizzle ORM for type-safe queries
- Server actions belong in `db/actions.ts`

```typescript
"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { trainersTable } from "@/db/schema";

export async function getTrainers() {
  return db.query.trainersTable.findMany();
}
```

### Naming Conventions

| Element            | Convention                   | Example                            |
| ------------------ | ---------------------------- | ---------------------------------- |
| Components         | PascalCase                   | `Navbar`, `PaymentMethodRadio`     |
| Functions          | camelCase                    | `getTrainers`, `createReservation` |
| Variables          | camelCase                    | `selectedClass`, `trainers`        |
| Database tables    | camelCase + Table suffix     | `trainersTable`, `classesTable`    |
| Types              | PascalCase (matching entity) | `Trainer`, `ClassWithRelations`    |
| Files (components) | PascalCase                   | `Navbar.tsx`                       |
| Files (utilities)  | kebab-case                   | `form-storage.ts`                  |
| Constants          | SCREAMING_SNAKE_CASE         | `FORM_STORAGE_KEY`                 |

### CSS and Styling

- Use Tailwind CSS utility classes
- Responsive design: mobile-first (`sm:`, `md:`, `lg:`)
- Dark mode support with `dark:` prefix
- Use `cn()` from `@heroui/react` for conditional class merging

```typescript
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>
```

### API Routes

Located in `app/api/`:

- Return `NextResponse.json()` for responses
- Handle errors with appropriate HTTP status codes
- Log errors with `console.error()`

### Comments

- **Do not add comments** unless explicitly requested by the user
- Code should be self-documenting through clear naming

## Project Structure

```
app/
├── (web)/           # Public website with navbar
├── (administration)/ # Admin dashboard with sidebar
└── api/             # API routes

db/
├── schema.ts        # Drizzle schema definitions
├── actions.ts       # Server actions for database
└── *_email.ts       # Email templates

lib/
├── services/        # External services (Nexi, PDF, email)
└── utils/           # Utility functions

components/
├── blocks/          # Composite components
└── *.tsx            # Reusable UI components
```

## Important Notes

- React strict mode is disabled
- Use HeroUI v2 components for consistency
- No test framework - do not reference Jest, Vitest, or similar
- Run `npm run lint` before every commit
