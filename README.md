# Roster Pro

A B2B SaaS for restaurants.

## Structure

- `apps/api`: The hono API server
- `apps/web`: The main restaurant dashboard
- `apps/marketing`: The landing page
- `apps/client-web`: The site where restaurant clients can view their menu, and order (renders dynamically based on id/slug)

## Packages

- `@workspace/ui`: Shared UI components (import using `@workspace/ui/[component_name]`)
  e.g. `import { Button } from "@workspace/ui/components/button"`
- `@workspace/shared`: Shared utility functions and types
