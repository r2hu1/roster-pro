# Roster Pro

A B2B SaaS for restaurants.

## Structure

- `apps/api`: The hono API server
- `apps/web`: The main restaurant dashboard
- `apps/marketing`: The landing page
- `apps/client-web`: The site where restaurant clients can view their menu, and order (renders dynamically based on id/slug)

### Folder & Structure To Follow

Make sure every page is server rendered (no "use client" in pages) use client components sparingly.

e.g:
To make a client page, don't directly convert a page to a client page. Instead, use a client component within the page.

```tsx
// modules/views/ui/interactive-page.tsx
"use client";
import { Button } from "@workspace/ui/components/button";

export default function SomePage() {}
```

- in some/page.tsx

```tsx
import InteractivePage from "@workspace/views/ui/interactive-page";

export default function SomePage() {
  return (
    <div>
      <InteractivePage />
    </div>
  );
}
```

### Folder Structure

Use modules to organize code by feature.

- modules/
  - views/
    - ui/
      - interactive-page.tsx
  - server/
    - functions.ts

## Packages

- `@workspace/ui`: Shared UI components (import using `@workspace/ui/[component_name]`)
  e.g. `import { Button } from "@workspace/ui/components/button"`
- `@workspace/shared`: Shared utility functions and types
