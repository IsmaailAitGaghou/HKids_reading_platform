import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createChild, deleteChild, listChildren, updateChild } from "@/api/parent.api";
import { listPublicAgeGroups } from "@/api/ageGroups.api";
import type { Child } from "@/types/child.types";
import type { AgeGroup } from "@/api/ageGroups.api";
import { ROUTES } from "@/utils/constants";

type DialogMode = "create" | "edit" | null;
type SnackbarSeverity = "success" | "error";

interface ChildFormState {
  name: string;
  age: string;
  avatar: string;
  ageGroupId: string;
  pin: string;
  isActive: boolean;
}

const defaultFormState: ChildFormState = {
  name: "",
  age: "",
  avatar: "",
  ageGroupId: "",
  pin: "",
  isActive: true,
};

function ManageChildrenSkeleton() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
          xl: "repeat(3, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} sx={{ borderRadius: 4 }}>
          <CardContent
            sx={{
              minHeight: 260,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Skeleton variant="circular" width={100} height={100} />
            <Skeleton variant="text" width={120} height={44} sx={{ mt: 2 }} />
            <Skeleton variant="text" width={140} height={30} />
            <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
              <Skeleton variant="rounded" width={80} height={34} />
              <Skeleton variant="rounded" width={80} height={34} />
              <Skeleton variant="rounded" width={80} height={34} />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export function ParentChildrenManagePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [childrenProfiles, setChildrenProfiles] = useState<Child[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);
  const [form, setForm] = useState<ChildFormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadChildren = useCallback(async () => {
    const response = await listChildren();
    setChildrenProfiles(response.children || []);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [childrenResponse, ageGroupsResponse] = await Promise.all([
        listChildren(),
        listPublicAgeGroups(),
      ]);
      setChildrenProfiles(childrenResponse.children || []);
      setAgeGroups(ageGroupsResponse.ageGroups || []);
    } catch {
      setError("Failed to load children.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const dialogTitle = useMemo(() => {
    if (dialogMode === "create") return "Add New Child";
    if (dialogMode === "edit") return "Edit Child";
    return "";
  }, [dialogMode]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingChild(null);
    setForm(defaultFormState);
    setFormError(null);
  };

  const openEditDialog = (child: Child) => {
    setDialogMode("edit");
    setEditingChild(child);
    setForm({
      name: child.name,
      age: String(child.age),
      avatar: child.avatar || "",
      ageGroupId: child.ageGroupId || "",
      pin: "",
      isActive: child.isActive,
    });
    setFormError(null);
  };

  const closeDialog = (force = false) => {
    if (submitting && !force) return;
    setDialogMode(null);
    setEditingChild(null);
    setFormError(null);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Name is required.";
    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 2 || age > 17) {
      return "Age must be between 2 and 17.";
    }
    if (form.avatar.trim()) {
      try {
        new URL(form.avatar.trim());
      } catch {
        return "Avatar must be a valid URL.";
      }
    }
    if (form.pin.trim() && !/^\d{4,8}$/.test(form.pin.trim())) {
      return "PIN must be 4 to 8 digits.";
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const payload = {
        name: form.name.trim(),
        age: Number(form.age),
        avatar: form.avatar.trim() || undefined,
        ageGroupId: form.ageGroupId || undefined,
        pin: form.pin.trim() || undefined,
      };

      if (dialogMode === "create") {
        await createChild(payload);
      } else if (dialogMode === "edit" && editingChild) {
        await updateChild(editingChild.id, {
          ...payload,
          isActive: form.isActive,
        });
      }

      await loadChildren();
      window.dispatchEvent(new Event("parent:children-updated"));
      setSnackbar({
        open: true,
        severity: "success",
        message: dialogMode === "create" ? "Child created." : "Child updated.",
      });
      closeDialog(true);
    } catch {
      setFormError(dialogMode === "create" ? "Failed to create child." : "Failed to update child.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      await deleteChild(deleteTarget.id);
      await loadChildren();
      window.dispatchEvent(new Event("parent:children-updated"));
      setSnackbar({
        open: true,
        severity: "success",
        message: "Child deleted.",
      });
      setDeleteTarget(null);
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Failed to delete child.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Stack spacing={2.5}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
          <Box>
            <Skeleton variant="text" width={260} height={48} />
            <Skeleton variant="text" width={340} height={30} />
          </Box>
          <Skeleton variant="rounded" width={160} height={42} />
        </Stack>
        <ManageChildrenSkeleton />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Manage Children
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add, update, and remove child profiles.
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={openCreateDialog} type="button">
          Add New Child
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {childrenProfiles.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No children yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first child profile to start using parental controls.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {childrenProfiles.map((child) => (
            <Card key={child.id} sx={{ borderRadius: 4 }}>
              <CardContent
                sx={{
                  minHeight: 260,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Avatar src={child.avatar || undefined} sx={{ width: 70, height: 70, mb: 2 }}>
                  {(child.name.charAt(0) || "C").toUpperCase()}
                </Avatar>

                <Typography variant="h5" noWrap sx={{ fontWeight: 800, maxWidth: "100%", textAlign: "center" }}>
                  {child.name}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  {`Age ${child.age} - ${child.isActive ? "Active" : "Inactive"}`}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 3, width: "100%" }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(ROUTES.PARENT.CHILD_VIEW(child.id))}
                    type="button"
                    variant="text"
                    sx={{ flex: 1 }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => openEditDialog(child)}
                    type="button"
                    variant="text"
                    sx={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setDeleteTarget(child)}
                    type="button"
                    variant="text"
                    sx={{ flex: 1 }}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogMode !== null} onClose={() => closeDialog()} fullWidth maxWidth="sm">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Name"
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />

            <TextField
              label="Age"
              type="number"
              inputProps={{ min: 2, max: 17 }}
              required
              value={form.age}
              onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
            />

            <TextField
              label="Avatar URL (optional)"
              value={form.avatar}
              onChange={(event) => setForm((prev) => ({ ...prev, avatar: event.target.value }))}
            />

            <FormControl fullWidth>
              <InputLabel id="manage-children-age-group">Age Group</InputLabel>
              <Select
                labelId="manage-children-age-group"
                label="Age Group"
                value={form.ageGroupId}
                onChange={(event) => setForm((prev) => ({ ...prev, ageGroupId: event.target.value }))}
              >
                <MenuItem value="">None</MenuItem>
                {ageGroups.map((ageGroup) => (
                  <MenuItem key={ageGroup.id} value={ageGroup.id}>
                    {ageGroup.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={dialogMode === "edit" ? "PIN (optional, leave blank to keep current)" : "PIN (optional)"}
              value={form.pin}
              onChange={(event) => setForm((prev) => ({ ...prev, pin: event.target.value }))}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*", minLength: 4, maxLength: 8 }}
            />

            {dialogMode === "edit" && (
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                }
                label="Active"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog()} disabled={submitting} type="button">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={submitting} type="button">
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Child</DialogTitle>
        <DialogContent>
          <Typography>
            {`Are you sure you want to delete ${deleteTarget?.name || "this child"}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={submitting} type="button">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={submitting} type="button">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Stack>
  );
}
