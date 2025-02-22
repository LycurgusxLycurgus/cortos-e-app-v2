# Auth‑Lib

Auth‑Lib is a small, abstracted authentication library built on top of Supabase Auth Helpers for Next.js. It provides a simple interface for managing user sessions via cookies (using the PKCE flow) and protects routes with an AuthGuard component. This library is intended to be reused across multiple projects to streamline authentication implementation.

## Features

- **Client‑Side Supabase Client**: Create a Supabase client with cookie‑based storage.
- **Session Retrieval**: Easily fetch the current session.
- **Route Protection**: Use the `AuthGuard` component to protect pages.
- **Server‑Side Client**: Create a server‑side Supabase client for SSR and API routes.
- **Public Route Detection**: Determine if a given route should bypass authentication.

## File Overview

- **index.js**  
  Exports:
  - `createClient(options)`: Returns a client-side Supabase client.
  - `getValidSession(supabaseClient)`: Retrieves the current session.
  - `isPublicRoute(pathname)`: Checks if a route is public.
  - Re-exports from `guard.js` and `server.js`.

- **guard.js**  
  Exports the `AuthGuard` component. Wrap your pages/components with `AuthGuard` and pass your Supabase client as a prop. If no valid session is found, users are redirected to `/login`.

- **server.js**  
  Exports `createServerSupabaseClient(options)`, which creates a Supabase client for server-side use. Use this in Next.js Server Components, API routes, or middleware.

## Installation

1. Copy the `auth-lib` folder into your project.
2. Install the dependencies:
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   ```
3. Ensure your `.env.local` includes:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Usage Examples

### Client-Side

**Creating a client:**
```js
import { createClient } from 'auth-lib';

const supabase = createClient();
```

**Getting the current session:**
```js
import { getValidSession } from 'auth-lib';

const session = await getValidSession(supabase);
```

### Protecting Routes with AuthGuard

In your Next.js `_app.js`:
```jsx
import { AuthGuard, createClient } from 'auth-lib';

const supabase = createClient();

function MyApp({ Component, pageProps }) {
  return (
    <AuthGuard supabaseClient={supabase}>
      <Component {...pageProps} />
    </AuthGuard>
  );
}

export default MyApp;
```

### Server-Side Usage

In server components or API routes:
```js
import { createServerSupabaseClient } from 'auth-lib/server';

const supabase = createServerSupabaseClient();
// Use supabase to fetch user data or perform authenticated actions on the server.
```

## Contributing

Contributions, suggestions, and improvements are welcome. Open an issue or submit a pull request to help make Auth‑Lib even better!