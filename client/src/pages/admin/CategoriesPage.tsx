import { useState, useEffect } from "react";
import {
   Container,
   Typography,
   Stack,
   Button,
   Card,
   Box,
   CircularProgress,
   Alert,
   IconButton,
   Chip,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Paper,
} from "@mui/material";
import {
   Add,
   Edit,
   Delete,
   Visibility,
   VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { listCategories, type Category } from "@/api/categories.api";

export function CategoriesPage() {
   const navigate = useNavigate();

   const [categories, setCategories] = useState<Category[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [refreshKey, setRefreshKey] = useState(0);

   useEffect(() => {
      const handleCategoryCreated = () => {
         setRefreshKey((prev) => prev + 1);
      };

      window.addEventListener("admin:category-created", handleCategoryCreated);
      return () => {
         window.removeEventListener(
            "admin:category-created",
            handleCategoryCreated
         );
      };
   }, []);

   // Fetch categories
   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const data = await listCategories();
            setCategories(data.categories || []);
         } catch (err) {
            setError("Failed to load categories");
            console.error(err);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [refreshKey]);

   if (loading) {
      return (
         <Container maxWidth="xl" sx={{ py: 6 }}>
            <Box
               sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "60vh",
               }}
            >
               <CircularProgress size={60} />
            </Box>
         </Container>
      );
   }

   if (error) {
      return (
         <Container maxWidth="xl" sx={{ py: 6 }}>
            <Alert severity="error">{error}</Alert>
         </Container>
      );
   }

   return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
         <Stack spacing={4}>
            {/* Header Section */}
            <Box>
               <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Categories
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Organize your books by topics and themes.
               </Typography>
            </Box>

            {/* Categories Table */}
            <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
               <TableContainer component={Paper} elevation={0}>
                  <Table>
                     <TableHead>
                        <TableRow sx={{ bgcolor: "grey.50" }}>
                           <TableCell sx={{ fontWeight: 600 }}>
                              Category Name
                           </TableCell>
                           <TableCell sx={{ fontWeight: 600 }}>
                              Description
                           </TableCell>
                           <TableCell sx={{ fontWeight: 600 }}>
                              Status
                           </TableCell>
                           <TableCell sx={{ fontWeight: 600 }}>
                              Sort Order
                           </TableCell>
                           <TableCell align="right" sx={{ fontWeight: 600 }}>
                              Actions
                           </TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {categories.map((category) => (
                           <TableRow
                              key={category.id}
                              sx={{
                                 "&:hover": { bgcolor: "grey.50" },
                                 cursor: "pointer",
                              }}
                              onClick={() =>
                                 navigate(`/admin/categories/${category.id}`)
                              }
                           >
                              <TableCell>
                                 <Stack direction="row" spacing={1} alignItems="center">
                                    {category.iconUrl && (
                                       <Box
                                          component="img"
                                          src={category.iconUrl}
                                          alt={category.name}
                                          sx={{
                                             width: 32,
                                             height: 32,
                                             borderRadius: 1,
                                             objectFit: "cover",
                                          }}
                                       />
                                    )}
                                    <Typography
                                       variant="body2"
                                       sx={{ fontWeight: 600 }}
                                    >
                                       {category.name}
                                    </Typography>
                                 </Stack>
                              </TableCell>
                              <TableCell>
                                 <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                       maxWidth: 400,
                                       overflow: "hidden",
                                       textOverflow: "ellipsis",
                                       whiteSpace: "nowrap",
                                    }}
                                 >
                                    {category.description || "—"}
                                 </Typography>
                              </TableCell>
                              <TableCell>
                                 <Chip
                                    label={category.isActive ? "Active" : "Inactive"}
                                    size="small"
                                    icon={
                                       category.isActive ? (
                                          <Visibility sx={{ fontSize: 16 }} />
                                       ) : (
                                          <VisibilityOff sx={{ fontSize: 16 }} />
                                       )
                                    }
                                    sx={{
                                       bgcolor: category.isActive
                                          ? "#E8F5E9"
                                          : "#ECEFF1",
                                       color: category.isActive
                                          ? "#10B981"
                                          : "#64748B",
                                       fontWeight: 600,
                                    }}
                                 />
                              </TableCell>
                              <TableCell>
                                 <Typography variant="body2">
                                    {category.sortOrder}
                                 </Typography>
                              </TableCell>
                              <TableCell align="right">
                                 <Stack
                                    direction="row"
                                    spacing={1}
                                    justifyContent="flex-end"
                                 >
                                    <IconButton
                                       size="small"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/admin/categories/${category.id}/edit`);
                                       }}
                                       sx={{
                                          color: "primary.main",
                                          "&:hover": { bgcolor: "primary.lighter" },
                                       }}
                                    >
                                       <Edit sx={{ fontSize: 18 }} />
                                    </IconButton>
                                    <IconButton
                                       size="small"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          // TODO: Implement delete confirmation
                                          console.log("Delete category:", category.id);
                                       }}
                                       sx={{
                                          color: "error.main",
                                          "&:hover": { bgcolor: "error.lighter" },
                                       }}
                                    >
                                       <Delete sx={{ fontSize: 18 }} />
                                    </IconButton>
                                 </Stack>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </TableContainer>
            </Card>

            {/* Empty State */}
            {categories.length === 0 && !loading && (
               <Card sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
                  <Box
                     sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        bgcolor: "primary.lighter",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                     }}
                  >
                     <Add sx={{ fontSize: 32, color: "primary.main" }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                     No categories yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                     Start organizing your books by creating your first category
                  </Typography>
                  <Button
                     variant="contained"
                     startIcon={<Add />}
                     onClick={() =>
                        window.dispatchEvent(
                           new Event("admin:open-category-dialog")
                        )
                     }
                  >
                     Add New Category
                  </Button>
               </Card>
            )}
         </Stack>
      </Container>
   );
}
