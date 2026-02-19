import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import {
   Alert,
   Box,
   Button,
   Card,
   CardActionArea,
   CardContent,
   CardMedia,
   Chip,
   CircularProgress,
   Container,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormControl,
   IconButton,
   InputLabel,
   Menu,
   MenuItem,
   Select,
   Snackbar,
   Stack,
   Tab,
   Tabs,
   Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
   Add,
   AutoStories,
   Category as CategoryIcon,
   Description,
   MenuBook,
   MoreVert,
   TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAdminOverview } from "@/api/analytics.api";
import { listAgeGroups } from "@/api/ageGroups.api";
import { deleteBook, listBooks, publishBook, unpublishBook } from "@/api/books.api";
import { listCategories } from "@/api/categories.api";
import type { Book } from "@/types/book.types";
import { ROUTES } from "@/utils/constants";

interface DashboardStats {
   totalBooks: number;
   totalMinutesRead: number;
   pendingDrafts: number;
}

type SnackbarSeverity = "success" | "error" | "info" | "warning";

function StatCard({
   label,
   value,
   helper,
   icon,
   iconBg,
}: {
   label: string;
   value: string;
   helper?: React.ReactNode;
   icon: React.ReactNode;
   iconBg: string;
}) {
   return (
      <Card
         sx={{
            flex: 1,
            p: 3,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 1,
            transition: "transform 200ms ease, box-shadow 200ms ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
         }}
      >
         <Stack spacing={1.5}>
            <Stack
               direction="row"
               alignItems="center"
               justifyContent="space-between"
            >
               <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
               >
                  {label}
               </Typography>

               <Box
                  sx={{
                     width: 40,
                     height: 40,
                     borderRadius: 2,
                     display: "grid",
                     placeItems: "center",
                     bgcolor: iconBg,
                  }}
               >
                  {icon}
               </Box>
            </Stack>

            <Typography
               variant="h3"
               sx={{ fontWeight: 800, fontSize: "2rem", lineHeight: 1.1 }}
            >
               {value}
            </Typography>

            {helper}
         </Stack>
      </Card>
   );
}

export function AdminDashboard() {
   const theme = useTheme();
   const navigate = useNavigate();

   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [books, setBooks] = useState<Book[]>([]);
   const [activeTab, setActiveTab] = useState(0);
   const [error, setError] = useState<string | null>(null);
   const [refreshKey, setRefreshKey] = useState(0);

   const [initialLoading, setInitialLoading] = useState(true);
   const [isFetching, setIsFetching] = useState(false);
   const firstLoadRef = useRef(true);

   const [selectedAgeGroupId, setSelectedAgeGroupId] = useState("");
   const [selectedCategoryId, setSelectedCategoryId] = useState("");

   const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
   const [ageGroupMap, setAgeGroupMap] = useState<Record<string, string>>({});

   const [ageGroupOptions, setAgeGroupOptions] = useState<Array<{ id: string; name: string }>>([]);
   const [categoryOptions, setCategoryOptions] = useState<Array<{ id: string; name: string }>>([]);

   const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);
   const [statusUpdatingBookId, setStatusUpdatingBookId] = useState<string | null>(
      null
   );
   const [bookActionsAnchor, setBookActionsAnchor] = useState<HTMLElement | null>(
      null
   );
   const [bookActionsTarget, setBookActionsTarget] = useState<Book | null>(null);
   const [bookForStatusDialog, setBookForStatusDialog] = useState<Book | null>(null);

   const [snackbar, setSnackbar] = useState<{
      open: boolean;
      severity: SnackbarSeverity;
      message: string;
   }>({
      open: false,
      severity: "success",
      message: "",
   });

   const tabFilters = useMemo(() => ["all", "published", "draft"] as const, []);
   const currentFilter = tabFilters[activeTab];

   useEffect(() => {
      const handleBookChanged = () => {
         setRefreshKey((prev) => prev + 1);
      };

      window.addEventListener("admin:book-created", handleBookChanged);
      window.addEventListener("admin:book-updated", handleBookChanged);

      return () => {
         window.removeEventListener("admin:book-created", handleBookChanged);
         window.removeEventListener("admin:book-updated", handleBookChanged);
      };
   }, []);

   const statusChipSx = (status: string) => {
      const normalizedStatus = status.toLowerCase();
      const isPublished = normalizedStatus === "published";
      const isDraft = normalizedStatus === "draft";

      const bg = isPublished
         ? theme.palette.success.main
         : isDraft
         ? theme.palette.warning.main
         : theme.palette.info.main;

      return {
         position: "absolute",
         top: 12,
         left: 12,
         bgcolor: bg,
         color: theme.palette.common.white,
         fontWeight: 700,
         fontSize: "0.72rem",
         borderRadius: 999,
         boxShadow: 2,
      } as const;
   };

   const getAgeGroupLabel = (book: Book) => {
      const ageGroupId = book.ageGroupId || book.ageGroupIds?.[0];
      if (!ageGroupId) return "All Ages";
      return ageGroupMap[ageGroupId] || "All Ages";
   };

   const getCategoryLabel = (book: Book) => {
      if (!book.categoryIds?.length) return "Uncategorized";

      const names = book.categoryIds
         .map((id) => categoryMap[id])
         .filter(Boolean) as string[];

      if (!names.length) return "Uncategorized";

      const visible = names.slice(0, 2);
      const extra = names.length - visible.length;
      return extra > 0 ? `${visible.join(", ")} +${extra}` : visible.join(", ");
   };

   useEffect(() => {
      let mounted = true;

      const fetchData = async () => {
         try {
            if (firstLoadRef.current) {
               setInitialLoading(true);
            } else {
               setIsFetching(true);
            }

            setError(null);

            const statusFilter =
               currentFilter === "published"
                  ? "published"
                  : currentFilter === "draft"
                  ? "draft"
                  : undefined;

            const [analyticsData, booksData, categoriesData, ageGroupsData] =
               await Promise.all([
                  getAdminOverview(),
                  listBooks({
                     status: statusFilter,
                     ageGroupId: selectedAgeGroupId || undefined,
                     categoryId: selectedCategoryId || undefined,
                  }),
                  listCategories({ isActive: true }),
                  listAgeGroups(),
               ]);

            if (!mounted) return;

            const pendingDrafts =
               analyticsData.overview.totalBooks -
               analyticsData.overview.publishedBooks;

            setStats({
               totalBooks: analyticsData.overview.totalBooks,
               totalMinutesRead: analyticsData.overview.totalMinutesRead,
               pendingDrafts,
            });

            setBooks(booksData.books || []);

            const nextCategoryMap = (categoriesData.categories || []).reduce(
               (acc, category) => {
                  acc[category.id] = category.name;
                  return acc;
               },
               {} as Record<string, string>
            );
            setCategoryMap(nextCategoryMap);
            setCategoryOptions(
               Object.entries(nextCategoryMap).map(([id, name]) => ({ id, name }))
            );

            const nextAgeGroupMap = (ageGroupsData.ageGroups || []).reduce(
               (acc, group) => {
                  acc[group.id] = group.name;
                  return acc;
               },
               {} as Record<string, string>
            );
            setAgeGroupMap(nextAgeGroupMap);
            setAgeGroupOptions(
               (ageGroupsData.ageGroups || []).map((group) => ({
                  id: group.id,
                  name: group.name,
               }))
            );
         } catch (err) {
            if (!mounted) return;
            setError("Failed to load dashboard data");
            console.error(err);
         } finally {
            if (mounted) {
               setInitialLoading(false);
               setIsFetching(false);
               firstLoadRef.current = false;
            }
         }
      };

      void fetchData();

      return () => {
         mounted = false;
      };
   }, [currentFilter, refreshKey, selectedAgeGroupId, selectedCategoryId]);

   const handleDeleteBook = async () => {
      if (!bookToDelete) return;

      const previousBooks = books;
      const targetId = bookToDelete.id;

      setBooks((prev) => prev.filter((book) => book.id !== targetId));
      setIsDeleting(true);
      setBookToDelete(null);

      try {
         await deleteBook(targetId);
         setSnackbar({
            open: true,
            severity: "success",
            message: "Book deleted successfully.",
         });
         setRefreshKey((prev) => prev + 1);
      } catch (err) {
         setBooks(previousBooks);
         setSnackbar({
            open: true,
            severity: "error",
            message:
               typeof err === "object" &&
               err !== null &&
               "message" in err &&
               typeof err.message === "string"
                  ? err.message
                  : "Failed to delete book.",
         });
      } finally {
         setIsDeleting(false);
      }
   };

   const handleStatusChange = async (book: Book, nextStatus: "draft" | "published") => {
      const currentStatus = (book.status || "").toLowerCase();
      if (currentStatus === nextStatus) {
         setBookForStatusDialog(null);
         return;
      }

      const previousBooks = books;
      setStatusUpdatingBookId(book.id);

      setBooks((prev) =>
         prev.map((item) =>
            item.id === book.id ? { ...item, status: nextStatus } : item
         )
      );

      try {
         if (nextStatus === "published") {
            await publishBook(book.id);
         } else {
            await unpublishBook(book.id);
         }

         setRefreshKey((prev) => prev + 1);
         setSnackbar({
            open: true,
            severity: "success",
            message: `Book moved to ${nextStatus}.`,
         });
         setBookForStatusDialog(null);
      } catch (err) {
         setBooks(previousBooks);
         setSnackbar({
            open: true,
            severity: "error",
            message:
               typeof err === "object" &&
               err !== null &&
               "message" in err &&
               typeof err.message === "string"
                  ? err.message
                  : "Failed to update book status.",
         });
      } finally {
         setStatusUpdatingBookId(null);
      }
   };

   const closeBookActionsMenu = () => {
      setBookActionsAnchor(null);
      setBookActionsTarget(null);
   };

   const openBookActionsMenu = (
      event: MouseEvent<HTMLButtonElement>,
      book: Book
   ) => {
      event.stopPropagation();
      setBookActionsAnchor(event.currentTarget);
      setBookActionsTarget(book);
   };

   if (initialLoading) {
      return (
         <Container maxWidth="xl" sx={{ py: 6 }}>
            <Box
               sx={{
                  display: "grid",
                  placeItems: "center",
                  minHeight: "60vh",
               }}
            >
               <CircularProgress size={56} />
            </Box>
         </Container>
      );
   }

   if (error) {
      return (
         <Container maxWidth="xl" sx={{ py: 6 }}>
            <Alert severity="error" sx={{ borderRadius: 3 }}>
               {error}
            </Alert>
         </Container>
      );
   }

   return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
         <Stack spacing={4}>
            <Stack
               direction={{ xs: "column", sm: "row" }}
               alignItems={{ xs: "flex-start", sm: "center" }}
               justifyContent="space-between"
               spacing={2}
            >
               <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                     Book Library
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Review and manage your curated reading collection.
                  </Typography>
               </Box>
            </Stack>

            <Stack
               direction={{ xs: "column", sm: "row" }}
               spacing={3}
               sx={{ width: "100%" }}
            >
               <StatCard
                  label="Total Books"
                  value={(stats?.totalBooks ?? 0).toLocaleString()}
                  icon={<MenuBook sx={{ fontSize: 22, color: theme.palette.primary.main }} />}
                  iconBg={alpha(theme.palette.primary.main, 0.12)}
                  helper={
                     <Stack direction="row" alignItems="center" spacing={0.75}>
                        <TrendingUp sx={{ fontSize: 16, color: "success.main" }} />
                        <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                           +12% from last month
                        </Typography>
                     </Stack>
                  }
               />

               <StatCard
                  label="Total Minutes Read"
                  value={(stats?.totalMinutesRead ?? 0).toLocaleString()}
                  icon={<AutoStories sx={{ fontSize: 22, color: theme.palette.success.main }} />}
                  iconBg={alpha(theme.palette.success.main, 0.12)}
                  helper={
                     <Stack direction="row" alignItems="center" spacing={0.75}>
                        <TrendingUp sx={{ fontSize: 16, color: "success.main" }} />
                        <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                           +5% increase
                        </Typography>
                     </Stack>
                  }
               />

               <StatCard
                  label="Pending Drafts"
                  value={(stats?.pendingDrafts ?? 0).toLocaleString()}
                  icon={<Description sx={{ fontSize: 22, color: theme.palette.warning.main }} />}
                  iconBg={alpha(theme.palette.warning.main, 0.14)}
                  helper={
                     <Typography variant="caption" sx={{ color: "warning.main", fontWeight: 700 }}>
                        Requires review
                     </Typography>
                  }
               />
            </Stack>

            <Stack spacing={1.5}>
               <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "stretch", md: "center" }}
                  justifyContent="space-between"
                  sx={{ pt: 1 }}
                  spacing={1.5}
               >
                  <Tabs
                     value={activeTab}
                     onChange={(_, v) => setActiveTab(v)}
                     sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        borderRadius: 999,
                        p: 0.5,
                        minHeight: 44,
                        "& .MuiTabs-indicator": { display: "none" },
                        "& .MuiTab-root": {
                           minHeight: 38,
                           px: 2.5,
                           borderRadius: 999,
                           fontWeight: 600,
                           fontSize: "0.95rem",
                        },
                        "& .MuiTab-root.Mui-selected": {
                           bgcolor: theme.palette.background.paper,
                           boxShadow: 1,
                           color: theme.palette.primary.main,
                        },
                     }}
                  >
                     <Tab label="All Books" />
                     <Tab label="Published" />
                     <Tab label="Drafts" />
                  </Tabs>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                     <FormControl size="small" sx={{ minWidth: 170 }}>
                        <InputLabel id="age-group-filter-label">Age Group</InputLabel>
                        <Select
                           labelId="age-group-filter-label"
                           label="Age Group"
                           value={selectedAgeGroupId}
                           onChange={(event) => setSelectedAgeGroupId(event.target.value)}
                        >
                           <MenuItem value="">All Age Groups</MenuItem>
                           {ageGroupOptions.map((group) => (
                              <MenuItem key={group.id} value={group.id}>
                                 {group.name}
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>

                     <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel id="category-filter-label">Category</InputLabel>
                        <Select
                           labelId="category-filter-label"
                           label="Category"
                           value={selectedCategoryId}
                           onChange={(event) => setSelectedCategoryId(event.target.value)}
                        >
                           <MenuItem value="">All Categories</MenuItem>
                           {categoryOptions.map((category) => (
                              <MenuItem key={category.id} value={category.id}>
                                 {category.name}
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>

                     <Button
                        type="button"
                        onClick={() => {
                           setSelectedAgeGroupId("");
                           setSelectedCategoryId("");
                        }}
                     >
                        Clear
                     </Button>
                  </Stack>
               </Stack>

               {isFetching && (
                  <Stack direction="row" spacing={1} alignItems="center">
                     <CircularProgress size={16} />
                     <Typography variant="caption" color="text.secondary">
                        Updating books...
                     </Typography>
                  </Stack>
               )}
            </Stack>

            <Box
               sx={{
                  display: "grid",
                  gridTemplateColumns: {
                     xs: "1fr",
                     sm: "repeat(2, 1fr)",
                     md: "repeat(3, 1fr)",
                     lg: "repeat(4, 1fr)",
                  },
                  gap: 3,
               }}
            >
               {books.map((book) => (
                  <Card
                     key={book.id}
                     sx={{
                        overflow: "hidden",
                        cursor: "pointer",
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: 1,
                        height: 460,
                        display: "flex",
                        transition: "transform 200ms ease, box-shadow 200ms ease",
                        "&:hover": {
                           transform: "translateY(-3px)",
                           boxShadow: 4,
                        },
                     }}
                  >
                     <CardActionArea
                        sx={{
                           display: "flex",
                           flexDirection: "column",
                           alignItems: "stretch",
                           height: "100%",
                        }}
                        onClick={() => navigate(ROUTES.ADMIN.BOOK_EDIT(book.id))}
                     >
                        <Box
                           sx={{
                              position: "relative",
                              height: 280,
                              width: "100%",
                              overflow: "hidden",
                              flexShrink: 0,
                           }}
                        >
                           <CardMedia
                              component="img"
                              image={book.coverImageUrl || "/placeholder-book.png"}
                              alt={book.title}
                              sx={{ height: "100%", width: "100%", objectFit: "cover" }}
                           />

                           {book.status && (
                              <Chip
                                 label={book.status}
                                 size="small"
                                 sx={statusChipSx(book.status)}
                              />
                           )}

                           <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{ position: "absolute", top: 10, right: 10 }}
                           >
                              <IconButton
                                 size="small"
                                 sx={{
                                    bgcolor: alpha(theme.palette.common.white, 0.92),
                                    border: "1px solid",
                                    borderColor: alpha(theme.palette.divider, 0.8),
                                    "&:hover": { bgcolor: theme.palette.common.white },
                                 }}
                                 onClick={(event) => openBookActionsMenu(event, book)}
                              >
                                 <MoreVert sx={{ fontSize: 18, color: "text.primary" }} />
                              </IconButton>
                           </Stack>
                        </Box>

                        <CardContent
                           sx={{
                              p: 2,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              gap: 1.25,
                              flexGrow: 1,
                              width: "100%",
                           }}
                        >
                           <Typography
                              variant="subtitle1"
                              sx={{
                                 fontWeight: 700,
                                 minHeight: 52,
                                 overflow: "hidden",
                                 textOverflow: "ellipsis",
                                 display: "-webkit-box",
                                 WebkitLineClamp: 2,
                                 WebkitBoxOrient: "vertical",
                              }}
                           >
                              {book.title}
                           </Typography>

                           <Stack spacing={0.75}>
                              <Typography
                                 variant="caption"
                                 color="text.secondary"
                                 sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.75,
                                    fontWeight: 600,
                                 }}
                              >
                                 <MenuBook sx={{ fontSize: 14 }} />
                                 Ages: {getAgeGroupLabel(book)}
                              </Typography>

                              <Typography
                                 variant="caption"
                                 color="text.secondary"
                                 sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.75,
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                 }}
                              >
                                 <CategoryIcon sx={{ fontSize: 14 }} />
                                 Category: {getCategoryLabel(book)}
                              </Typography>

                              <Typography
                                 variant="caption"
                                 color="text.disabled"
                                 sx={{ fontWeight: 600 }}
                              >
                                 ID: {book.id.slice(0, 6)}
                              </Typography>
                           </Stack>
                        </CardContent>
                     </CardActionArea>
                  </Card>
               ))}
            </Box>

            {books.length === 0 && !initialLoading && (
               <Card
                  sx={{
                     p: { xs: 4, sm: 6 },
                     textAlign: "center",
                     borderRadius: 3,
                     border: "1px dashed",
                     borderColor: alpha(theme.palette.primary.main, 0.35),
                     bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
               >
                  <Box
                     sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 999,
                        mx: "auto",
                        mb: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                     }}
                  >
                     <MenuBook sx={{ fontSize: 34, color: theme.palette.primary.main }} />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>
                     No books found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                     {currentFilter === "all"
                        ? "Start by uploading your first book."
                        : `No ${currentFilter} books available.`}
                  </Typography>

                  <Button
                     variant="contained"
                     startIcon={<Add />}
                     onClick={() => navigate(ROUTES.ADMIN.BOOK_CREATE)}
                     type="button"
                  >
                     Upload New Book
                  </Button>
               </Card>
            )}
         </Stack>

         <Dialog open={Boolean(bookToDelete)} onClose={() => setBookToDelete(null)}>
            <DialogTitle>Delete Book</DialogTitle>
            <DialogContent>
               <Typography variant="body2" color="text.secondary">
                  {`Are you sure you want to delete "${bookToDelete?.title || "this book"}"?`}
               </Typography>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setBookToDelete(null)} disabled={isDeleting} type="button">
                  Cancel
               </Button>
               <Button
                  color="error"
                  variant="contained"
                  onClick={handleDeleteBook}
                  disabled={isDeleting}
                  type="button"
               >
                  {isDeleting ? "Deleting..." : "Delete"}
               </Button>
            </DialogActions>
         </Dialog>

         <Menu
            anchorEl={bookActionsAnchor}
            open={Boolean(bookActionsAnchor && bookActionsTarget)}
            onClose={closeBookActionsMenu}
            onClick={(event) => event.stopPropagation()}
         >
            <MenuItem
               onClick={() => {
                  if (bookActionsTarget) {
                     navigate(ROUTES.ADMIN.BOOK_EDIT(bookActionsTarget.id));
                  }
                  closeBookActionsMenu();
               }}
            >
               Edit
            </MenuItem>
            <MenuItem
               onClick={() => {
                  if (bookActionsTarget) {
                     setBookForStatusDialog(bookActionsTarget);
                  }
                  closeBookActionsMenu();
               }}
            >
               Change Status
            </MenuItem>
            <MenuItem
               onClick={() => {
                  if (bookActionsTarget) {
                     setBookToDelete(bookActionsTarget);
                  }
                  closeBookActionsMenu();
               }}
               sx={{ color: "error.main" }}
            >
               Delete
            </MenuItem>
         </Menu>

         <Dialog
            open={Boolean(bookForStatusDialog)}
            onClose={() =>
               statusUpdatingBookId ? undefined : setBookForStatusDialog(null)
            }
         >
            <DialogTitle>Change Book Status</DialogTitle>
            <DialogContent>
               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select the status for "{bookForStatusDialog?.title || "this book"}".
               </Typography>
               <Stack direction="row" spacing={1.5}>
                  <Button
                     type="button"
                     variant={
                        String(bookForStatusDialog?.status).toLowerCase() === "draft"
                           ? "contained"
                           : "outlined"
                     }
                     disabled={
                        !bookForStatusDialog ||
                        statusUpdatingBookId === bookForStatusDialog.id
                     }
                     onClick={() =>
                        bookForStatusDialog &&
                        handleStatusChange(bookForStatusDialog, "draft")
                     }
                     sx={{ minWidth: 110, textTransform: "none" }}
                  >
                     {statusUpdatingBookId === bookForStatusDialog?.id
                        ? "Updating..."
                        : "Draft"}
                  </Button>
                  <Button
                     type="button"
                     variant={
                        String(bookForStatusDialog?.status).toLowerCase() === "published"
                           ? "contained"
                           : "outlined"
                     }
                     disabled={
                        !bookForStatusDialog ||
                        statusUpdatingBookId === bookForStatusDialog.id
                     }
                     onClick={() =>
                        bookForStatusDialog &&
                        handleStatusChange(bookForStatusDialog, "published")
                     }
                     sx={{ minWidth: 120, textTransform: "none" }}
                  >
                     {statusUpdatingBookId === bookForStatusDialog?.id
                        ? "Updating..."
                        : "Published"}
                  </Button>
               </Stack>
            </DialogContent>
            <DialogActions>
               <Button
                  type="button"
                  onClick={() => setBookForStatusDialog(null)}
                  disabled={Boolean(statusUpdatingBookId)}
               >
                  Close
               </Button>
            </DialogActions>
         </Dialog>

         <Snackbar
            open={snackbar.open}
            autoHideDuration={3200}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
         >
            <Alert
               severity={snackbar.severity}
               variant="filled"
               onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
               sx={{ width: "100%" }}
            >
               {snackbar.message}
            </Alert>
         </Snackbar>
      </Container>
   );
}
