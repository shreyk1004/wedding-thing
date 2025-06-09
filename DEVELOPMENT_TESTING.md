# Testing Subdomain Functionality Locally

## Option 1: Using /etc/hosts (Recommended)

1. **Edit your hosts file:**
   ```bash
   sudo nano /etc/hosts
   ```

2. **Add test domains:**
   ```
   127.0.0.1    myapp.local
   127.0.0.1    test-wedding.myapp.local
   127.0.0.1    john-sarah.myapp.local
   ```

3. **Update your .env.local:**
   ```bash
   APP_DOMAIN=myapp.local
   ```

4. **Start your dev server:**
   ```bash
   npm run dev
   ```

5. **Test the subdomains:**
   - Main app: `http://myapp.local:3000`
   - Test wedding: `http://test-wedding.myapp.local:3000`

## Option 2: Dev-Only Route (Quick Testing)

Add a development route to test without DNS setup:

**Create `/src/app/dev-site/[subdomain]/page.tsx`:**
```tsx
import { SitePage } from '../../site/[subdomain]/page';

// This is just for development testing
export default SitePage;
```

Then test with: `http://localhost:3000/dev-site/your-test-subdomain`

## Option 3: Using ngrok (Real Domains)

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your dev server:**
   ```bash
   npm run dev
   ```

3. **In another terminal, expose with custom subdomain:**
   ```bash
   ngrok http 3000 --subdomain=your-app-name
   ```

4. **Update APP_DOMAIN in .env.local:**
   ```bash
   APP_DOMAIN=your-app-name.ngrok.io
   ```

5. **Test with real subdomains:**
   - Main: `https://your-app-name.ngrok.io`
   - Subdomain: `https://test.your-app-name.ngrok.io`

## Option 4: Add Development Middleware Logic

We can modify the middleware to handle dev testing: 