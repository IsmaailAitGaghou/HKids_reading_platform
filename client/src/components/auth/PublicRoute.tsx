import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthContext } from "@/context/useAuthContext";
import { ROUTES, ROLES, type Role } from "@/utils/constants";

interface PublicRouteProps {
  children: React.ReactNode;
}

function getDefaultRouteForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return ROUTES.ADMIN.DASHBOARD;
    case "PARENT":
      return ROUTES.PARENT.PORTAL;
    case "CHILD":
      return ROUTES.KIDS.LIBRARY;
    default:
      return ROUTES.HOME;
  }
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (isAuthenticated && user) {
    const isParentOpeningChildLogin =
      location.pathname === ROUTES.CHILD_LOGIN && user.role === ROLES.PARENT;

    if (isParentOpeningChildLogin) {
      return <>{children}</>;
    }

    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
}
