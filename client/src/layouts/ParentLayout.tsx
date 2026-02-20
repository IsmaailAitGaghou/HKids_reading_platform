import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert, Box, CircularProgress, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext";
import { listChildren } from "@/api/parent.api";
import type { Child } from "@/types/child.types";
import { ROUTES } from "@/utils/constants";
import { ParentPortalSidebar } from "@/components/parent";

interface ParentLayoutProps {
  children: ReactNode;
}

export function ParentLayout({ children }: ParentLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthContext();

  const [childrenProfiles, setChildrenProfiles] = useState<Child[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  const activeChildId = useMemo(() => {
    const match = location.pathname.match(/\/parent\/children\/([^/]+)/);
    return match?.[1];
  }, [location.pathname]);

  const activeSection = useMemo<"dashboard" | "profiles" | "manage">(() => {
    if (location.pathname === ROUTES.PARENT.PORTAL) {
      return "dashboard";
    }
    if (location.pathname === ROUTES.PARENT.CHILDREN) {
      return "manage";
    }
    return "profiles";
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;

    const loadProfiles = async () => {
      try {
        setLoadingProfiles(true);
        setProfilesError(null);
        const response = await listChildren();
        if (!mounted) return;
        setChildrenProfiles(response.children || []);
      } catch {
        if (!mounted) return;
        setProfilesError("Failed to load child profiles.");
      } finally {
        if (mounted) setLoadingProfiles(false);
      }
    };

    void loadProfiles();
    const refreshProfiles = () => void loadProfiles();
    window.addEventListener("parent:children-updated", refreshProfiles);

    return () => {
      mounted = false;
      window.removeEventListener("parent:children-updated", refreshProfiles);
    };
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "background.default" }}>
      <ParentPortalSidebar
        childrenProfiles={childrenProfiles}
        activeChildId={activeChildId}
        activeSection={activeSection}
        onOpenDashboard={() => navigate(ROUTES.PARENT.PORTAL)}
        onOpenProfiles={() => {
          const fallbackId = activeChildId || childrenProfiles[0]?.id;
          if (fallbackId) {
            navigate(ROUTES.PARENT.CHILD_VIEW(fallbackId));
            return;
          }
          navigate(ROUTES.PARENT.CHILDREN);
        }}
        onOpenManageChildren={() => navigate(ROUTES.PARENT.CHILDREN)}
        onOpenChild={(id) => navigate(ROUTES.PARENT.CHILD_VIEW(id))}
        onOpenChildLogin={() => {
          const targetChildId = activeChildId || childrenProfiles[0]?.id;
          if (!targetChildId) return;
          navigate(`${ROUTES.CHILD_LOGIN}?childId=${encodeURIComponent(targetChildId)}`);
        }}
        onLogout={logout}
      />

      <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 3 } }}>
        {profilesError && <Alert severity="error" sx={{ mb: 2 }}>{profilesError}</Alert>}
        {loadingProfiles ? (
          <Stack sx={{ minHeight: "60vh", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
          </Stack>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
}
