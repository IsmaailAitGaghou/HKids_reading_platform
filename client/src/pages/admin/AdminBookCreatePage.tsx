import { useEffect, useState } from "react";
import {
   Alert,
   Box,
   Button,
   Card,
   CardContent,
   CircularProgress,
   Container,
   FormControl,
   InputLabel,
   MenuItem,
   Select,
   Stack,
   TextField,
   Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createBook } from "@/api/books.api";
import { listCategories } from "@/api/categories.api";
import { get } from "@/api/client";
import { API_ENDPOINTS, ROUTES } from "@/utils/constants";

const BOOK_CREATED_EVENT = "admin:book-created";

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

export function AdminBookCreatePage() {
   const navigate = useNavigate();

   const [loadingMeta, setLoadingMeta] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState("");

   const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
   const [ageGroups, setAgeGroups] = useState<AgeGroupOption[]>([]);

   const [form, setForm] = useState({
      title: "",
      summary: "",
      coverImageUrl: "",
      ageGroupId: "",
      categoryIds: [] as string[],
      tags: "",
      visibility: "private" as "private" | "public",
      firstPageNumber: "1",
      firstPageTitle: "",
      firstPageText: "",
      firstPageImageUrl: "",
      firstPageNarrationUrl: "",
   });

   useEffect(() => {
      let mounted = true;

      const loadMetadata = async () => {
         try {
            setLoadingMeta(true);
            const [categoriesData, ageGroupsData] = await Promise.all([
               listCategories({ isActive: true }),
               get<AgeGroupListResponse>(API_ENDPOINTS.AGE_GROUPS.PUBLIC),
            ]);

            if (!mounted) return;

            setCategories(
               (categoriesData.categories || []).map((item) => ({
                  id: item.id,
                  name: item.name,
               }))
            );
            setAgeGroups(ageGroupsData.ageGroups || []);
         } catch {
            if (!mounted) return;
            setError("Failed to load categories and age groups.");
         } finally {
            if (mounted) {
               setLoadingMeta(false);
            }
         }
      };

      void loadMetadata();

      return () => {
         mounted = false;
      };
   }, []);

   const getErrorMessage = (err: unknown, fallback: string) => {
      if (
         typeof err === "object" &&
         err !== null &&
         "details" in err &&
         typeof err.details === "object" &&
         err.details !== null &&
         "fieldErrors" in err.details &&
         typeof err.details.fieldErrors === "object" &&
         err.details.fieldErrors !== null
      ) {
         const fieldErrors = err.details.fieldErrors as Record<
            string,
            string[] | undefined
         >;
         const firstError = Object.values(fieldErrors).find(
            (messages) => Array.isArray(messages) && messages.length > 0
         );
         if (firstError?.[0]) {
            return firstError[0];
         }
      }

      if (
         typeof err === "object" &&
         err !== null &&
         "message" in err &&
         typeof err.message === "string"
      ) {
         return err.message;
      }

      return fallback;
   };

   const isValidUrl = (value: string) => {
      if (!value.trim()) return true;
      try {
         new URL(value);
         return true;
      } catch {
         return false;
      }
   };

   const handleSubmit = async () => {
      if (
         !form.title.trim() ||
         !form.ageGroupId.trim() ||
         form.categoryIds.length === 0 ||
         !form.firstPageText.trim()
      ) {
         setError(
            "Title, age group, at least one category, and first page text are required."
         );
         return;
      }

      if (
         !isValidUrl(form.coverImageUrl) ||
         !isValidUrl(form.firstPageImageUrl) ||
         !isValidUrl(form.firstPageNarrationUrl)
      ) {
         setError("Please provide valid URLs for image/narration fields.");
         return;
      }

      try {
         setIsSubmitting(true);
         setError("");

         await createBook({
            title: form.title.trim(),
            summary: form.summary.trim() || undefined,
            coverImageUrl: form.coverImageUrl.trim() || undefined,
            ageGroupId: form.ageGroupId,
            categoryIds: form.categoryIds,
            pages: [
               {
                  pageNumber: Number(form.firstPageNumber) || 1,
                  title: form.firstPageTitle.trim() || undefined,
                  text: form.firstPageText.trim(),
                  imageUrl: form.firstPageImageUrl.trim() || undefined,
                  narrationUrl: form.firstPageNarrationUrl.trim() || undefined,
               },
            ],
            tags: form.tags
               .split(",")
               .map((value) => value.trim())
               .filter(Boolean),
            visibility: form.visibility,
         });

         window.dispatchEvent(new Event(BOOK_CREATED_EVENT));
         navigate(ROUTES.ADMIN.DASHBOARD);
      } catch (err) {
         setError(getErrorMessage(err, "Failed to create book. Please try again."));
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <Container maxWidth="md" sx={{ py: 4 }}>
         <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
               <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
               >
                  Back
               </Button>
            </Stack>

            <Box>
               <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Upload New Book
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Create a book with metadata and at least one story page.
               </Typography>
            </Box>

            <Card sx={{ borderRadius: 3 }}>
               <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack spacing={2}>
                     {error && <Alert severity="error">{error}</Alert>}

                     {loadingMeta ? (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
                           <CircularProgress size={20} />
                           <Typography variant="body2" color="text.secondary">
                              Loading categories and age groups...
                           </Typography>
                        </Stack>
                     ) : (
                        <>
                           <TextField
                              label="Title"
                              required
                              fullWidth
                              value={form.title}
                              onChange={(event) =>
                                 setForm((prev) => ({ ...prev, title: event.target.value }))
                              }
                           />

                           <TextField
                              label="Summary"
                              fullWidth
                              multiline
                              minRows={3}
                              value={form.summary}
                              onChange={(event) =>
                                 setForm((prev) => ({ ...prev, summary: event.target.value }))
                              }
                           />

                           <TextField
                              label="Cover Image URL"
                              fullWidth
                              value={form.coverImageUrl}
                              onChange={(event) =>
                                 setForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))
                              }
                           />

                           <FormControl fullWidth required>
                              <InputLabel id="book-age-group-label">Age Group</InputLabel>
                              <Select
                                 labelId="book-age-group-label"
                                 value={form.ageGroupId}
                                 label="Age Group"
                                 onChange={(event) =>
                                    setForm((prev) => ({
                                       ...prev,
                                       ageGroupId: event.target.value,
                                    }))
                                 }
                              >
                                 {ageGroups.map((ageGroup) => (
                                    <MenuItem key={ageGroup.id} value={ageGroup.id}>
                                       {ageGroup.name} ({ageGroup.minAge}-{ageGroup.maxAge})
                                    </MenuItem>
                                 ))}
                              </Select>
                           </FormControl>

                           <FormControl fullWidth required>
                              <InputLabel id="book-categories-label">Categories</InputLabel>
                              <Select
                                 labelId="book-categories-label"
                                 multiple
                                 value={form.categoryIds}
                                 onChange={(event) => {
                                    const value = event.target.value;
                                    setForm((prev) => ({
                                       ...prev,
                                       categoryIds: typeof value === "string" ? value.split(",") : value,
                                    }));
                                 }}
                                 renderValue={(selected) =>
                                    selected
                                       .map(
                                          (id) =>
                                             categories.find((item) => item.id === id)?.name || id
                                       )
                                       .join(", ")
                                 }
                              >
                                 {categories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                       {category.name}
                                    </MenuItem>
                                 ))}
                              </Select>
                           </FormControl>

                           <TextField
                              label="Tags (comma separated)"
                              fullWidth
                              value={form.tags}
                              onChange={(event) =>
                                 setForm((prev) => ({ ...prev, tags: event.target.value }))
                              }
                           />

                           <FormControl fullWidth required>
                              <InputLabel id="book-visibility-label">Visibility</InputLabel>
                              <Select
                                 labelId="book-visibility-label"
                                 label="Visibility"
                                 value={form.visibility}
                                 onChange={(event) =>
                                    setForm((prev) => ({
                                       ...prev,
                                       visibility: event.target.value as "private" | "public",
                                    }))
                                 }
                              >
                                 <MenuItem value="private">Private</MenuItem>
                                 <MenuItem value="public">Public</MenuItem>
                              </Select>
                           </FormControl>

                           <Typography variant="subtitle2" sx={{ fontWeight: 700, pt: 1 }}>
                              First Page (Required)
                           </Typography>

                           <TextField
                              label="Page Number"
                              type="number"
                              fullWidth
                              inputProps={{ min: 1 }}
                              value={form.firstPageNumber}
                              onChange={(event) =>
                                 setForm((prev) => ({
                                    ...prev,
                                    firstPageNumber: event.target.value,
                                 }))
                              }
                           />

                           <TextField
                              label="Page Title"
                              fullWidth
                              value={form.firstPageTitle}
                              onChange={(event) =>
                                 setForm((prev) => ({
                                    ...prev,
                                    firstPageTitle: event.target.value,
                                 }))
                              }
                           />

                           <TextField
                              label="Page Text"
                              required
                              fullWidth
                              multiline
                              minRows={3}
                              value={form.firstPageText}
                              onChange={(event) =>
                                 setForm((prev) => ({
                                    ...prev,
                                    firstPageText: event.target.value,
                                 }))
                              }
                           />

                           <TextField
                              label="Page Image URL"
                              fullWidth
                              value={form.firstPageImageUrl}
                              onChange={(event) =>
                                 setForm((prev) => ({
                                    ...prev,
                                    firstPageImageUrl: event.target.value,
                                 }))
                              }
                           />

                           <TextField
                              label="Page Narration URL"
                              fullWidth
                              value={form.firstPageNarrationUrl}
                              onChange={(event) =>
                                 setForm((prev) => ({
                                    ...prev,
                                    firstPageNarrationUrl: event.target.value,
                                 }))
                              }
                           />
                        </>
                     )}

                     <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
                        <Button
                           onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
                           disabled={isSubmitting}
                        >
                           Cancel
                        </Button>
                        <Button
                           variant="contained"
                           onClick={handleSubmit}
                           disabled={isSubmitting || loadingMeta}
                        >
                           {isSubmitting ? "Creating..." : "Create Book"}
                        </Button>
                     </Stack>
                  </Stack>
               </CardContent>
            </Card>
         </Stack>
      </Container>
   );
}
