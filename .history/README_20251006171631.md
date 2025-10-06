# EventHub Mini Project

**EventHub** is a modern event management platform built with **Next.js**, **TypeScript**, and **TailwindCSS**. This platform## Technolog## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Muhammad Ghally**
- GitHub: [@ghallymuhammad](https://github.com/ghallymuhammad)
- Project Link: [https://github.com/ghallymuhammad/eventhub-miniproject](https://github.com/ghallymuhammad/eventhub-miniproject)

## Acknowledgments

- Original template inspiration from EventHub's custom design system
- Design patterns and UI components adapted for event management use caseend**: Next.js 15, TypeScript, Tailwind CSS 4, React 19
- **Backend**: Express.js, JWT Authentication, Prisma ORM
- **Database**: PostgreSQL
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel (Frontend), Railway/Heroku (Backend)ws users to discover events, purchase tickets with bank transfer payment, and provides organizers with tools to create and manage events.

## Features

### Core Features
- 🎫 **Event Discovery**: Browse events with countdown timers and advanced filtering
- 💳 **Ticket Selection**: Interactive ticket selection with multiple types (Regular, VIP, Premium)
- 🏦 **Bank Transfer Payment**: Secure payment system with proof upload and verification
- 👥 **Role-based Access**: Guest, User, and Organizer roles with protected routes
- ⭐ **Reviews & Ratings**: Event rating system with detailed feedback
- 🎯 **Points & Coupons**: Reward system for user engagement
- � **Organizer Dashboard**: Comprehensive event management and analytics
- 🔍 **Advanced Search**: Real-time search with debounce and filters
- �📱 **Mobile Responsive**: Beautiful UI that works on all devices
- 🎨 **Modern Design**: Clean, professional interface with smooth animations

### Technical Features
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS 4
- **Backend**: Express.js API with JWT authentication (migrated from Next.js API routes)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication system
- **Testing**: Jest with React Testing Library
- **State Management**: React hooks with context API
- **File Upload**: Secure payment proof upload system

## Architecture

This project features a **hybrid architecture** with:
- **Next.js Frontend**: Server-side rendering and client-side interactions
- **Express.js Backend**: RESTful API with JWT authentication
- **Prisma**: Database ORM with PostgreSQL
- **Modular Design**: Clean separation of concerns

## Repository

🔗 **GitHub Repository**: [https://github.com/ghallymuhammad/eventhub-miniproject](https://github.com/ghallymuhammad/eventhub-miniproject)

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ghallymuhammad/eventhub-miniproject.git
cd eventhub-miniproject
```

2. **Install dependencies:**
```bash
pnpm install
# or
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your database and authentication settings
```

4. **Set up the database:**
```bash
npx prisma migrate dev
npm run db:seed
```

5. **Start the development servers:**

**Frontend (Next.js):**
```bash
pnpm dev
```

**Backend (Express.js):**
```bash
cd backend
pnpm install
pnpm dev
```

6. **Access the application:**
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)

### Available Scripts

- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:reset` - Reset and reseed database

## Project Structure

```
eventhub-miniproject/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (default)/         # Main application pages
│   └── api/               # Next.js API routes (legacy)
├── backend/               # Express.js backend
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── routes/        # API routes
│   │   └── lib/          # Utilities and database
├── components/            # React components
├── lib/                  # Shared utilities
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## User Flows

### For Event Attendees
1. **Browse Events** → Search/Filter → **Event Details** → **Ticket Selection** → **Checkout** → **Payment Proof Upload**
2. **Transaction Management** → View purchase history and payment status
3. **Review System** → Rate and review attended events

### For Event Organizers  
1. **Create Account** → **Create Event** → **Manage Event** → **View Analytics**
2. **Attendee Management** → View registrations and payment confirmations
3. **Transaction Overview** → Monitor event revenue and attendance

## Documentation

For detailed development documentation, see:
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Complete development setup and architecture guide
- [docs/USER_FLOW.md](./docs/USER_FLOW.md) - User journey documentation

## Deployment

### Frontend (Vercel)
The Next.js frontend can be deployed to Vercel:

```bash
vercel --prod
```

### Backend (Railway/Heroku)
The Express.js backend can be deployed to Railway, Heroku, or any Node.js hosting platform.


## Terms and License

- Copyright 2024 ghallymuhammad.com
- Use it for personal and commercial projects, but please don’t republish, redistribute, or resell the template.
- Attribution is not required, although it is really appreciated.
