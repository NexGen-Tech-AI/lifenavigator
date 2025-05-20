# Life Navigator

Life Navigator is a comprehensive life management platform designed to help users manage multiple aspects of their lives including Finance, Career, Education, and Healthcare.

## Project Overview

The platform offers tools for tracking financial health, career progression, educational achievements, and health metrics, all in one integrated dashboard.

## Technology Stack

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Infrastructure**: AWS via Terraform (ECS, RDS, S3, CloudFront)
- **CI/CD**: GitHub Actions
- **Local Development**: Docker Compose

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Git
- pnpm (recommended package manager)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/lifenavigator.git
cd lifenavigator
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration values if needed.

### 4. Start the database

Start the PostgreSQL database using Docker Compose:

```bash
pnpm docker:pg:up
```

This will start a PostgreSQL instance accessible at `localhost:5432`.

### 5. Initialize the database

Generate the Prisma client, run migrations, and seed the database:

```bash
pnpm prisma:generate
pnpm prisma:migrate-dev
pnpm db:seed
```

### 6. Start the development server

```bash
pnpm dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

### Login Details

For the demo account:
- **Email**: demo@example.com
- **Password**: password

This demo account is automatically created during database seeding.

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Lint the codebase
- `pnpm typecheck` - Run type checking
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate-dev` - Create and apply migrations
- `pnpm prisma:deploy` - Apply migrations in production
- `pnpm prisma:studio` - Open Prisma Studio for database management
- `pnpm db:push` - Push schema changes to the database
- `pnpm db:seed` - Seed the database with demo data
- `pnpm vercel:postgres:setup` - Configure for Vercel PostgreSQL
- `pnpm create:demo-account` - Ensure demo account exists

## Database Setup

### Local Development with PostgreSQL

1. Start PostgreSQL using Docker
   ```bash
   pnpm docker:pg:up
   ```

2. Push the schema to the database
   ```bash
   pnpm db:push
   ```

3. Seed the database (this will create the demo account and sample data)
   ```bash
   pnpm db:seed
   ```

### Vercel Deployment with PostgreSQL

1. Run the Vercel PostgreSQL setup script
   ```bash
   pnpm vercel:postgres:setup
   ```

2. Add a PostgreSQL database in Vercel
   - Go to your Vercel project dashboard > Storage tab
   - Create a new PostgreSQL database

3. Deploy to Vercel
   ```bash
   git push
   ```

4. After deployment, run migrations and seed the database
   ```bash
   vercel --prod run pnpm prisma migrate deploy
   vercel --prod run pnpm db:seed
   ```

This will set up your database schema and create the demo account automatically.

## Database Schema

The database schema includes models for users, financial records, career tracking, education progress, health data, and roadmap planning. See the [Prisma schema](./prisma/schema.prisma) for details.

## Authentication System

The application uses NextAuth.js for authentication with:

- Email/password authentication
- JWT token-based sessions
- Demo account integration
- Secure password hashing with bcrypt
- Account lockout after failed attempts
- Login/logout monitoring with security audit logs

The demo account is created during database seeding and is always available with the credentials:
- Email: demo@example.com
- Password: password

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - React components
- `/src/lib` - Utility functions and API clients
- `/src/hooks` - Custom React hooks
- `/src/types` - TypeScript type definitions
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/scripts` - Utility scripts for development and maintenance

## Troubleshooting

### Authentication Issues

If you're experiencing issues with login or registration:

1. **Check Database Connection**: Ensure your PostgreSQL database is running and accessible:
   ```bash
   curl http://localhost:3000/api/db-test
   ```

2. **Ensure Demo Account**: Visit the demo account endpoint to ensure it exists:
   ```
   http://localhost:3000/api/auth/ensure-demo
   ```

3. **Database Diagnostic**: Run the diagnostic tool:
   ```bash
   pnpm db:diagnose
   ```

### Database Connection Issues

For PostgreSQL connection issues on Vercel:

1. Verify your Vercel environment variables:
   - `POSTGRES_PRISMA_URL` should start with `postgresql://`
   - `POSTGRES_URL_NON_POOLING` should also start with `postgresql://`

2. Check that you've created a PostgreSQL database in the Vercel dashboard:
   - Go to the Storage tab and verify the PostgreSQL instance is running

3. Run migrations and seed the database:
   ```bash
   vercel --prod run pnpm prisma migrate deploy
   vercel --prod run pnpm db:seed
   ```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens include rotation and revocation
- API routes are protected with CSRF tokens
- Security audit logging for authentication events
- Strict Content-Security-Policy headers
- Automatically handles account lockout after failed login attempts

## License

This project is licensed under the MIT License.