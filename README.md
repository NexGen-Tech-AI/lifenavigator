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

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/lifenavigator.git
cd lifenavigator
```

### 2. Install dependencies

```bash
npm install
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
docker-compose up -d
```

This will start a PostgreSQL instance accessible at `localhost:5432`.

### 5. Initialize the database

Generate the Prisma client, run migrations, and seed the database:

```bash
npm run prisma:generate
npm run prisma:migrate-dev
npm run db:seed
```

### 6. Start the development server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

### Login Details

For the demo account:
- **Email**: demo@lifenavigator.com
- **Password**: password123

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Lint the codebase
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate-dev` - Create and apply migrations
- `npm run prisma:deploy` - Apply migrations in production
- `npm run prisma:studio` - Open Prisma Studio for database management
- `npm run db:push` - Push schema changes to the database
- `npm run db:seed` - Seed the database with initial data

## Database Schema

The database schema includes models for users, financial records, career tracking, education progress, health data, and roadmap planning. See the [Prisma schema](./prisma/schema.prisma) for details.

## Infrastructure Setup

This project uses Terraform to provision AWS infrastructure. The configuration files are located in the `terraform` directory.

### Deploying Infrastructure

1. Install Terraform
2. Configure AWS credentials
3. Initialize Terraform:

```bash
cd terraform
terraform init
```

4. Deploy infrastructure:

```bash
terraform apply -var="environment=dev"
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment. The workflow files are located in the `.github/workflows` directory.

- `ci.yml` - Runs linting, type checking, tests, and builds the application
- `deploy.yml` - Deploys the application to AWS using Terraform

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - React components
- `/src/lib` - Utility functions and API clients
- `/src/hooks` - Custom React hooks
- `/src/types` - TypeScript type definitions
- `/prisma` - Database schema and migrations
- `/terraform` - Infrastructure as code
- `/public` - Static assets

## License

This project is licensed under the MIT License.