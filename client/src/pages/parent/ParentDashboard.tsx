import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, DeleteOutline, Edit, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createChild, deleteChild, listChildren, updateChild } from "@/api/parent.api";
import { listPublicAgeGroups } from "@/api/ageGroups.api";
import type { Child } from "@/types/child.types";
import { ROUTES } from "@/utils/constants";

type SnackbarSeverity = "success" | "error" | "info" | "warning";

interface ChildFormState {
  name: string;
  age: string;
  avatar: string;
  ageGroupId: string;
  pin: string;
}

const emptyForm: ChildFormState = {
  name: "",
  age: "",
  avatar: "",
  ageGroupId: "",
  pin: "",
};

export function ParentDashboard() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [ageGroups, setAgeGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);
  const [editTarget, setEditTarget] = useState<Child | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<ChildFormState>(emptyForm);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: SnackbarSeverity;
    message: string;
  }>({ open: false, severity: "success", message: "" });

  const ageGroupNameById = useMemo(
    () =>
      ageGroups.reduce(
        (acc, item) => {
          acc[item.id] = item.name;
          return acc;
        },
        {} as Record<string, string>
      ),
    [ageGroups]
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
      const fieldErrors = err.details.fieldErrors as Record<string, string[] | undefined>;
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

  const fetchChildren = async () => {
    const response = await listChildren();
    setChildren(response.children || []);
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [childrenRes, ageGroupsRes] = await Promise.all([
          listChildren(),
          listPublicAgeGroups(),
        ]);

        if (!mounted) return;
        setChildren(childrenRes.children || []);
        setAgeGroups((ageGroupsRes.ageGroups || []).map((item) => ({ id: item.id, name: item.name })));
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err, "Failed to load parent portal data."));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const openCreateDialog = () => {
    setEditTarget(null);
    setFormError("");
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (child: Child) => {
    setEditTarget(child);
    setFormError("");
    setForm({
      name: child.name,
      age: String(child.age),
      avatar: child.avatar || "",
      ageGroupId: child.ageGroupId || "",
      pin: "",
    });
    setIsDialogOpen(true);
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
    if (!form.name.trim()) {
      setFormError("Child name is required.");
      return;
    }

    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 2 || age > 17) {
      setFormError("Age must be between 2 and 17.");
      return;
    }

    if (!isValidUrl(form.avatar)) {
      setFormError("Avatar must be a valid URL.");
      return;
    }

    const pin = form.pin.trim();
    if (pin && !/^\d{4,8}$/.test(pin)) {
      setFormError("PIN must be 4-8 digits.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const payload = {
        name: form.name.trim(),
        age,
        avatar: form.avatar.trim() || undefined,
        ageGroupId: form.ageGroupId || undefined,
        pin: pin || undefined,
      };

      if (editTarget) {
        await updateChild(editTarget.id, payload);
      } else {
        await createChild(payload);
      }

      await fetchChildren();
      setIsDialogOpen(false);
      setSnackbar({
        open: true,
        severity: "success",
        message: editTarget ? "Child updated successfully." : "Child created successfully.",
      });
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to save child."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChild = async () => {
    if (!deleteTarget) return;
    const previous = children;
    setIsDeleting(true);
    setChildren((prev) => prev.filter((item) => item.id !== deleteTarget.id));

    try {
      await deleteChild(deleteTarget.id);
      setDeleteTarget(null);
      setSnackbar({
        open: true,
        severity: "success",
        message: "Child deleted successfully.",
      });
    } catch (err) {
      setChildren(previous);
      setSnackbar({
        open: true,
        severity: "error",
        message: getErrorMessage(err, "Failed to delete child."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress size={56} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Parent Portal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your children profiles and reading access.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog} type="button">
          Add Child
        </Button>
      </Stack>

      {children.length === 0 && (
        <Card sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            No children profiles yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first child profile to start managing reading settings.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog} type="button">
            Add Child
          </Button>
        </Card>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 2.5,
        }}
      >
        {children.map((child) => (
          <Card key={child.id} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Avatar src={child.avatar || undefined} sx={{ width: 48, height: 48 }}>
                  {(child.name.charAt(0) || "C").toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                    {child.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Age {child.age}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Age Group:{" "}
                  {child.ageGroupId ? ageGroupNameById[child.ageGroupId] || child.ageGroupId : "Not set"}
                </Typography>
                <Chip
                  size="small"
                  label={child.isActive ? "Active" : "Inactive"}
                  color={child.isActive ? "success" : "default"}
                  sx={{ width: "fit-content" }}
                />
              </Stack>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button
                size="small"
                startIcon={<Visibility />}
                onClick={() => navigate(ROUTES.PARENT.CHILD_VIEW(child.id))}
                type="button"
              >
                View
              </Button>
              <Button size="small" startIcon={<Edit />} onClick={() => openEditDialog(child)} type="button">
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteOutline />}
                onClick={() => setDeleteTarget(child)}
                type="button"
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Dialog open={isDialogOpen} onClose={() => (isSubmitting ? undefined : setIsDialogOpen(false))} fullWidth maxWidth="sm">
        <DialogTitle>{editTarget ? "Edit Child" : "Add Child"}</DialogTitle>
        <DialogContent dividers>
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
              required
              type="number"
              inputProps={{ min: 2, max: 17 }}
              value={form.age}
              onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
            />

            <TextField
              label="Avatar URL (optional)"
              value={form.avatar}
              onChange={(event) => setForm((prev) => ({ ...prev, avatar: event.target.value }))}
            />

            <FormControl fullWidth>
              <InputLabel id="parent-child-age-group-label">Age Group</InputLabel>
              <Select
                labelId="parent-child-age-group-label"
                label="Age Group"
                value={form.ageGroupId}
                onChange={(event) => setForm((prev) => ({ ...prev, ageGroupId: event.target.value }))}
              >
                <MenuItem value="">None</MenuItem>
                {ageGroups.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={editTarget ? "PIN (optional, leave blank to keep current)" : "PIN (optional)"}
              value={form.pin}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*", minLength: 4, maxLength: 8 }}
              onChange={(event) => setForm((prev) => ({ ...prev, pin: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} type="button">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting} type="button">
            {isSubmitting ? "Saving..." : editTarget ? "Save Changes" : "Create Child"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Child</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {`Are you sure you want to delete "${deleteTarget?.name || "this child"}"?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" color="error" variant="contained" onClick={handleDeleteChild} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
    </Stack>
  );
}
