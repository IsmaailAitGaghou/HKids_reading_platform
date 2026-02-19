import { useEffect, useMemo, useState } from "react";
import {
   Alert,
   Box,
   Button,
   Card,
   Chip,
   Container,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormControl,
   InputLabel,
   MenuItem,
   Paper,
   Select,
   Skeleton,
   Snackbar,
   Stack,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   TextField,
   Typography,
} from "@mui/material";
import {
   Add,
   Delete,
   Edit,
   Visibility,
   VisibilityOff,
} from "@mui/icons-material";
import {
   deleteAgeGroup,
   listAgeGroups,
   type AgeGroup,
   updateAgeGroup,
} from "@/api/ageGroups.api";

const AGE_GROUP_CREATED_EVENT = "admin:age-group-created";
const OPEN_AGE_GROUP_DIALOG_EVENT = "admin:open-age-group-dialog";

type SnackbarSeverity = "success" | "error" | "info" | "warning";

export function AgeGroupsPage() {
   const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [refreshKey, setRefreshKey] = useState(0);

   const [editTarget, setEditTarget] = useState<AgeGroup | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<AgeGroup | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);

   const [formError, setFormError] = useState("");
   const [editForm, setEditForm] = useState({
      name: "",
      minAge: "0",
      maxAge: "0",
      description: "",
      sortOrder: "0",
      isActive: true,
   });

   const [snackbar, setSnackbar] = useState<{
      open: boolean;
      severity: SnackbarSeverity;
      message: string;
   }>({
      open: false,
      severity: "success",
      message: "",
   });

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
         if (firstError?.[0]) return firstError[0];
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

   useEffect(() => {
      const handleAgeGroupCreated = () => {
         setRefreshKey((prev) => prev + 1);
      };

      window.addEventListener(AGE_GROUP_CREATED_EVENT, handleAgeGroupCreated);

      return () => {
         window.removeEventListener(
            AGE_GROUP_CREATED_EVENT,
            handleAgeGroupCreated
         );
      };
   }, []);

   useEffect(() => {
      let mounted = true;

      const fetchAgeGroups = async () => {
         try {
            setLoading(true);
            setError(null);
            const data = await listAgeGroups();
            if (!mounted) return;
            setAgeGroups(data.ageGroups || []);
         } catch (err) {
            if (!mounted) return;
            setError(getErrorMessage(err, "Failed to load age groups."));
         } finally {
            if (mounted) {
               setLoading(false);
            }
         }
      };

      void fetchAgeGroups();

      return () => {
         mounted = false;
      };
   }, [refreshKey]);

   const emptyState = useMemo(() => !loading && ageGroups.length === 0, [loading, ageGroups]);

   const openEditDialog = (ageGroup: AgeGroup) => {
      setEditTarget(ageGroup);
      setFormError("");
      setEditForm({
         name: ageGroup.name,
         minAge: String(ageGroup.minAge),
         maxAge: String(ageGroup.maxAge),
         description: ageGroup.description || "",
         sortOrder: String(ageGroup.sortOrder),
         isActive: ageGroup.isActive,
      });
   };

   const handleSaveEdit = async () => {
      if (!editTarget) return;
      if (!editForm.name.trim()) {
         setFormError("Age group name is required.");
         return;
      }

      const minAge = Number(editForm.minAge);
      const maxAge = Number(editForm.maxAge);
      if (!Number.isFinite(minAge) || !Number.isFinite(maxAge) || minAge < 0 || maxAge < 0) {
         setFormError("Min age and max age must be valid numbers.");
         return;
      }
      if (minAge > maxAge) {
         setFormError("Min age must be less than or equal to max age.");
         return;
      }

      try {
         setIsSubmitting(true);
         setFormError("");
         const updated = await updateAgeGroup(editTarget.id, {
            name: editForm.name.trim(),
            minAge,
            maxAge,
            description: editForm.description.trim() || undefined,
            sortOrder: Number(editForm.sortOrder) || 0,
            isActive: editForm.isActive,
         });

         setAgeGroups((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
         );

         setSnackbar({
            open: true,
            severity: "success",
            message: "Age group updated successfully.",
         });
         setEditTarget(null);
      } catch (err) {
         setFormError(getErrorMessage(err, "Failed to update age group."));
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleDelete = async () => {
      if (!deleteTarget) return;

      const previous = ageGroups;
      setIsDeleting(true);
      setAgeGroups((prev) => prev.filter((item) => item.id !== deleteTarget.id));

      try {
         await deleteAgeGroup(deleteTarget.id);
         setSnackbar({
            open: true,
            severity: "success",
            message: "Age group deleted successfully.",
         });
         setDeleteTarget(null);
      } catch (err) {
         setAgeGroups(previous);
         setSnackbar({
            open: true,
            severity: "error",
            message: getErrorMessage(err, "Failed to delete age group."),
         });
      } finally {
         setIsDeleting(false);
      }
   };

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
            <Box>
               <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Age Groups
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Manage reading levels and recommended age ranges.
               </Typography>
            </Box>

            <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
               <TableContainer component={Paper} elevation={0}>
                  <Table>
                     <TableHead>
                        <TableRow sx={{ bgcolor: "grey.50" }}>
                           <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                           <TableCell sx={{ fontWeight: 600 }}>Age Range</TableCell>
                           <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                           <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                           <TableCell sx={{ fontWeight: 600 }}>Sort Order</TableCell>
                           <TableCell align="right" sx={{ fontWeight: 600 }}>
                              Actions
                           </TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {loading &&
                           Array.from({ length: 6 }).map((_, index) => (
                              <TableRow key={`age-group-skeleton-${index}`}>
                                 <TableCell><Skeleton variant="text" width={180} /></TableCell>
                                 <TableCell><Skeleton variant="text" width={110} /></TableCell>
                                 <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                                 <TableCell><Skeleton variant="rounded" width={88} height={24} /></TableCell>
                                 <TableCell><Skeleton variant="text" width={40} /></TableCell>
                                 <TableCell align="right">
                                    <Skeleton variant="rounded" width={84} height={28} sx={{ ml: "auto" }} />
                                 </TableCell>
                              </TableRow>
                           ))}

                        {!loading &&
                           ageGroups.map((ageGroup) => (
                              <TableRow key={ageGroup.id} sx={{ "&:hover": { bgcolor: "grey.50" } }}>
                                 <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                       {ageGroup.name}
                                    </Typography>
                                 </TableCell>
                                 <TableCell>
                                    <Typography variant="body2">
                                       {ageGroup.minAge} - {ageGroup.maxAge}
                                    </Typography>
                                 </TableCell>
                                 <TableCell>
                                    <Typography
                                       variant="body2"
                                       color="text.secondary"
                                       sx={{
                                          maxWidth: 420,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                       }}
                                    >
                                       {ageGroup.description || "-"}
                                    </Typography>
                                 </TableCell>
                                 <TableCell>
                                    <Chip
                                       label={ageGroup.isActive ? "Active" : "Inactive"}
                                       size="small"
                                       icon={
                                          ageGroup.isActive ? (
                                             <Visibility sx={{ fontSize: 16 }} />
                                          ) : (
                                             <VisibilityOff sx={{ fontSize: 16 }} />
                                          )
                                       }
                                       sx={{
                                          bgcolor: ageGroup.isActive ? "#E8F5E9" : "#ECEFF1",
                                          color: ageGroup.isActive ? "#10B981" : "#64748B",
                                          fontWeight: 600,
                                       }}
                                    />
                                 </TableCell>
                                 <TableCell>{ageGroup.sortOrder}</TableCell>
                                 <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                       <Button
                                          size="small"
                                          startIcon={<Edit />}
                                          onClick={() => openEditDialog(ageGroup)}
                                          type="button"
                                       >
                                          Edit
                                       </Button>
                                       <Button
                                          size="small"
                                          color="error"
                                          startIcon={<Delete />}
                                          onClick={() => setDeleteTarget(ageGroup)}
                                          type="button"
                                       >
                                          Delete
                                       </Button>
                                    </Stack>
                                 </TableCell>
                              </TableRow>
                           ))}
                     </TableBody>
                  </Table>
               </TableContainer>
            </Card>

            {emptyState && (
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
                     No age groups yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                     Create age groups to organize books by reading level.
                  </Typography>
                  <Button
                     variant="contained"
                     startIcon={<Add />}
                     onClick={() =>
                        window.dispatchEvent(new Event(OPEN_AGE_GROUP_DIALOG_EVENT))
                     }
                     type="button"
                  >
                     Add New Age Group
                  </Button>
               </Card>
            )}
         </Stack>

         <Dialog open={Boolean(editTarget)} onClose={() => setEditTarget(null)} fullWidth maxWidth="sm">
            <DialogTitle>Edit Age Group</DialogTitle>
            <DialogContent dividers>
               <Stack spacing={2} sx={{ pt: 1 }}>
                  {formError && <Alert severity="error">{formError}</Alert>}

                  <TextField
                     label="Name"
                     required
                     fullWidth
                     value={editForm.name}
                     onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, name: event.target.value }))
                     }
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                     <TextField
                        label="Min Age"
                        type="number"
                        fullWidth
                        inputProps={{ min: 0 }}
                        value={editForm.minAge}
                        onChange={(event) =>
                           setEditForm((prev) => ({ ...prev, minAge: event.target.value }))
                        }
                     />
                     <TextField
                        label="Max Age"
                        type="number"
                        fullWidth
                        inputProps={{ min: 0 }}
                        value={editForm.maxAge}
                        onChange={(event) =>
                           setEditForm((prev) => ({ ...prev, maxAge: event.target.value }))
                        }
                     />
                  </Stack>

                  <TextField
                     label="Description"
                     fullWidth
                     multiline
                     minRows={3}
                     value={editForm.description}
                     onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, description: event.target.value }))
                     }
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                     <TextField
                        label="Sort Order"
                        type="number"
                        fullWidth
                        inputProps={{ min: 0 }}
                        value={editForm.sortOrder}
                        onChange={(event) =>
                           setEditForm((prev) => ({ ...prev, sortOrder: event.target.value }))
                        }
                     />
                     <FormControl fullWidth>
                        <InputLabel id="age-group-status-edit-label">Status</InputLabel>
                        <Select
                           labelId="age-group-status-edit-label"
                           label="Status"
                           value={editForm.isActive ? "active" : "inactive"}
                           onChange={(event) =>
                              setEditForm((prev) => ({
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
               </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
               <Button onClick={() => setEditTarget(null)} disabled={isSubmitting}>
                  Cancel
               </Button>
               <Button variant="contained" onClick={handleSaveEdit} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
               </Button>
            </DialogActions>
         </Dialog>

         <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
            <DialogTitle>Delete Age Group</DialogTitle>
            <DialogContent>
               <Typography variant="body2" color="text.secondary">
                  {`Are you sure you want to delete "${deleteTarget?.name || "this age group"}"?`}
               </Typography>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                  Cancel
               </Button>
               <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  disabled={isDeleting}
               >
                  {isDeleting ? "Deleting..." : "Delete"}
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
