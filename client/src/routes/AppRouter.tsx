import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ParentLayout } from "@/layouts/ParentLayout";
import { KidsLayout } from "@/layouts/KidsLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ChildLoginPage } from "@/pages/auth/ChildLoginPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { CategoriesPage } from "@/pages/admin/CategoriesPage";
import { AgeGroupsPage } from "@/pages/admin/AgeGroupsPage";
import { AdminBookCreatePage } from "@/pages/admin/AdminBookCreatePage";
import { ParentDashboard } from "@/pages/parent/ParentDashboard";
import { ParentChildPage } from "@/pages/parent/ParentChildPage";
import { ParentChildrenManagePage } from "@/pages/parent/ParentChildrenManagePage";
import { KidsLibrary } from "@/pages/kids/KidsLibrary";
import { KidsReadPage } from "@/pages/kids/KidsReadPage";
import { KidsSessionCompletePage } from "@/pages/kids/KidsSessionCompletePage";
import { ROUTES, ROLES } from "@/utils/constants";

export function AppRouter() {
   return (
      <BrowserRouter>
         <AuthProvider>
            <Routes>
               {/* Public Routes */}
               <Route
                  path={ROUTES.LOGIN}
                  element={
                     <PublicRoute>
                        <LoginPage />
                     </PublicRoute>
                  }
               />
               <Route
                  path={ROUTES.REGISTER}
                  element={
                     <PublicRoute>
                        <RegisterPage />
                     </PublicRoute>
                  }
               />
               <Route
                  path={ROUTES.CHILD_LOGIN}
                  element={
                     <PublicRoute>
                        <ChildLoginPage />
                     </PublicRoute>
                  }
               />

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
                  path={ROUTES.ADMIN.AGE_GROUPS}
                  element={
                     <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <AdminLayout>
                           <AgeGroupsPage />
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
               <Route
                  path={ROUTES.ADMIN.BOOK_EDIT(":id")}
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
                  path={ROUTES.PARENT.PORTAL}
                  element={
                     <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                        <ParentLayout>
                           <ParentDashboard />
                        </ParentLayout>
                     </ProtectedRoute>
                  }
               />
               <Route
                  path={ROUTES.PARENT.CHILDREN}
                  element={
                     <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                        <ParentLayout>
                           <ParentChildrenManagePage />
                        </ParentLayout>
                     </ProtectedRoute>
                  }
               />
               <Route
                  path={ROUTES.PARENT.CHILD_VIEW(":id")}
                  element={
                     <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                        <ParentLayout>
                           <ParentChildPage />
                        </ParentLayout>
                     </ProtectedRoute>
                  }
               />
               <Route path="/parent/dashboard" element={<Navigate to={ROUTES.PARENT.PORTAL} replace />} />

               {/* Kids Routes */}
               <Route
                  path="/kids"
                  element={
                     <ProtectedRoute allowedRoles={[ROLES.CHILD]}>
                        <KidsLayout />
                     </ProtectedRoute>
                  }
               >
                  <Route index element={<Navigate to="library" replace />} />
                  <Route path="library" element={<KidsLibrary />} />
                  <Route path="books/:id" element={<KidsReadPage />} />
                  <Route path="read/:id" element={<KidsReadPage />} />
                  <Route path="session-complete" element={<KidsSessionCompletePage />} />
               </Route>

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
