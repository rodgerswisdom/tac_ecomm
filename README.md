# TAC Accessories - Afrocentric E-Commerce Platform

A modern, full-stack e-commerce platform for Afrocentric jewelry and accessories, built with Next.js, TypeScript, and Prisma.

## 🌟 Features

### Core E-Commerce

- **Product Catalog** - Browse and filter products with advanced search
- **Product Details** - Rich product pages with image galleries and reviews
- **Shopping Cart** - Persistent cart with real-time updates
- **Checkout Flow** - Multi-step checkout with address and payment
- **Order Management** - Track orders and view order history

### Payment Integration

- **PayPal** - Secure PayPal payments
- **Pesapal** - Mobile money payments for African markets
- **Credit/Debit Cards** - Traditional card payments

### Dynamic Pricing

- **Timezone-based Pricing** - Automatic price adjustments based on user location
- **Currency Conversion** - Multi-currency support with real-time rates
- **Regional Adjustments** - Market-specific pricing strategies

### Shipping & Logistics

- **ShipEngine Integration** - Real-time shipping rates and tracking
- **EasyPost Support** - Alternative shipping provider
- **Order Tracking** - Complete shipment tracking with status updates

### Admin Dashboard

- **Analytics** - Sales trends, order volumes, and customer insights
- **Product Management** - CRUD operations for products and categories
- **Order Management** - Process and fulfill orders
- **Customer Management** - View and manage customer accounts

### User Experience

- **Afrocentric Design** - Rich gold, emerald, and ebony color palette
- **Responsive Design** - Mobile-first approach with perfect mobile experience
- **Animations** - Smooth Framer Motion animations throughout
- **Accessibility** - WCAG compliant with keyboard navigation

### Authentication & Security

- **NextAuth.js** - Email and Google OAuth authentication
- **Role-based Access** - Customer and admin role management
- **Secure Payments** - PCI-compliant payment processing
- **Data Protection** - GDPR-compliant data handling

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Radix UI** - Accessible component primitives

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication framework

### Integrations

- **PayPal SDK** - Payment processing
- **Pesapal API** - Mobile money payments
- **ShipEngine API** - Shipping and logistics
- **Resend** - Transactional emails
- **Cloudinary** - Image optimization and storage

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/tac-ecomm.git
   cd tac-ecomm
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

   Fill in your environment variables in `.env.local`:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/tac_ecomm"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Payment Gateways
   PAYPAL_CLIENT_ID="your-paypal-client-id"
   PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
   PESAPAL_CONSUMER_KEY="your-pesapal-consumer-key"
   PESAPAL_CONSUMER_SECRET="your-pesapal-consumer-secret"
   PESAPAL_ENVIRONMENT="sandbox" # or "production"
   # IPN ID returned after registering https://your-app.com/api/pesapal/notification in the Pesapal portal
   PESAPAL_NOTIFICATION_ID="your-pesapal-ipn-id"
   
   # Shipping APIs
   SHIPENGINE_API_KEY="your-shipengine-api-key"
   EASYPOST_API_KEY="your-easypost-api-key"
   
   # Email Service
   RESEND_API_KEY="your-resend-api-key"
   
   # Image Upload (one URL from Cloudinary dashboard)
   CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="tac_accessories"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # (Optional) Seed the database
   npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```sh
tac_ecomm/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout flow
│   │   ├── products/       # Product pages
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   └── ui/            # Reusable UI components
│   └── lib/               # Utility libraries
│       ├── auth.ts        # Authentication config
│       ├── email.ts       # Email service
│       ├── payments.ts    # Payment integration
│       ├── pricing.ts     # Dynamic pricing
│       ├── prisma.ts      # Database client
│       ├── shipping.ts    # Shipping integration
│       └── utils.ts       # Utility functions
├── prisma/
│   └── schema.prisma      # Database schema
├── .github/
│   └── workflows/         # CI/CD pipelines
└── public/               # Static assets
```

## 🎨 Design System

### Color Palette

- **Gold** (#C89B3C) - Primary brand color
- **Ebony** (#1A1A1A) - Dark text and backgrounds
- **Ivory** (#F4E4BA) - Light backgrounds and accents
- **Emerald** (#50C878) - Success states and highlights
- **Bronze** (#CD7F32) - Secondary accents
- **Copper** (#B87333) - Tertiary accents

### Typography

- **Headings** - Playfair Display (serif)
- **Body Text** - Inter (sans-serif)
- **Luxury Feel** - Elegant, readable, and culturally inspired

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `fc` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database

## 🚀 Deployment

### Environment Setup

1. Set up a PostgreSQL database (e.g., Supabase, Railway, or AWS RDS)
2. Configure environment variables for production
3. Set up payment gateway accounts (PayPal, Pesapal)
   - In Pesapal, register an IPN listener pointing to `https://your-domain.com/api/pesapal/notification` and use the returned IPN ID for `PESAPAL_NOTIFICATION_ID`.
   - Use live consumer key/secret and set `PESAPAL_ENVIRONMENT="production"` for production traffic.
4. Configure shipping APIs (ShipEngine, EasyPost)
5. Set up email service (Resend)
6. Configure image storage (Cloudinary)

### Deployment Options

- **Vercel** (Recommended) - Easy Next.js deployment
- **Netlify** - Alternative hosting platform
- **AWS** - Full cloud infrastructure
- **Railway** - Simple deployment with database

### CI/CD Pipeline

The project includes a GitHub Actions workflow that:

- Runs tests and linting
- Performs security audits
- Builds the application
- Deploys to staging/production environments
- Runs database migrations

## 🔒 Security Features

- **Authentication** - Secure user authentication with NextAuth.js
- **Authorization** - Role-based access control
- **Data Validation** - Zod schema validation
- **CSRF Protection** - Built-in CSRF protection
- **Environment Variables** - Secure configuration management
- **HTTPS** - SSL/TLS encryption
- **Input Sanitization** - XSS protection

## 📱 Mobile Responsiveness

- **Mobile-First Design** - Optimized for mobile devices
- **Touch-Friendly** - Large touch targets and gestures
- **Responsive Images** - Optimized images for all screen sizes
- **Progressive Web App** - PWA capabilities for mobile experience

## 🌍 Internationalization

- **Multi-Currency** - Support for multiple currencies
- **Regional Pricing** - Location-based pricing adjustments
- **Timezone Support** - Automatic timezone detection
- **Localized Content** - Ready for multiple languages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **African Heritage** - Inspired by rich African cultural traditions
- **Modern Web Standards** - Built with latest web technologies
- **Open Source Community** - Thanks to all contributors and maintainers

## 📞 Support

For support, email <support@tacaccessories.com> or join our Discord community.

---

**TAC Accessories** - Celebrating African Heritage Through Jewelry ✨

curl -X POST https://pay.pesapal.com/v3/api/Auth/RequestToken \
  -H "Content-Type: application/json" \
  -d '{"consumer_key":"c86HNbUP8OrvSGRcMpo67VVwNAbw8xVB","consumer_secret":"cxyEwHwbxs1mccN25pzcKB6nxy0="}'

  # Replace with your real sandbox key/secret

$body = '{"consumer_key":"gEgCUuQPJd1HfANCReN6w/dvIjqMV7IZ","consumer_secret":"G9ZFq4eI1n0UneDBq4JKGeCNdfY="}'
$tokenResp = Invoke-RestMethod -Method Post `
  -Uri "https://pay.pesapal.com/v3/api/Auth/RequestToken" `
  -ContentType "application/json" `
  -Body $body
$tokenResp

$body = '{"consumer_key":"gEgCUuQPJd1HfANCReN6w/dvIjqMV7IZ","consumer_secret":"G9ZFq4eI1n0UneDBq4JKGeCNdfY="}'
Invoke-RestMethod -Method Post `
  -Uri "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken" `
  -ContentType "application/json" `
  -Headers @{ Accept = "application/json" } `
  -Body $body

  $token = $tokenResp.token
$ipnBody = '{"url":"http://localhost:3000/api/pesapal/notification","ipn_notification_type":"POST"}'
$ipnResp = Invoke-RestMethod -Method Post `
  -Uri "https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN" `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiO
             TM4MjFjZjgtMDFjMy00Zjc4LTllNmUtZGFiZTZiMWFiN2VmIiwidWlkIjoiZ0VnQ1V1UVBKZDFIZkFOQ1JlTjZ3L2R2SWpxTVY3SVoiLCJuYmYiOjE3NzA5NzA1MzksImV
             4cCI6MTc3MDk3MDgzOSwiaWF0IjoxNzcwOTcwNTM5LCJpc3MiOiJodHRwOi8vcGF5LnBlc2FwYWwuY29tLyIsImF1ZCI6Imh0dHA6Ly9wYXkucGVzYXBhbC5jb20vIn0.4
             mRY6uAp9sJFVhhGhWptoXburHDXzUFXRSpvZpGunMY
expiryDate : 2/13/2026 8:20:39 AM" } `
  -Body $ipnBody
$ipnResp