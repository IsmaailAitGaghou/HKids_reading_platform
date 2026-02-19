import { useEffect, useState, type ReactNode } from "react";
import {
   Alert,
   Avatar,
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Divider,
   Drawer,
   FormControl,
   IconButton,
   InputBase,
   InputLabel,
   List,
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   Menu,
   MenuItem,
   Select,
   Stack,
   TextField,
   Typography,
} from "@mui/material";
import {
   Category,
   KeyboardArrowDown,
   Logout,
   MenuBook,
   NotificationsNone,
   Search,
   Settings,
   TrendingUp,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext";
import { createCategory } from "@/api/categories.api";
import { ROUTES } from "@/utils/constants";

const DRAWER_WIDTH = 280;
const CATEGORY_CREATED_EVENT = "admin:category-created";
const OPEN_CATEGORY_DIALOG_EVENT = "admin:open-category-dialog";

interface AdminLayoutProps {
   children: ReactNode;
}

const navigationItems = [
   {
      title: "Book Library",
      path: ROUTES.ADMIN.DASHBOARD,
      icon: <MenuBook />,
   },
   {
      title: "Categories",
      path: ROUTES.ADMIN.CATEGORIES,
      icon: <Category />,
   },
   {
      title: "User Analytics",
      path: ROUTES.ADMIN.ANALYTICS,
      icon: <TrendingUp />,
   },
   {
      title: "Settings",
      path: "/admin/settings",
      icon: <Settings />,
   },
];

export function AdminLayout({ children }: AdminLayoutProps) {
   const navigate = useNavigate();
   const location = useLocation();
   const { user, logout } = useAuthContext();

   const isDashboardRoute = location.pathname === ROUTES.ADMIN.DASHBOARD;
   const isCategoriesRoute = location.pathname === ROUTES.ADMIN.CATEGORIES;

   const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
      null
   );
   const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
   const [categoryDialogError, setCategoryDialogError] = useState("");
   const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

   const [categoryForm, setCategoryForm] = useState({
      name: "",
      description: "",
      sortOrder: "0",
      isActive: true,
   });

   const resetCategoryForm = () => {
      setCategoryForm({
         name: "",
         description: "",
         sortOrder: "0",
         isActive: true,
      });
      setCategoryDialogError("");
   };

   const getErrorMessage = (error: unknown, fallback: string) => {
      if (
         typeof error === "object" &&
         error !== null &&
         "details" in error &&
         typeof error.details === "object" &&
         error.details !== null &&
         "fieldErrors" in error.details &&
         typeof error.details.fieldErrors === "object" &&
         error.details.fieldErrors !== null
      ) {
         const fieldErrors = error.details.fieldErrors as Record<
            string,
            string[] | undefined
         >;
         const firstError = Object.values(fieldErrors).find(
            (messages) => Array.isArray(messages) && messages.length > 0
         );
         if (firstError && firstError[0]) {
            return firstError[0];
         }
      }

      if (
         typeof error === "object" &&
         error !== null &&
         "message" in error &&
         typeof error.message === "string"
      ) {
         return error.message;
      }
      return fallback;
   };

   useEffect(() => {
      const openCategoryDialog = () => setIsCategoryDialogOpen(true);
      window.addEventListener(OPEN_CATEGORY_DIALOG_EVENT, openCategoryDialog);
      return () => {
         window.removeEventListener(
            OPEN_CATEGORY_DIALOG_EVENT,
            openCategoryDialog
         );
      };
   }, []);

   const handleCloseCategoryDialog = () => {
      if (isCategorySubmitting) return;
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
   };

   const handleCreateCategory = async () => {
      if (!categoryForm.name.trim()) {
         setCategoryDialogError("Category name is required.");
         return;
      }

      try {
         setIsCategorySubmitting(true);
         setCategoryDialogError("");

         await createCategory({
            name: categoryForm.name.trim(),
            description: categoryForm.description.trim() || undefined,
            sortOrder: Number(categoryForm.sortOrder) || 0,
            isActive: categoryForm.isActive,
         });

         window.dispatchEvent(new Event(CATEGORY_CREATED_EVENT));
         setIsCategoryDialogOpen(false);
         resetCategoryForm();
      } catch (error) {
         setCategoryDialogError(
            getErrorMessage(error, "Failed to create category. Please try again.")
         );
      } finally {
         setIsCategorySubmitting(false);
      }
   };

   return (
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
         <Drawer
            variant="permanent"
            sx={{
               width: DRAWER_WIDTH,
               flexShrink: 0,
               "& .MuiDrawer-paper": {
                  width: DRAWER_WIDTH,
                  boxSizing: "border-box",
                  bgcolor: "#fff",
                  borderRight: "1px solid",
                  borderColor: "divider",
               },
            }}
         >
            <Box sx={{ px: 2, py: 1.4 }}>
               <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                     sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                     }}
                  >
                     <MenuBook sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                     <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#702AFA" }}
                     >
                        HKids
                     </Typography>
                     <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                     >
                        Admin Portal
                     </Typography>
                  </Box>
               </Stack>
            </Box>

            <Divider />

            <List sx={{ px: 1, py: 2, flex: 1 }}>
               {navigationItems.map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                     <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                           onClick={() => navigate(item.path)}
                           sx={{
                              borderRadius: 2,
                              minHeight: 48,
                              bgcolor: isActive ? "#F0E7FF" : "transparent",
                              color: isActive ? "#702AFA" : "text.primary",
                           }}
                        >
                           <ListItemIcon
                              sx={{
                                 minWidth: 40,
                                 color: isActive ? "#702AFA" : "text.secondary",
                              }}
                           >
                              {item.icon}
                           </ListItemIcon>
                           <ListItemText
                              primary={item.title}
                              primaryTypographyProps={{
                                 fontWeight: isActive ? 600 : 500,
                                 fontSize: "0.95rem",
                              }}
                           />
                        </ListItemButton>
                     </ListItem>
                  );
               })}
            </List>

            <Divider />

            <Box sx={{ p: 2 }}>
               <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                     p: 1.5,
                     borderRadius: 2,
                     bgcolor: "grey.50",
                     cursor: "pointer",
                  }}
                  onClick={(event) => setUserMenuAnchor(event.currentTarget)}
               >
                  <Avatar
                     sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "primary.main",
                     }}
                  >
                     {(user?.name?.trim()?.charAt(0) || "A").toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                     <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                        noWrap
                        color="text.primary"
                     >
                        {user?.name}
                     </Typography>
                     <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}
                     >
                        {user?.role}
                     </Typography>
                  </Box>
                  <KeyboardArrowDown sx={{ color: "text.secondary" }} />
               </Stack>
            </Box>

            <Menu
               anchorEl={userMenuAnchor}
               open={Boolean(userMenuAnchor)}
               onClose={() => setUserMenuAnchor(null)}
            >
               <MenuItem
                  onClick={() => {
                     setUserMenuAnchor(null);
                     logout();
                  }}
               >
                  <ListItemIcon>
                     <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
               </MenuItem>
            </Menu>
         </Drawer>

         <Box
            component="main"
            sx={{
               flexGrow: 1,
               bgcolor: "grey.50",
               minHeight: "100vh",
               display: "flex",
               flexDirection: "column",
            }}
         >
            <Box
               sx={{
                  height: 72,
                  px: { xs: 2, md: 3 },
                  bgcolor: "background.paper",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
               }}
            >
               <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                     width: "100%",
                     maxWidth: 620,
                     height: 44,
                     px: 2,
                     borderRadius: 999,
                     bgcolor: "#F3F4F6",
                  }}
               >
                  <Search sx={{ fontSize: 20, color: "text.secondary", mr: 1 }} />
                  <InputBase
                     placeholder="Search books, authors, or categories..."
                     sx={{
                        flex: 1,
                        fontSize: "0.95rem",
                        color: "text.secondary",
                     }}
                     inputProps={{ "aria-label": "Search admin content" }}
                  />
               </Stack>

               <Stack direction="row" alignItems="center" spacing={1.5}>
                  <IconButton
                     size="small"
                     sx={{
                        color: "text.secondary",
                        width: 36,
                        height: 36,
                     }}
                  >
                     <NotificationsNone sx={{ fontSize: 21 }} />
                  </IconButton>

                  {isDashboardRoute && (
                     <Button
                        variant="contained"
                        onClick={() => navigate(ROUTES.ADMIN.BOOK_CREATE)}
                        sx={{
                           px: 2.75,
                           py: 1,
                           borderRadius: 999,
                           fontSize: "0.875rem",
                           fontWeight: 600,
                           whiteSpace: "nowrap",
                        }}
                     >
                        Upload New Book
                     </Button>
                  )}

                  {isCategoriesRoute && (
                     <Button
                        variant="contained"
                        onClick={() => setIsCategoryDialogOpen(true)}
                        sx={{
                           px: 2.75,
                           py: 1,
                           borderRadius: 999,
                           fontSize: "0.875rem",
                           fontWeight: 600,
                           whiteSpace: "nowrap",
                        }}
                     >
                        Add New Category
                     </Button>
                  )}
               </Stack>
            </Box>

            <Box sx={{ flex: 1 }}>{children}</Box>
         </Box>

         <Dialog
            open={isCategoryDialogOpen}
            onClose={handleCloseCategoryDialog}
            fullWidth
            maxWidth="sm"
         >
            <DialogTitle>Add New Category</DialogTitle>
            <DialogContent dividers>
               <Stack spacing={2} sx={{ pt: 1 }}>
                  {categoryDialogError && <Alert severity="error">{categoryDialogError}</Alert>}

                  <TextField
                     label="Category Name"
                     required
                     fullWidth
                     value={categoryForm.name}
                     onChange={(event) =>
                        setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                     }
                  />

                  <TextField
                     label="Description"
                     fullWidth
                     multiline
                     minRows={3}
                     value={categoryForm.description}
                     onChange={(event) =>
                        setCategoryForm((prev) => ({
                           ...prev,
                           description: event.target.value,
                        }))
                     }
                  />

                  <TextField
                     label="Sort Order"
                     type="number"
                     fullWidth
                     inputProps={{ min: 0 }}
                     value={categoryForm.sortOrder}
                     onChange={(event) =>
                        setCategoryForm((prev) => ({
                           ...prev,
                           sortOrder: event.target.value,
                        }))
                     }
                  />

                  <FormControl fullWidth>
                     <InputLabel id="category-status-label">Status</InputLabel>
                     <Select
                        labelId="category-status-label"
                        label="Status"
                        value={categoryForm.isActive ? "active" : "inactive"}
                        onChange={(event) =>
                           setCategoryForm((prev) => ({
                              ...prev,
                              isActive: event.target.value === "active",
                           }))
                        }
                     >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                     </Select>
                  </FormControl>
               </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
               <Button onClick={handleCloseCategoryDialog} disabled={isCategorySubmitting}>
                  Cancel
               </Button>
               <Button
                  variant="contained"
                  onClick={handleCreateCategory}
                  disabled={isCategorySubmitting}
               >
                  {isCategorySubmitting ? "Creating..." : "Create Category"}
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
}
