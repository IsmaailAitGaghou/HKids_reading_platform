import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/layouts/AdminLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ChildLoginPage } from "@/pages/auth/ChildLoginPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { CategoriesPage } from "@/pages/admin/CategoriesPage";
import { AdminBookCreatePage } from "@/pages/admin/AdminBookCreatePage";
import { ParentDashboard } from "@/pages/parent/ParentDashboard";
import { KidsLibrary } from "@/pages/kids/KidsLibrary";
import { ROUTES, ROLES } from "@/utils/constants";

export function AppRouter() {
   return (
      <BrowserRouter>
         <AuthProvider>
            <Routes>
               {/* Public Routes */}
               <Route path={ROUTES.LOGIN} element={<LoginPage />} />
               <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
               <Route path={ROUTES.CHILD_LOGIN} element={<ChildLoginPage />} />

               {/* Admin Routes */}
               <Route
                  path={ROUTES.ADMIN.DASHBOARD}
                  element={
                     <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <AdminLayout>
                           <AdminDashboard />
                        </AdminLayout>
                     </ProtectedRoute>
                  }
               />
               <Route
                  path={ROUTES.ADMIN.CATEGORIES}
                  element={
                     <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <AdminLayout>
                           <CategoriesPage />
                        </AdminLayout>
                     </ProtectedRoute>
                  }
               />
               <Route
                  path={ROUTES.ADMIN.BOOK_CREATE}
                  element={
                     <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <AdminLayout>
                           <AdminBookCreatePage />
                        </AdminLayout>
                     </ProtectedRoute>
                  }
               />

               {/* Parent Routes */}
               <Route
                  path={ROUTES.PARENT.DASHBOARD}
                  element={
                     <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                        <ParentDashboard />
                     </ProtectedRoute>
                  }
               />

               {/* Kids Routes */}
               <Route
                  path={ROUTES.KIDS.LIBRARY}
                  element={
                     <ProtectedRoute allowedRoles={[ROLES.CHILD]}>
                        <KidsLibrary />
                     </ProtectedRoute>
                  }
               />

               {/* Catch-all - redirect to login */}
               <Route
                  path="*"
                  element={<Navigate to={ROUTES.LOGIN} replace />}
               />
            </Routes>
         </AuthProvider>
      </BrowserRouter>
   );
}
