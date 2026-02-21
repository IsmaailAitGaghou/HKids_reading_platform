# HKids Frontend Client

> A modern, role-based React application for a children's reading platform built with TypeScript, Vite, and Material-UI.

## 🎯 Overview

HKids Frontend provides three distinct user experiences tailored to different roles:

-  **Admin Dashboard**: Complete CMS for managing books, categories, age groups, and viewing platform analytics
-  **Parent Portal**: Family management interface for creating child profiles, setting reading policies, and monitoring progress
-  **Kids Reader**: Child-friendly, distraction-free reading interface with enforced parental controls

## 🚀 Tech Stack

-  **Framework**: React 18 with TypeScript
-  **Build Tool**: Vite
-  **UI Library**: Material-UI (MUI)
-  **State Management**: React Context API
-  **Routing**: React Router v6
-  **HTTP Client**: Axios
-  **Form Handling**: React Hook Form with Zod validation
-  **Styling**: CSS-in-JS with MUI styled components

## 📁 Project Structure

```
src/
├── api/                 # API client and endpoint functions
│   ├── client.ts        # Axios instance with interceptors
│   ├── auth.api.ts      # Authentication endpoints
│   ├── ageGroups.api.ts # Age groups endpoints
│   ├── categories.api.ts# Categories endpoints
│   ├── books.api.ts     # Books management
│   ├── parent.api.ts    # Parent portal endpoints
│   ├── kids.api.ts      # Kids reading endpoints
│   ├── analytics.api.ts # Analytics endpoints
│   └── uploads.api.ts   # File upload endpoints
├── assets/              # Static assets (images, icons)
├── components/          # Reusable components
│   ├── admin/           # Admin-specific components
│   ├── auth/            # Auth forms and components
│   ├── dashboard/       # Shared dashboard components
│   ├── hook-form/       # React Hook Form wrappers
│   ├── kids/            # Kids interface components
│   └── parent/          # Parent portal components
├── context/             # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   └── useAuthContext.ts# Auth context hook
├── layouts/             # Layout components
│   ├── AdminLayout.tsx  # Admin dashboard layout
│   └── ParentLayout.tsx # Parent portal layout
├── pages/               # Page components
│   ├── admin/           # Admin pages
│   ├── auth/            # Login/register pages
│   ├── kids/            # Kids reading pages
│   └── parent/          # Parent dashboard pages
├── routes/              # Routing configuration
│   └── AppRouter.tsx    # Main router with protected routes
├── styles/              # Global styles and theme
│   ├── globals.css      # Global CSS
│   └── theme.ts         # MUI theme configuration
├── types/               # TypeScript type definitions
│   ├── auth.types.ts
│   ├── book.types.ts
│   ├── category.types.ts
│   ├── age-group.types.ts
│   ├── child.types.ts
│   ├── reading.types.ts
│   ├── analytics.types.ts
│   └── common.types.ts
├── utils/               # Utility functions
├── App.tsx              # Root component
└── main.tsx             # Application entry point
```

## 🔧 Installation & Setup

### Prerequisites

-  Node.js (v18 or higher)
-  npm or yarn
-  Backend server running (see server README)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the client directory:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

### Step 3: Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## 🔐 Demo Accounts

Use these credentials to test different user roles (after seeding the backend):

### Admin Login

-  **Email**: admin@hkids.com
-  **Password**: Admin123
-  **Access**: Full CMS, analytics, and platform management

### Parent Logins

**Parent 1 (Sarah Johnson)**

-  **Email**: sarah@example.com
-  **Password**: Parent123
-  **Children**: Leo (7 years), Mia (4 years)

**Parent 2 (Michael Chen)**

-  **Email**: michael@example.com
-  **Password**: Parent456
-  **Children**: Sophie (10 years), Jack (3 years, inactive)

### Child PINs

After logging in as a parent, select a child and use their PIN:

-  **Leo**: 1234
-  **Mia**: 2468
-  **Sophie**: 5678
-  **Jack**: 9999

## 🎨 Features by Role

### 👨‍💼 Admin Features

-  **Dashboard**: Overview of platform statistics
-  **Book Management**: Create, edit, delete, and publish books
-  **Content Organization**: Manage age groups and categories
-  **Analytics**: View reading trends, popular books, and user engagement
-  **Book Editor**: Multi-page book creation with rich content
-  **Approval Workflow**: Review and approve user-submitted content

### 👨‍👩‍👧 Parent Features

-  **Child Profiles**: Create and manage multiple child accounts
-  **Reading Policies**: Set content filters, time limits, and reading schedules
-  **Progress Monitoring**: View reading history and analytics per child
-  **Safety Controls**: Configure age-appropriate content access
-  **Activity Dashboard**: See what your children are reading

### 👶 Kids Features

-  **Safe Library**: Age-appropriate, filtered book catalog
-  **Book Reader**: Distraction-free reading experience
-  **Progress Tracking**: Automatic session tracking
-  **Page Navigation**: Easy-to-use page turner
-  **Policy Enforcement**: Automatic time limits and content filtering

## 📱 Key Pages

### Public Pages

-  `/` - Landing page
-  `/login` - User authentication
-  `/register` - Parent registration

### Admin Pages

-  `/admin/dashboard` - Admin overview
-  `/admin/books` - Book management
-  `/admin/books/new` - Create new book
-  `/admin/books/:id/edit` - Edit book
-  `/admin/age-groups` - Age group management
-  `/admin/categories` - Category management
-  `/admin/analytics` - Platform analytics

### Parent Pages

-  `/parent/dashboard` - Parent overview
-  `/parent/children` - Children list
-  `/parent/children/new` - Add child
-  `/parent/children/:id` - Child details
-  `/parent/children/:id/policy` - Edit reading policy
-  `/parent/children/:id/analytics` - Child's reading stats

### Kids Pages

-  `/kids/select` - Child selection with PIN
-  `/kids/library` - Filtered book catalog
-  `/kids/book/:id` - Book reader

## 🎨 Theme & Styling

The application uses Material-UI with a custom theme:

-  **Primary Color**: Blue (customizable)
-  **Secondary Color**: Orange
-  **Dark Mode**: Not enabled by default
-  **Responsive**: Mobile-first approach
-  **Typography**: Optimized for readability

## 🔄 State Management

-  **Authentication**: Context API with localStorage persistence
-  **API Data**: Local state with React hooks
-  **Form State**: React Hook Form
-  **Route Protection**: Custom ProtectedRoute component

## 🛡️ Security Features

-  **JWT Authentication**: Token-based auth with automatic refresh
-  **Protected Routes**: Role-based route guards
-  **Secure Storage**: HttpOnly cookies for tokens (recommended)
-  **Input Validation**: Client-side validation with Zod
-  **XSS Protection**: Sanitized user inputs

## 🧪 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 📦 Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

## 🌐 API Integration

The client communicates with the backend via RESTful API:

```typescript
// Example API call
import { booksApi } from "./api/books.api";

const books = await booksApi.getAll({
   ageGroupId: "xxx",
   status: "published",
});
```

All API calls include:

-  Automatic authentication headers
-  Error handling with user-friendly messages
-  Request/response interceptors
-  TypeScript type safety

## 📱 Responsive Design

The application is fully responsive and works on:

-  Desktop (1920px+)
-  Laptop (1024px - 1919px)
-  Tablet (768px - 1023px)
-  Mobile (320px - 767px)

## 🎯 Component Examples

### Protected Route

```typescript
<ProtectedRoute role="ADMIN">
   <AdminDashboard />
</ProtectedRoute>
```

### Form with Validation

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
   resolver: zodResolver(bookSchema),
   defaultValues: { title: "", summary: "" },
});
```

### API Call with Loading State

```typescript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

useEffect(() => {
   const fetchData = async () => {
      setLoading(true);
      try {
         const result = await api.getData();
         setData(result);
      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
   };
   fetchData();
}, []);
```

## 🔍 Type Safety

All API responses and component props are fully typed:

```typescript
interface Book {
   id: string;
   title: string;
   summary: string;
   coverImageUrl: string;
   ageGroupId: string;
   categoryIds: string[];
   pages: BookPage[];
   tags: string[];
   status: "draft" | "published" | "archived";
}
```

## 🐛 Troubleshooting

### API Connection Issues

-  Verify backend server is running at `http://localhost:4000`
-  Check `.env` file has correct `VITE_API_BASE_URL`
-  Clear browser cache and localStorage

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Hot Reload Not Working

-  Check if Vite config has correct server settings
-  Restart dev server: `npm run dev`

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Drag dist folder to Netlify dashboard
```

### Custom Server

```bash
npm run build
# Serve dist folder with any static file server
```

## 📚 Learning Resources

-  [React Documentation](https://react.dev)
-  [TypeScript Handbook](https://www.typescriptlang.org/docs/)
-  [Vite Guide](https://vitejs.dev/guide/)
-  [Material-UI Docs](https://mui.com/getting-started/)
-  [React Router Docs](https://reactrouter.com/)

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Add proper type definitions
4. Test on multiple screen sizes
5. Follow Material-UI best practices

## 📄 License

This project is private and proprietary.

## 👨‍💻 Development Team

HKids Frontend Team

---

**Getting Started**: Run backend server first, then start this client with `npm run dev`. Use demo accounts listed above to explore all features.
