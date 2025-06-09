# Subdomain Deployment Setup

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# Main domain for your service
APP_DOMAIN=yourdomain.com

# Vercel API Configuration
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_API_TOKEN=your_vercel_api_token
```

## Getting Your Vercel Configuration

### 1. Vercel Project ID
1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to Settings → General
4. Copy the "Project ID"

### 2. Vercel API Token
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a name like "Wedding App Subdomain Manager"
4. Copy the token

## DNS Configuration

To enable wildcard subdomains, configure your DNS:

### For domains managed by Vercel
1. In your Vercel project, go to Settings → Domains
2. Add your root domain (`yourdomain.com`)
3. Add a wildcard domain (`*.yourdomain.com`)

### For external DNS providers
Add these DNS records:
- **A Record**: `@` → `76.76.21.21` (Vercel's IP)
- **A Record**: `*` → `76.76.21.21` (for subdomains)

## How It Works

1. **User creates website** in the main app
2. **User clicks "Publish"** and enters a subdomain (e.g., `john-sarah`)
3. **API adds domain** to Vercel project (`john-sarah.yourdomain.com`)
4. **Middleware routes** subdomain requests to `/site/[subdomain]` page
5. **Page renders** the user's wedding website

## Testing

1. Create a wedding website in your app
2. Use the publish feature to set a subdomain
3. Visit `yoursubdomain.yourdomain.com` to see the live site

## Database Migration

Don't forget to run the database migration to add the subdomain column:

```sql
-- Add subdomain column to weddings table
ALTER TABLE public.weddings
ADD COLUMN subdomain TEXT;

-- Add unique constraint to prevent duplicate subdomains
ALTER TABLE public.weddings
ADD CONSTRAINT unique_subdomain UNIQUE (subdomain);

-- Add index for faster subdomain lookups
CREATE INDEX idx_weddings_subdomain ON public.weddings(subdomain);
``` 