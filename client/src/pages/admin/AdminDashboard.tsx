import { useEffect, useMemo, useState } from "react";
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
   IconButton,
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
   Edit,
   FilterList,
   MenuBook,
   TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAdminOverview } from "@/api/analytics.api";
import { listBooks } from "@/api/books.api";
import { listCategories } from "@/api/categories.api";
import { get } from "@/api/client";
import type { Book } from "@/types/book.types";
import { API_ENDPOINTS, ROUTES } from "@/utils/constants";

interface DashboardStats {
   totalBooks: number;
   totalMinutesRead: number;
   pendingDrafts: number;
}

interface AgeGroupOption {
   id: string;
   name: string;
   minAge: number;
   maxAge: number;
}

interface AgeGroupListResponse {
   total: number;
   ageGroups: AgeGroupOption[];
}

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
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [refreshKey, setRefreshKey] = useState(0);
   const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
   const [ageGroupMap, setAgeGroupMap] = useState<Record<string, string>>({});

   const tabFilters = useMemo(() => ["all", "published", "draft"] as const, []);
   const currentFilter = tabFilters[activeTab];

   useEffect(() => {
      const handleBookCreated = () => {
         setRefreshKey((prev) => prev + 1);
      };

      window.addEventListener("admin:book-created", handleBookCreated);
      return () => {
         window.removeEventListener("admin:book-created", handleBookCreated);
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
      const fetchData = async () => {
         try {
            setLoading(true);
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
                  listBooks({ status: statusFilter }),
                  listCategories({ isActive: true }),
                  get<AgeGroupListResponse>(API_ENDPOINTS.AGE_GROUPS.PUBLIC),
               ]);

            const pendingDrafts =
               analyticsData.overview.totalBooks -
               analyticsData.overview.publishedBooks;

            setStats({
               totalBooks: analyticsData.overview.totalBooks,
               totalMinutesRead: analyticsData.overview.totalMinutesRead,
               pendingDrafts,
            });

            setBooks(booksData.books || []);

            setCategoryMap(
               (categoriesData.categories || []).reduce(
                  (acc, category) => {
                     acc[category.id] = category.name;
                     return acc;
                  },
                  {} as Record<string, string>
               )
            );

            setAgeGroupMap(
               (ageGroupsData.ageGroups || []).reduce(
                  (acc, group) => {
                     acc[group.id] = group.name;
                     return acc;
                  },
                  {} as Record<string, string>
               )
            );
         } catch (err) {
            setError("Failed to load dashboard data");
            console.error(err);
         } finally {
            setLoading(false);
         }
      };

      void fetchData();
   }, [currentFilter, refreshKey]);

   if (loading) {
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
                  icon={
                     <MenuBook
                        sx={{ fontSize: 22, color: theme.palette.primary.main }}
                     />
                  }
                  iconBg={alpha(theme.palette.primary.main, 0.12)}
                  helper={
                     <Stack direction="row" alignItems="center" spacing={0.75}>
                        <TrendingUp
                           sx={{ fontSize: 16, color: "success.main" }}
                        />
                        <Typography
                           variant="caption"
                           sx={{ color: "success.main", fontWeight: 700 }}
                        >
                           +12% from last month
                        </Typography>
                     </Stack>
                  }
               />

               <StatCard
                  label="Total Minutes Read"
                  value={(stats?.totalMinutesRead ?? 0).toLocaleString()}
                  icon={
                     <AutoStories
                        sx={{ fontSize: 22, color: theme.palette.success.main }}
                     />
                  }
                  iconBg={alpha(theme.palette.success.main, 0.12)}
                  helper={
                     <Stack direction="row" alignItems="center" spacing={0.75}>
                        <TrendingUp
                           sx={{ fontSize: 16, color: "success.main" }}
                        />
                        <Typography
                           variant="caption"
                           sx={{ color: "success.main", fontWeight: 700 }}
                        >
                           +5% increase
                        </Typography>
                     </Stack>
                  }
               />

               <StatCard
                  label="Pending Drafts"
                  value={(stats?.pendingDrafts ?? 0).toLocaleString()}
                  icon={
                     <Description
                        sx={{ fontSize: 22, color: theme.palette.warning.main }}
                     />
                  }
                  iconBg={alpha(theme.palette.warning.main, 0.14)}
                  helper={
                     <Typography
                        variant="caption"
                        sx={{ color: "warning.main", fontWeight: 700 }}
                     >
                        Requires review
                     </Typography>
                  }
               />
            </Stack>

            <Stack
               direction="row"
               alignItems="center"
               justifyContent="space-between"
               sx={{ pt: 1 }}
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

               <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                     variant="body2"
                     color="text.secondary"
                     sx={{ fontWeight: 600 }}
                  >
                     All Age Groups
                  </Typography>
                  <IconButton
                     size="small"
                     sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        "&:hover": {
                           bgcolor: alpha(theme.palette.primary.main, 0.06),
                        },
                     }}
                  >
                     <FilterList fontSize="small" />
                  </IconButton>
               </Stack>
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

                           <IconButton
                              size="small"
                              sx={{
                                 position: "absolute",
                                 top: 10,
                                 right: 10,
                                 bgcolor: alpha(theme.palette.common.white, 0.92),
                                 border: "1px solid",
                                 borderColor: alpha(theme.palette.divider, 0.8),
                                 "&:hover": {
                                    bgcolor: theme.palette.common.white,
                                 },
                              }}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 navigate(ROUTES.ADMIN.BOOK_EDIT(book.id));
                              }}
                           >
                              <Edit sx={{ fontSize: 18, color: "text.primary" }} />
                           </IconButton>
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

            {books.length === 0 && !loading && (
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
                     <MenuBook
                        sx={{ fontSize: 34, color: theme.palette.primary.main }}
                     />
                  </Box>

                  <Typography
                     variant="h6"
                     sx={{ fontWeight: 800 }}
                     gutterBottom
                  >
                     No books found
                  </Typography>
                  <Typography
                     variant="body2"
                     color="text.secondary"
                     sx={{ mb: 3 }}
                  >
                     {currentFilter === "all"
                        ? "Start by uploading your first book."
                        : `No ${currentFilter} books available.`}
                  </Typography>

                  <Button
                     variant="contained"
                     startIcon={<Add />}
                     onClick={() => navigate(ROUTES.ADMIN.BOOK_CREATE)}
                  >
                     Upload New Book
                  </Button>
               </Card>
            )}
         </Stack>
      </Container>
   );
}
