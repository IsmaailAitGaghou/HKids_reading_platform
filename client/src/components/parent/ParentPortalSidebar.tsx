import {
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import {
  Dashboard,
  ManageAccounts,
  Login,
  Logout,
  SupervisedUserCircle,
  MenuBook,
  CheckCircle,
} from "@mui/icons-material";
import type { Child } from "@/types/child.types";

interface ParentPortalSidebarProps {
  childrenProfiles: Child[];
  activeChildId?: string;
  activeSection: "dashboard" | "profiles" | "manage";
  mobile?: boolean;
  onNavigate?: () => void;
  onOpenDashboard: () => void;
  onOpenProfiles: () => void;
  onOpenManageChildren: () => void;
  onOpenChild: (id: string) => void;
  onOpenChildLogin: () => void;
  onLogout: () => void;
}

const mainMenu = [
  { label: "Dashboard", icon: <Dashboard />, key: "dashboard" },
  { label: "Child Profiles", icon: <SupervisedUserCircle />, key: "profiles" },
  { label: "Manage Children", icon: <ManageAccounts />, key: "manage" },
] as const;

export function ParentPortalSidebar({
  childrenProfiles,
  activeChildId,
  activeSection,
  mobile = false,
  onNavigate,
  onOpenDashboard,
  onOpenProfiles,
  onOpenManageChildren,
  onOpenChild,
  onOpenChildLogin,
  onLogout,
}: ParentPortalSidebarProps) {
  const withNavigate = (action: () => void) => {
    action();
    onNavigate?.();
  };

  return (
    <Box
      sx={{
        width: mobile ? "100%" : 320,
        minWidth: mobile ? 0 : 320,
        alignSelf: "flex-start",
        position: mobile ? "relative" : "sticky",
        top: mobile ? "auto" : 0,
        height: mobile ? "100%" : "100vh",
        overflowY: "auto",
        borderRight: mobile ? "none" : "1px solid",
        borderColor: mobile ? "transparent" : "divider",
        bgcolor: "background.paper",
        display: mobile ? "flex" : { xs: "none", lg: "flex" },
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: "primary.main",
              color: "common.white",
              display: "grid",
              placeItems: "center",
            }}
          >
            <MenuBook />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              HKids
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
              PARENTAL CONTROL
            </Typography>
          </Box>
        </Stack>
      </Box>

      

      <List sx={{ px: 2, py: 0, mb: 2 }}>
        {mainMenu.map((item) => {
          const isDashboard = item.key === "dashboard";
          const isProfiles = item.key === "profiles";
          const isManageChildren = item.key === "manage";
          const selected =
            (isDashboard && activeSection === "dashboard") ||
            (isProfiles && activeSection === "profiles") ||
            (isManageChildren && activeSection === "manage");
          return (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.6 }}>
              <ListItemButton
                onClick={() =>
                  withNavigate(() => {
                    if (isDashboard) onOpenDashboard();
                    if (isProfiles) onOpenProfiles();
                    if (isManageChildren) onOpenManageChildren();
                  })
                }
                selected={selected}
                sx={{
                  borderRadius: 1.5,
                  minHeight: 52,
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    color: "primary.main",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ px: 3, pb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.09em", fontWeight: 700 }}>
          ACTIVE PROFILES
        </Typography>
      </Box>

      <Stack spacing={1} sx={{ px: 2 }}>
        {childrenProfiles.map((child) => {
          const isActive = child.id === activeChildId;
          return (
            <Button
              key={child.id}
              onClick={() => withNavigate(() => onOpenChild(child.id))}
              type="button"
              sx={{
                justifyContent: "flex-start",
                px: 1.25,
                py: 1.1,
                borderRadius: 1.5,
                color: "text.primary",
                bgcolor: isActive ? "action.selected" : "transparent",
                border: "1px solid",
                borderColor: isActive ? "divider" : "transparent",
              }}
            >
              <Avatar src={child.avatar || undefined} sx={{ width: 38, height: 38, mr: 1.3 }}>
                {(child.name.charAt(0) || "C").toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                  {child.name}
                </Typography>
                <Typography variant="caption" color={isActive ? "primary.main" : "text.secondary"} noWrap>
                  {isActive ? "Currently Managing" : "Profile"}
                </Typography>
              </Box>
              {isActive && <CheckCircle sx={{ color: "primary.main", fontSize: 18 }} />}
            </Button>
          );
        })}
      </Stack>

      <Box sx={{ mt: "auto", p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Login />}
          onClick={() => withNavigate(onOpenChildLogin)}
          type="button"
          sx={{ py: 1.1, mb: 1 }}
          disabled={childrenProfiles.length === 0}
        >
          Child Login
        </Button>

        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<Logout />}
          onClick={() => withNavigate(onLogout)}
          type="button"
          sx={{ py: 1.1 }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );
}
