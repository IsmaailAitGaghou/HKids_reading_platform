import { useCallback, useEffect, useMemo, useState } from "react";
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
   Snackbar,
   Stack,
   TextField,
   Typography,
} from "@mui/material";
import { Add, ArrowBack, DeleteOutline, PictureAsPdf } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { createBook, getBookById, updateBook } from "@/api/books.api";
import { listCategories } from "@/api/categories.api";
import { listAgeGroups } from "@/api/ageGroups.api";
import { uploadImage } from "@/api/uploads.api";
import { ROUTES } from "@/utils/constants";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

const BOOK_CREATED_EVENT = "admin:book-created";
const BOOK_UPDATED_EVENT = "admin:book-updated";
GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

type SnackbarSeverity = "success" | "error" | "info" | "warning";

interface PageDraft {
   id: string;
   pageNumber: string;
   title: string;
   text: string;
   narrationUrl: string;
   imageFile: File | null;
   imagePreview: string;
   existingImageUrl: string;
   uploadProgress: number;
}

const createEmptyPage = (pageNumber: number): PageDraft => ({
   id: `${Date.now()}-${Math.random()}`,
   pageNumber: String(pageNumber),
   title: "",
   text: "",
   narrationUrl: "",
   imageFile: null,
   imagePreview: "",
   existingImageUrl: "",
   uploadProgress: 0,
});

const isBlobUrl = (value: string) => value.startsWith("blob:");

const revokePreview = (value: string) => {
   if (isBlobUrl(value)) {
      URL.revokeObjectURL(value);
   }
};

export function AdminBookCreatePage() {
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const isEditMode = Boolean(id);

   const [loadingMeta, setLoadingMeta] = useState(true);
   const [loadingBook, setLoadingBook] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
   const [ageGroups, setAgeGroups] = useState<Array<{ id: string; name: string; minAge: number; maxAge: number }>>([]);

   const [form, setForm] = useState({
      title: "",
      summary: "",
      coverImageUrl: "",
      ageGroupId: "",
      categoryIds: [] as string[],
      tags: "",
      visibility: "private" as "private" | "public",
   });

   const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
   const [coverPreview, setCoverPreview] = useState("");
   const [coverUploadProgress, setCoverUploadProgress] = useState(0);
   const [isImportingPdf, setIsImportingPdf] = useState(false);
   const [pdfImportProgress, setPdfImportProgress] = useState<{
      current: number;
      total: number;
   } | null>(null);

   const [pages, setPages] = useState<PageDraft[]>([createEmptyPage(1)]);

   const [snackbar, setSnackbar] = useState<{
      open: boolean;
      severity: SnackbarSeverity;
      message: string;
   }>({
      open: false,
      severity: "success",
      message: "",
   });

   useEffect(() => {
      let mounted = true;

      const loadMetadata = async () => {
         try {
            setLoadingMeta(true);
            const [categoriesData, ageGroupsData] = await Promise.all([
               listCategories({ isActive: true }),
               listAgeGroups(),
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
            setSnackbar({
               open: true,
               severity: "error",
               message: "Failed to load categories and age groups.",
            });
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

   useEffect(() => {
      if (!isEditMode || !id) {
         return;
      }

      let mounted = true;

      const loadBook = async () => {
         try {
            setLoadingBook(true);
            const book = await getBookById(id);

            if (!mounted) return;

            setForm({
               title: book.title || "",
               summary: book.summary || "",
               coverImageUrl: book.coverImageUrl || "",
               ageGroupId: book.ageGroupId || book.ageGroupIds?.[0] || "",
               categoryIds: book.categoryIds || [],
               tags: (book.tags || []).join(", "),
               visibility: (book.visibility as "private" | "public") || "private",
            });

            setCoverPreview(book.coverImageUrl || "");

            if (book.pages?.length) {
               const mappedPages = [...book.pages]
                  .sort((a, b) => a.pageNumber - b.pageNumber)
                  .map((page) => ({
                     id: page.id || `${Date.now()}-${Math.random()}`,
                     pageNumber: String(page.pageNumber),
                     title: page.title || "",
                     text: page.text || "",
                     narrationUrl: page.narrationUrl || "",
                     imageFile: null,
                     imagePreview: page.imageUrl || "",
                     existingImageUrl: page.imageUrl || "",
                     uploadProgress: 0,
                  }));

               setPages(mappedPages);
            } else {
               setPages([createEmptyPage(1)]);
            }
         } catch {
            if (!mounted) return;
            setSnackbar({
               open: true,
               severity: "error",
               message: "Failed to load book details.",
            });
         } finally {
            if (mounted) {
               setLoadingBook(false);
            }
         }
      };

      void loadBook();

      return () => {
         mounted = false;
      };
   }, [id, isEditMode]);

   const pageNumbers = useMemo(
      () => pages.map((page) => Number(page.pageNumber)),
      [pages]
   );

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

   const clearReplacedPreviews = useCallback((currentPages: PageDraft[], nextPages: PageDraft[]) => {
      const nextIds = new Set(nextPages.map((page) => page.id));
      currentPages.forEach((page) => {
         if (!nextIds.has(page.id)) {
            revokePreview(page.imagePreview);
         }
      });
   }, []);

   const replacePages = useCallback((nextPages: PageDraft[]) => {
      setPages((currentPages) => {
         clearReplacedPreviews(currentPages, nextPages);
         return nextPages.length ? nextPages : [createEmptyPage(1)];
      });
   }, [clearReplacedPreviews]);

   const parsePdfToPages = async (file: File): Promise<PageDraft[]> => {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDocument = await getDocument({ data: arrayBuffer }).promise;
      const importedPages: PageDraft[] = [];
      const safeBaseName = file.name.replace(/\.pdf$/i, "").replace(/\s+/g, "-");

      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
         setPdfImportProgress({ current: pageNumber, total: pdfDocument.numPages });

         const pdfPage = await pdfDocument.getPage(pageNumber);
         const viewport = pdfPage.getViewport({ scale: 1.8 });

         const canvas = document.createElement("canvas");
         const context = canvas.getContext("2d");
         if (!context) {
            throw new Error("Failed to prepare PDF canvas renderer.");
         }

         canvas.width = Math.floor(viewport.width);
         canvas.height = Math.floor(viewport.height);
         await pdfPage.render({ canvasContext: context, viewport }).promise;

         const pageBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
               (blob) => {
                  if (!blob) {
                     reject(new Error("Failed to convert PDF page to image."));
                     return;
                  }
                  resolve(blob);
               },
               "image/jpeg",
               0.92
            );
         });

         const imageFile = new File([pageBlob], `${safeBaseName}-page-${pageNumber}.jpg`, {
            type: "image/jpeg",
         });

         importedPages.push({
            id: `${Date.now()}-${pageNumber}-${Math.random()}`,
            pageNumber: String(pageNumber),
            title: `Page ${pageNumber}`,
            text: "",
            narrationUrl: "",
            imageFile,
            imagePreview: URL.createObjectURL(imageFile),
            existingImageUrl: "",
            uploadProgress: 0,
         });
      }

      return importedPages;
   };

   const handleCoverFileChange = (file: File | null) => {
      if (!file) return;
      revokePreview(coverPreview);
      setCoverImageFile(file);
      setCoverPreview(URL.createObjectURL(file));
   };

   const handlePageImageChange = (pageId: string, file: File | null) => {
      if (!file) return;

      setPages((prev) =>
         prev.map((page) => {
            if (page.id !== pageId) return page;
            revokePreview(page.imagePreview);
            return {
               ...page,
               imageFile: file,
               imagePreview: URL.createObjectURL(file),
            };
         })
      );
   };

   const handlePdfImport = async (file: File | null) => {
      if (!file) return;

      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
         setSnackbar({
            open: true,
            severity: "error",
            message: "Please select a valid PDF file.",
         });
         return;
      }

      try {
         setIsImportingPdf(true);
         setPdfImportProgress(null);
         const importedPages = await parsePdfToPages(file);

         if (!importedPages.length) {
            setSnackbar({
               open: true,
               severity: "error",
               message: "No pages were detected in this PDF.",
            });
            return;
         }

         replacePages(importedPages);
         setSnackbar({
            open: true,
            severity: "success",
            message: `Imported ${importedPages.length} page(s) from PDF.`,
         });
      } catch (err) {
         setSnackbar({
            open: true,
            severity: "error",
            message: getErrorMessage(err, "Failed to import PDF pages."),
         });
      } finally {
         setIsImportingPdf(false);
         setPdfImportProgress(null);
      }
   };

   const handleAddPage = () => {
      const nextNumber =
         pages.length === 0
            ? 1
            : Math.max(...pages.map((page) => Number(page.pageNumber) || 0)) + 1;
      setPages((prev) => [...prev, createEmptyPage(nextNumber)]);
   };

   const handleRemovePage = (pageId: string) => {
      setPages((prev) => {
         const pageToRemove = prev.find((page) => page.id === pageId);
         if (pageToRemove) {
            revokePreview(pageToRemove.imagePreview);
         }
         const next = prev.filter((page) => page.id !== pageId);
         return next.length ? next : [createEmptyPage(1)];
      });
   };

   const handleSubmit = async () => {
      if (!form.title.trim() || !form.ageGroupId.trim() || form.categoryIds.length === 0) {
         setSnackbar({
            open: true,
            severity: "error",
            message: "Title, age group, and at least one category are required.",
         });
         return;
      }

      if (!pages.length || pages.some((page) => !page.text.trim())) {
         setSnackbar({
            open: true,
            severity: "error",
            message: "Each page must include text.",
         });
         return;
      }

      if (pageNumbers.some((num) => !Number.isInteger(num) || num <= 0)) {
         setSnackbar({
            open: true,
            severity: "error",
            message: "Page numbers must be positive integers.",
         });
         return;
      }

      if (new Set(pageNumbers).size !== pageNumbers.length) {
         setSnackbar({
            open: true,
            severity: "error",
            message: "Page numbers must be unique.",
         });
         return;
      }

      if (pages.some((page) => !isValidUrl(page.narrationUrl))) {
         setSnackbar({
            open: true,
            severity: "error",
            message: "Please provide valid narration URLs.",
         });
         return;
      }

      try {
         setIsSubmitting(true);
         setCoverUploadProgress(0);

         let coverImageUrl = form.coverImageUrl || "";

         if (coverImageFile) {
            const cover = await uploadImage(coverImageFile, (progress) => {
               setCoverUploadProgress(progress);
            });
            coverImageUrl = cover.secureUrl;
         }

         const pagesPayload = [] as Array<{
            pageNumber: number;
            title?: string;
            text: string;
            imageUrl?: string;
            narrationUrl?: string;
         }>;

         for (const page of pages) {
            let imageUrl = page.existingImageUrl || undefined;

            if (page.imageFile) {
               const uploaded = await uploadImage(page.imageFile, (progress) => {
                  setPages((prev) =>
                     prev.map((item) =>
                        item.id === page.id ? { ...item, uploadProgress: progress } : item
                     )
                  );
               });
               imageUrl = uploaded.secureUrl;
            }

            pagesPayload.push({
               pageNumber: Number(page.pageNumber),
               title: page.title.trim() || undefined,
               text: page.text.trim(),
               imageUrl,
               narrationUrl: page.narrationUrl.trim() || undefined,
            });
         }

         const payload = {
            title: form.title.trim(),
            summary: form.summary.trim() || undefined,
            coverImageUrl: coverImageUrl || undefined,
            ageGroupId: form.ageGroupId,
            categoryIds: form.categoryIds,
            pages: pagesPayload,
            tags: form.tags
               .split(",")
               .map((value) => value.trim())
               .filter(Boolean),
            visibility: form.visibility,
         };

         if (isEditMode && id) {
            await updateBook(id, payload);
            window.dispatchEvent(new Event(BOOK_UPDATED_EVENT));
         } else {
            await createBook(payload);
            window.dispatchEvent(new Event(BOOK_CREATED_EVENT));
         }

         setSnackbar({
            open: true,
            severity: "success",
            message: isEditMode ? "Book updated successfully." : "Book created successfully.",
         });

         window.setTimeout(() => {
            navigate(ROUTES.ADMIN.DASHBOARD);
         }, 600);
      } catch (err) {
         setSnackbar({
            open: true,
            severity: "error",
            message: getErrorMessage(err, "Failed to save book."),
         });
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
                  {isEditMode ? "Edit Book" : "Upload New Book"}
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  {isEditMode
                     ? "Update book metadata and pages."
                     : "Create a book with metadata and story pages."}
               </Typography>
            </Box>

            <Card sx={{ borderRadius: 3 }}>
               <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack spacing={2}>
                     {(loadingMeta || loadingBook) && (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
                           <CircularProgress size={20} />
                           <Typography variant="body2" color="text.secondary">
                              Loading form data...
                           </Typography>
                        </Stack>
                     )}

                     {!loadingMeta && !loadingBook && (
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

                           <Stack spacing={1}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                 Cover Image
                              </Typography>
                              <Button variant="outlined" component="label" sx={{ width: "fit-content" }}>
                                 Select Cover Image
                                 <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                       handleCoverFileChange(event.target.files?.[0] || null)
                                    }
                                 />
                              </Button>
                              {coverUploadProgress > 0 && isSubmitting && (
                                 <Typography variant="caption" color="text.secondary">
                                    Uploading cover: {coverUploadProgress}%
                                 </Typography>
                              )}
                              {coverPreview && (
                                 <Box
                                    component="img"
                                    src={coverPreview}
                                    alt="Cover preview"
                                    sx={{
                                       width: 220,
                                       height: 280,
                                       objectFit: "cover",
                                       borderRadius: 2,
                                       border: "1px solid",
                                       borderColor: "divider",
                                    }}
                                 />
                              )}
                           </Stack>

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
                                          (categoryId) =>
                                             categories.find((item) => item.id === categoryId)?.name || categoryId
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

                           <Stack
                              direction={{ xs: "column", sm: "row" }}
                              alignItems={{ xs: "flex-start", sm: "center" }}
                              justifyContent="space-between"
                              sx={{ pt: 1 }}
                              spacing={1}
                           >
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                 Pages
                              </Typography>
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                 <Button
                                    startIcon={<PictureAsPdf />}
                                    variant="outlined"
                                    component="label"
                                    disabled={isImportingPdf || isSubmitting}
                                    type="button"
                                 >
                                    {isImportingPdf ? "Importing PDF..." : "Import PDF"}
                                    <input
                                       hidden
                                       type="file"
                                       accept=".pdf,application/pdf"
                                       onChange={(event) => {
                                          void handlePdfImport(event.target.files?.[0] || null);
                                          event.currentTarget.value = "";
                                       }}
                                    />
                                 </Button>
                                 <Button
                                    startIcon={<Add />}
                                    onClick={handleAddPage}
                                    type="button"
                                    disabled={isImportingPdf || isSubmitting}
                                 >
                                    Add Page
                                 </Button>
                              </Stack>
                           </Stack>

                           {isImportingPdf && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                 <CircularProgress size={16} />
                                 <Typography variant="caption" color="text.secondary">
                                    {pdfImportProgress
                                       ? `Rendering PDF page ${pdfImportProgress.current} of ${pdfImportProgress.total}...`
                                       : "Preparing PDF import..."}
                                 </Typography>
                              </Stack>
                           )}

                           {pages.map((page, index) => (
                              <Card key={page.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                 <CardContent>
                                    <Stack spacing={2}>
                                       <Stack
                                          direction="row"
                                          alignItems="center"
                                          justifyContent="space-between"
                                       >
                                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                             Page {index + 1}
                                          </Typography>
                                          <Button
                                             color="error"
                                             startIcon={<DeleteOutline />}
                                             onClick={() => handleRemovePage(page.id)}
                                             type="button"
                                          >
                                             Remove
                                          </Button>
                                       </Stack>

                                       <TextField
                                          label="Page Number"
                                          type="number"
                                          inputProps={{ min: 1 }}
                                          value={page.pageNumber}
                                          onChange={(event) =>
                                             setPages((prev) =>
                                                prev.map((item) =>
                                                   item.id === page.id
                                                      ? { ...item, pageNumber: event.target.value }
                                                      : item
                                                )
                                             )
                                          }
                                       />

                                       <TextField
                                          label="Page Title"
                                          value={page.title}
                                          onChange={(event) =>
                                             setPages((prev) =>
                                                prev.map((item) =>
                                                   item.id === page.id
                                                      ? { ...item, title: event.target.value }
                                                      : item
                                                )
                                             )
                                          }
                                       />

                                       <TextField
                                          label="Page Text"
                                          required
                                          multiline
                                          minRows={3}
                                          value={page.text}
                                          onChange={(event) =>
                                             setPages((prev) =>
                                                prev.map((item) =>
                                                   item.id === page.id
                                                      ? { ...item, text: event.target.value }
                                                      : item
                                                )
                                             )
                                          }
                                       />

                                       <TextField
                                          label="Narration URL"
                                          value={page.narrationUrl}
                                          onChange={(event) =>
                                             setPages((prev) =>
                                                prev.map((item) =>
                                                   item.id === page.id
                                                      ? {
                                                           ...item,
                                                           narrationUrl: event.target.value,
                                                        }
                                                      : item
                                                )
                                             )
                                          }
                                       />

                                       <Stack spacing={1}>
                                          <Button variant="outlined" component="label" sx={{ width: "fit-content" }}>
                                             Select Page Image
                                             <input
                                                hidden
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) =>
                                                   handlePageImageChange(
                                                      page.id,
                                                      event.target.files?.[0] || null
                                                   )
                                                }
                                             />
                                          </Button>

                                          {page.uploadProgress > 0 && isSubmitting && (
                                             <Typography variant="caption" color="text.secondary">
                                                Uploading page image: {page.uploadProgress}%
                                             </Typography>
                                          )}

                                          {page.imagePreview && (
                                             <Box
                                                component="img"
                                                src={page.imagePreview}
                                                alt={`Page ${index + 1} preview`}
                                                sx={{
                                                   width: 220,
                                                   height: 160,
                                                   objectFit: "cover",
                                                   borderRadius: 2,
                                                   border: "1px solid",
                                                   borderColor: "divider",
                                                }}
                                             />
                                          )}
                                       </Stack>
                                    </Stack>
                                 </CardContent>
                              </Card>
                           ))}
                        </>
                     )}

                     <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
                        <Button
                           onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
                           disabled={isSubmitting}
                           type="button"
                        >
                           Cancel
                        </Button>
                        <Button
                           variant="contained"
                           onClick={handleSubmit}
                           disabled={isSubmitting || loadingMeta || loadingBook}
                           type="button"
                        >
                           {isSubmitting
                              ? isEditMode
                                 ? "Saving..."
                                 : "Creating..."
                              : isEditMode
                              ? "Save Changes"
                              : "Create Book"}
                        </Button>
                     </Stack>
                  </Stack>
               </CardContent>
            </Card>
         </Stack>

         <Snackbar
            open={snackbar.open}
            autoHideDuration={3500}
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
