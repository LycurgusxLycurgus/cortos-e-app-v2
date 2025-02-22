# How to Use Auth‑Lib (Non‑Technical Guide)

Auth‑Lib is a simple tool that helps you add user login and session management to your website. It uses Supabase to handle all the details, so you don’t have to worry about complicated code. Follow these simple steps to set it up in your project.

## What Auth‑Lib Does

- **Manages User Sessions**: It keeps track of who is logged in by storing their session in cookies.
- **Protects Pages**: It makes sure only logged-in users can view certain pages.
- **Provides a Simple Setup**: It comes with a helper component (AuthGuard) that automatically redirects users to the login page if they are not signed in.
- **Works on Both Browser and Server**: It gives you tools to work on the client side (in the browser) and server side (for server‑rendered pages).

## Step-by-Step Setup

### Step 1: Add the Library to Your Project

1. Download or copy the folder named **auth‑lib** into your project.
2. The folder contains three main files:
   - `index.js` (handles creating the client and session checking)
   - `guard.js` (the AuthGuard component that protects pages)
   - `server.js` (for server‑side client setup)

### Step 2: Install Required Tools

1. Open your project’s command line (Terminal).
2. Run the following command to install the necessary tools:
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   ```
3. Make sure your project has a file called **.env.local** with these lines (replace with your actual details):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Step 3: Set Up Your Supabase Client

1. In your code, import the library’s client function:
   ```js
   import { createClient } from 'auth-lib';
   ```
2. Create your Supabase client:
   ```js
   const supabase = createClient();
   ```
   This client will take care of logging users in and out and keeping their session.

### Step 4: Protect Your Pages

1. To ensure that only logged-in users can see certain pages, wrap those pages with the AuthGuard.
2. In your main app file (usually called `_app.js`), do the following:
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
3. Now, if a user is not logged in and they try to access a protected page, they will be automatically sent to the login page.

### Step 5: (Optional) Use Server-Side Tools

If your website uses server-rendered pages (pages built on the server), you can create a server‑side Supabase client:
```js
import { createServerSupabaseClient } from 'auth-lib/server';
const supabase = createServerSupabaseClient();
```
Use this version in pages or API routes that run on your server.

### Step 6: Enjoy a Seamless Login Experience

With these steps, Auth‑Lib takes care of:
- Checking if a user is logged in.
- Redirecting users to the login page if they are not.
- Allowing your site to securely fetch user data both on the client and server sides.

## Summary

1. **Copy the auth‑lib folder** into your project.
2. **Install the required tools** with npm.
3. **Set up your environment variables** with your Supabase details.
4. **Create a Supabase client** using the provided function.
5. **Wrap your app** with AuthGuard to protect pages.
6. (Optional) **Use the server‑side client** for server‑rendered pages.

Following these steps will give you a robust and easy‑to‑use authentication system without the headache of managing sessions manually.