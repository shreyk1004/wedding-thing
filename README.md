# Wedding Planning App

A comprehensive wedding planning application built with Next.js and Supabase.

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

## Supabase RLS Setup

Since this app uses Row Level Security (RLS), you need to set up the following policies in your Supabase dashboard:

### 1. Enable RLS on the `weddings` table:
```sql
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
```

### 2. Create RLS policies:

**Allow anonymous users to read wedding data:**
```sql
CREATE POLICY "Allow anonymous read access" ON weddings
FOR SELECT USING (true);
```

**Allow anonymous users to insert wedding data:**
```sql
CREATE POLICY "Allow anonymous insert access" ON weddings
FOR INSERT WITH CHECK (true);
```

**Allow authenticated users to update their own data:**
```sql
CREATE POLICY "Allow authenticated update access" ON weddings
FOR UPDATE USING (auth.uid() IS NOT NULL);
```

### 3. Enable anonymous authentication in Supabase:
1. Go to Authentication → Settings in your Supabase dashboard
2. Enable "Anonymous sign-ins"
3. Set the anonymous session duration as needed

## Features

- 🏛️ **Venue Management**: Book and manage wedding venues
- 📸 **Vendor Coordination**: Find photographers, DJs, florists
- 🍽️ **Catering Planning**: Plan menus and food options  
- 💌 **Invitation Design**: Create and send invitations
- 🏨 **Guest Accommodation**: Manage hotel bookings
- 🤖 **AI Assistant**: Get personalized wedding planning help
- 📱 **Responsive Design**: Works on all devices

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables
4. Configure Supabase RLS policies (see above)
5. Run the development server: `npm run dev`

## Authentication

The app uses Supabase authentication with anonymous sign-in to work with RLS. Users are automatically signed in anonymously when they visit the app, ensuring seamless access to wedding data while maintaining security through RLS policies.

## AI Features

The AI wedding assistant provides:
- Visual venue recommendations with images
- Vendor suggestions with pricing
- Menu planning assistance
- Budget breakdowns
- Timeline planning
- Actionable next steps

All AI features are context-aware, using your wedding details (location, theme, guest count, budget) to provide personalized recommendations.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
