import { useState, type ReactNode } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Logout, MenuBook } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext";
import { ROUTES } from "@/utils/constants";

interface ParentLayoutProps {
  children: ReactNode;
}

export function ParentLayout({ children }: ParentLayoutProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          <Container
            maxWidth="xl"
            sx={{
              px: { xs: 1.5, sm: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  display: "grid",
                  placeItems: "center",
                  color: "common.white",
                }}
              >
                <MenuBook fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  HKids
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Parent Portal
                </Typography>
              </Box>
            </Stack>

            {!isAuthenticated && (
              <Stack direction="row" spacing={1}>
                <Button
                  type="button"
                  onClick={() => navigate(ROUTES.LOGIN)}
                  variant="text"
                >
                  Login
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate(ROUTES.REGISTER)}
                  variant="contained"
                >
                  Register
                </Button>
              </Stack>
            )}

            {isAuthenticated && (
              <>
                <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
                    {(user?.name?.charAt(0) || "P").toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      navigate(ROUTES.PARENT.PORTAL);
                    }}
                  >
                    Parent Portal
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      logout();
                    }}
                  >
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        {children}
      </Container>
    </Box>
  );
}
