import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert, Box, CircularProgress, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const { logout } = useAuthContext();

  const [childrenProfiles, setChildrenProfiles] = useState<Child[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const activeChildId = useMemo(() => {
    const match = location.pathname.match(/\/parent\/children\/([^/]+)/);
    return match?.[1];
  }, [location.pathname]);

  useEffect(() => {
    setMobileSidebarOpen(false);
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
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          zIndex: (drawerTheme) => drawerTheme.zIndex.appBar + 2,
          "& .MuiDrawer-paper": {
            width: 320,
            maxWidth: "88vw",
            zIndex: (drawerTheme) => drawerTheme.zIndex.appBar + 2,
          },
        }}
      >
        <ParentPortalSidebar
          mobile
          onNavigate={() => setMobileSidebarOpen(false)}
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
      </Drawer>

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
        {isMobile && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2, py: 0.5 }}
          >
            <IconButton
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Parent Portal
            </Typography>
          </Stack>
        )}

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
