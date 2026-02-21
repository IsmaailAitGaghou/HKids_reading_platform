# HKids Backend Server

> A secure, role-based REST API for a children's reading platform built with Express, TypeScript, and MongoDB.

## 🎯 Overview

HKids Backend provides a comprehensive API for managing a safe, engaging reading platform for children. It supports three distinct user roles with different capabilities:

-  **ADMIN**: Complete content management system with platform analytics
-  **PARENT**: Family portal for managing children profiles, reading policies, and monitoring progress
-  **CHILD**: Distraction-free reading experience with enforced safety policies

## 🚀 Tech Stack

-  **Runtime**: Node.js with TypeScript
-  **Framework**: Express.js
-  **Database**: MongoDB with Mongoose ODM
-  **Authentication**: JWT-based with bcryptjs for password hashing
-  **Validation**: Zod for request validation
-  **File Upload**: Multer + Cloudinary
-  **API Documentation**: Swagger UI

## 📁 Project Structure

```
src/
├── config/          # Database, Cloudinary, environment configuration
├── middlewares/     # Auth, error handling, validation middlewares
├── modules/         # Feature-based modules
│   ├── auth/        # Authentication & authorization
│   ├── age-groups/  # Age group management
│   ├── categories/  # Book categories
│   ├── books/       # Book content management
│   ├── children/    # Child profiles & policies
│   ├── parent/      # Parent dashboard & controls
│   ├── kids/        # Child reading interface
│   ├── analytics/   # Platform analytics
│   ├── uploads/     # File upload handling
│   └── health/      # Health check endpoint
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
├── scripts/         # Database seeding scripts
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

## 🔧 Installation & Setup

### Prerequisites

-  Node.js (v18 or higher)
-  MongoDB (local or Atlas)
-  Cloudinary account (for image uploads)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hkids

# Authentication
AUTH_SECRET=your-super-secret-jwt-key-here
ADMIN_BOOTSTRAP_KEY=your-admin-bootstrap-key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 3: Seed Database

Populate the database with demo data:

```bash
npm run seed
```

This creates:

-  **3 Users** (1 admin, 2 parents)
-  **6 Age Groups** (Toddlers to Young Adults)
-  **10 Categories** (Animals, Space, Fairy Tales, etc.)
-  **10 Books** (with complete pages and content)
-  **4 Children** (with different age groups)
-  **4 Policies** (reading limits and schedules)
-  **10 Reading Sessions** (historical reading data)

### Step 4: Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:4000`

## 🔐 Demo Accounts

After running the seed script, use these credentials:

### Admin Account

-  **Email**: admin@hkids.com
-  **Password**: Admin123

### Parent Accounts

**Parent 1 (Sarah Johnson)**

-  **Email**: sarah@example.com
-  **Password**: Parent123
-  **Children**: Leo (7), Mia (4)

**Parent 2 (Michael Chen)**

-  **Email**: michael@example.com
-  **Password**: Parent456
-  **Children**: Sophie (10), Jack (3, inactive)

### Child PINs

-  **Leo**: 1234
-  **Mia**: 2468
-  **Sophie**: 5678
-  **Jack**: 9999

## 📚 API Documentation

Interactive API documentation is available at:

```
http://localhost:4000/docs
```

## 🛣️ API Routes Overview

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint     | Description                 | Access        |
| ------ | ------------ | --------------------------- | ------------- |
| POST   | `/register`  | Register new parent account | Public        |
| POST   | `/login`     | Login with email/password   | Public        |
| POST   | `/child/pin` | Child PIN authentication    | Public        |
| GET    | `/me`        | Get current user info       | Authenticated |

### Age Groups (`/api/v1/age-groups`)

| Method | Endpoint  | Description            | Access |
| ------ | --------- | ---------------------- | ------ |
| GET    | `/public` | List active age groups | Public |
| GET    | `/`       | List all age groups    | Admin  |
| POST   | `/`       | Create age group       | Admin  |
| PATCH  | `/:id`    | Update age group       | Admin  |
| DELETE | `/:id`    | Delete age group       | Admin  |

### Categories (`/api/v1/categories`)

| Method | Endpoint  | Description            | Access |
| ------ | --------- | ---------------------- | ------ |
| GET    | `/public` | List active categories | Public |
| GET    | `/`       | List all categories    | Admin  |
| POST   | `/`       | Create category        | Admin  |
| PATCH  | `/:id`    | Update category        | Admin  |
| DELETE | `/:id`    | Delete category        | Admin  |

### Books (`/api/v1/books`)

| Method | Endpoint             | Description                   | Access |
| ------ | -------------------- | ----------------------------- | ------ |
| GET    | `/`                  | List all books (with filters) | Admin  |
| GET    | `/:id`               | Get book details              | Admin  |
| POST   | `/`                  | Create new book               | Admin  |
| PATCH  | `/:id`               | Update book                   | Admin  |
| DELETE | `/:id`               | Delete book                   | Admin  |
| PATCH  | `/:id/review`        | Approve/reject book           | Admin  |
| PATCH  | `/:id/pages/reorder` | Reorder book pages            | Admin  |

### Parent Portal (`/api/v1/parent`)

| Method | Endpoint                  | Description                   | Access |
| ------ | ------------------------- | ----------------------------- | ------ |
| GET    | `/children`               | List my children              | Parent |
| POST   | `/children`               | Add new child                 | Parent |
| GET    | `/children/:id`           | Get child details             | Parent |
| PATCH  | `/children/:id`           | Update child profile          | Parent |
| DELETE | `/children/:id`           | Remove child                  | Parent |
| GET    | `/children/:id/policy`    | Get child's policy            | Parent |
| PATCH  | `/children/:id/policy`    | Update reading policy         | Parent |
| GET    | `/children/:id/analytics` | Get child's reading analytics | Parent |

### Kids Reading Interface (`/api/v1/kids`)

| Method | Endpoint            | Description                     | Access |
| ------ | ------------------- | ------------------------------- | ------ |
| GET    | `/books`            | List available books (filtered) | Child  |
| GET    | `/books/:id`        | Get book details                | Child  |
| GET    | `/books/:id/pages`  | Get book pages                  | Child  |
| POST   | `/reading/start`    | Start reading session           | Child  |
| POST   | `/reading/progress` | Update reading progress         | Child  |
| POST   | `/reading/end`      | End reading session             | Child  |

### Analytics (`/api/v1/admin/analytics`)

| Method | Endpoint     | Description               | Access |
| ------ | ------------ | ------------------------- | ------ |
| GET    | `/overview`  | Platform overview stats   | Admin  |
| GET    | `/reading`   | Reading trends & patterns | Admin  |
| GET    | `/books/top` | Most popular books        | Admin  |

### Uploads (`/api/v1/uploads`)

| Method | Endpoint | Description                | Access |
| ------ | -------- | -------------------------- | ------ |
| POST   | `/image` | Upload image to Cloudinary | Admin  |

## 📦 Database Models

### User Model

-  Authentication credentials (email, password)
-  Role: ADMIN or PARENT
-  Timestamps

### Age Group Model

-  Name, minAge, maxAge
-  Description
-  Sort order & active status

### Category Model

-  Name, slug, description
-  Sort order & active status

### Book Model

-  Title, slug, summary
-  Cover image URL
-  Age group & categories
-  Pages array (pageNumber, title, text, imageUrl, narrationUrl)
-  Tags
-  Status: draft, published, archived
-  Visibility: private, public
-  Approval status
-  Created by & updated by references

### Child Model

-  Parent reference
-  Name, age, avatar
-  Age group assignment
-  PIN hash (optional)
-  Active status

### Child Policy Model

-  Child reference
-  Allowed categories & age groups
-  Daily time limit (minutes)
-  Reading schedule (start/end time)

### Reading Session Model

-  Child & parent references
-  Book reference
-  Start/end timestamps
-  Duration in minutes
-  Pages read array
-  Progress events with timestamps

## 🧪 Available Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Compile TypeScript to JavaScript
npm start          # Start production server
npm run check      # Type-check without emitting files
npm run seed       # Seed database with demo data
```

## 🔒 Security Features

-  **JWT Authentication**: Secure token-based authentication
-  **Password Hashing**: bcryptjs with salt rounds
-  **Role-Based Access Control**: Middleware-enforced permissions
-  **Request Validation**: Zod schemas for all inputs
-  **Child Safety**: PIN-based access with policy enforcement
-  **Error Handling**: Centralized error middleware

## 🎨 Seed Data Details

### Age Groups (6 total)

1. **Toddlers & Pre-K** (2-4 years)
2. **Little Explorers** (3-5 years)
3. **Early Readers** (6-8 years)
4. **Junior Readers** (9-12 years)
5. **Young Adults** (13-17 years)
6. **All Ages** (2-17 years)

### Categories (10 total)

1. Animals & Nature
2. Space & Science
3. Fairy Tales
4. Mystery & Detective
5. Adventure
6. Friendship
7. History & Culture
8. Fantasy
9. Sports & Activities
10.   Family

### Books (10 total)

All books include complete metadata, multiple pages with text and images, categories, tags, and publication status.

1. **The Brave Little Lion and the Hidden River** - Early Readers, 4 pages
2. **Elephant Splash!** - Little Explorers, 3 pages
3. **Journey to Mars** - Junior Readers, 3 pages
4. **Moon Shadows** - Early Readers, 3 pages
5. **The Secret Garden Adventure** - Early Readers, 4 pages
6. **The Soccer Star's Big Game** - Junior Readers, 4 pages
7. **Grandpa's Treasure Map** - Junior Readers, 4 pages
8. **The Dragon Who Couldn't Breathe Fire** - Little Explorers, 4 pages
9. **The Time-Traveling Lunchbox** - Junior Readers, 4 pages
10.   **The Lonely Robot** - Early Readers, 4 pages (Draft status)

### Children & Policies

**Leo (Age 7)** - 35 min daily, 4PM-8:30PM, PIN: 1234
**Mia (Age 4)** - 20 min daily, 3PM-6PM, PIN: 2468
**Sophie (Age 10)** - 60 min daily, 5PM-9PM, PIN: 5678
**Jack (Age 3, Inactive)** - 15 min daily, PIN: 9999

## 🌐 CORS Configuration

Configured for:

-  `http://localhost:5173` (Vite dev server)
-  `http://localhost:3000`

## 📝 Environment Variables

| Variable                | Required | Description                 |
| ----------------------- | -------- | --------------------------- |
| `PORT`                  | No       | Server port (default: 4000) |
| `NODE_ENV`              | No       | Environment mode            |
| `MONGODB_URI`           | Yes      | MongoDB connection string   |
| `AUTH_SECRET`           | Yes      | JWT signing secret          |
| `ADMIN_BOOTSTRAP_KEY`   | No       | Admin creation key          |
| `CLOUDINARY_CLOUD_NAME` | Yes      | Cloudinary cloud name       |
| `CLOUDINARY_API_KEY`    | Yes      | Cloudinary API key          |
| `CLOUDINARY_API_SECRET` | Yes      | Cloudinary API secret       |

## 👨‍💻 Author

HKids Development Team

---

**Need Help?** Check `/docs` for API documentation or run `npm run seed` to reset demo data.
