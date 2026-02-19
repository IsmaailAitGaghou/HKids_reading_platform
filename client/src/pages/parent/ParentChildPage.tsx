import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { listPublicCategories } from "@/api/categories.api";
import { listPublicAgeGroups } from "@/api/ageGroups.api";
import {
  getChildAnalytics,
  getChildById,
  getChildPolicy,
  updateChild,
  updateChildPolicy,
} from "@/api/parent.api";
import type { Child, ParentAnalytics } from "@/types/child.types";
import { ROUTES } from "@/utils/constants";

type SnackbarSeverity = "success" | "error" | "info" | "warning";

const HH_MM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);
const getDefaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 29);
  return {
    from: formatDateInput(from),
    to: formatDateInput(to),
  };
};

export function ParentChildPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState(0);

  const [child, setChild] = useState<Child | null>(null);
  const [loadingChild, setLoadingChild] = useState(true);
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [ageGroups, setAgeGroups] = useState<Array<{ id: string; name: string }>>([]);

  const [profileForm, setProfileForm] = useState({
    name: "",
    age: "",
    avatar: "",
    ageGroupId: "",
    pin: "",
    isActive: true,
  });
  const [profileError, setProfileError] = useState("");
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  const [policyForm, setPolicyForm] = useState({
    allowedCategoryIds: [] as string[],
    allowedAgeGroupIds: [] as string[],
    allowAllCategories: true,
    allowAllAgeGroups: true,
    dailyLimitMinutes: "20",
    scheduleStart: "",
    scheduleEnd: "",
  });
  const [policyError, setPolicyError] = useState("");
  const [isPolicySubmitting, setIsPolicySubmitting] = useState(false);

  const [analytics, setAnalytics] = useState<ParentAnalytics | null>(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [dateRange, setDateRange] = useState(getDefaultRange);

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

  const fetchAnalytics = useCallback(async (childId: string, from?: string, to?: string) => {
    try {
      setLoadingAnalytics(true);
      setAnalyticsError("");
      const response = await getChildAnalytics(childId, {
        from: from || undefined,
        to: to || undefined,
      });
      setAnalytics(response.analytics);
    } catch (err) {
      setAnalyticsError(getErrorMessage(err, "Failed to load child analytics."));
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError("Invalid child ID.");
      setLoadingChild(false);
      return;
    }

    let mounted = true;

    const loadInitialData = async () => {
      try {
        setLoadingChild(true);
        setError(null);

        const [childData, categoriesRes, ageGroupsRes] = await Promise.all([
          getChildById(id),
          listPublicCategories(),
          listPublicAgeGroups(),
        ]);

        if (!mounted) return;
        setChild(childData);
        setProfileForm({
          name: childData.name,
          age: String(childData.age),
          avatar: childData.avatar || "",
          ageGroupId: childData.ageGroupId || "",
          pin: "",
          isActive: childData.isActive,
        });
        setCategories((categoriesRes.categories || []).map((item) => ({ id: item.id, name: item.name })));
        setAgeGroups((ageGroupsRes.ageGroups || []).map((item) => ({ id: item.id, name: item.name })));

        setLoadingPolicy(true);
        const policy = await getChildPolicy(id);
        if (!mounted) return;
        setPolicyForm({
          allowedCategoryIds: policy.allowedCategoryIds,
          allowedAgeGroupIds: policy.allowedAgeGroupIds,
          allowAllCategories: policy.allowedCategoryIds.length === 0,
          allowAllAgeGroups: policy.allowedAgeGroupIds.length === 0,
          dailyLimitMinutes: String(policy.dailyLimitMinutes),
          scheduleStart: policy.schedule?.start || "",
          scheduleEnd: policy.schedule?.end || "",
        });

        const initialRange = getDefaultRange();
        await fetchAnalytics(id, initialRange.from, initialRange.to);
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err, "Failed to load child details."));
      } finally {
        if (mounted) {
          setLoadingChild(false);
          setLoadingPolicy(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      mounted = false;
    };
  }, [id, fetchAnalytics]);

  const handleSaveProfile = async () => {
    if (!id || !child) return;
    if (!profileForm.name.trim()) {
      setProfileError("Name is required.");
      return;
    }

    const age = Number(profileForm.age);
    if (!Number.isInteger(age) || age < 2 || age > 17) {
      setProfileError("Age must be between 2 and 17.");
      return;
    }

    if (profileForm.avatar.trim()) {
      try {
        new URL(profileForm.avatar.trim());
      } catch {
        setProfileError("Avatar must be a valid URL.");
        return;
      }
    }

    const pin = profileForm.pin.trim();
    if (pin && !/^\d{4,8}$/.test(pin)) {
      setProfileError("PIN must be 4-8 digits.");
      return;
    }

    try {
      setIsProfileSubmitting(true);
      setProfileError("");

      const updated = await updateChild(id, {
        name: profileForm.name.trim(),
        age,
        avatar: profileForm.avatar.trim() || undefined,
        ageGroupId: profileForm.ageGroupId || undefined,
        pin: pin || undefined,
        isActive: profileForm.isActive,
      });

      setChild(updated);
      setProfileForm((prev) => ({ ...prev, pin: "" }));
      setSnackbar({
        open: true,
        severity: "success",
        message: "Child profile updated.",
      });
    } catch (err) {
      setProfileError(getErrorMessage(err, "Failed to update child profile."));
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handleSavePolicy = async () => {
    if (!id) return;

    const dailyLimit = Number(policyForm.dailyLimitMinutes);
    if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 600) {
      setPolicyError("Daily limit must be a number between 1 and 600.");
      return;
    }

    if (policyForm.scheduleStart && !HH_MM_REGEX.test(policyForm.scheduleStart)) {
      setPolicyError("Schedule start must be in HH:mm format.");
      return;
    }
    if (policyForm.scheduleEnd && !HH_MM_REGEX.test(policyForm.scheduleEnd)) {
      setPolicyError("Schedule end must be in HH:mm format.");
      return;
    }
    if ((policyForm.scheduleStart && !policyForm.scheduleEnd) || (!policyForm.scheduleStart && policyForm.scheduleEnd)) {
      setPolicyError("Provide both schedule start and end time.");
      return;
    }

    try {
      setIsPolicySubmitting(true);
      setPolicyError("");

      const updated = await updateChildPolicy(id, {
        allowedCategoryIds: policyForm.allowAllCategories ? [] : policyForm.allowedCategoryIds,
        allowedAgeGroupIds: policyForm.allowAllAgeGroups ? [] : policyForm.allowedAgeGroupIds,
        dailyLimitMinutes: dailyLimit,
        schedule:
          policyForm.scheduleStart && policyForm.scheduleEnd
            ? {
                start: policyForm.scheduleStart,
                end: policyForm.scheduleEnd,
              }
            : undefined,
      });

      setPolicyForm((prev) => ({
        ...prev,
        allowedCategoryIds: updated.allowedCategoryIds,
        allowedAgeGroupIds: updated.allowedAgeGroupIds,
        allowAllCategories: updated.allowedCategoryIds.length === 0,
        allowAllAgeGroups: updated.allowedAgeGroupIds.length === 0,
        dailyLimitMinutes: String(updated.dailyLimitMinutes),
        scheduleStart: updated.schedule?.start || "",
        scheduleEnd: updated.schedule?.end || "",
      }));
      setSnackbar({
        open: true,
        severity: "success",
        message: "Policy updated successfully.",
      });
    } catch (err) {
      setPolicyError(getErrorMessage(err, "Failed to update policy."));
    } finally {
      setIsPolicySubmitting(false);
    }
  };

  const applyPreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));
    setDateRange({
      from: formatDateInput(from),
      to: formatDateInput(to),
    });
  };

  const handleLoadAnalytics = async () => {
    if (!id) return;
    if (!dateRange.from || !dateRange.to) {
      setAnalyticsError("Please select both from and to dates.");
      return;
    }
    if (dateRange.from > dateRange.to) {
      setAnalyticsError("From date must be before or equal to To date.");
      return;
    }
    await fetchAnalytics(id, dateRange.from, dateRange.to);
  };

  if (loadingChild) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress size={56} />
      </Box>
    );
  }

  if (error || !child) {
    return (
      <Stack spacing={2}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(ROUTES.PARENT.PORTAL)} sx={{ width: "fit-content" }}>
          Back to Portal
        </Button>
        <Alert severity="error">{error || "Child not found."}</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(ROUTES.PARENT.PORTAL)}
        sx={{ width: "fit-content" }}
        type="button"
      >
        Back to Portal
      </Button>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.4 }}>
                {child.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Age {child.age} - {child.isActive ? "Active" : "Inactive"}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Age Group:{" "}
              {child.ageGroupId ? ageGroupNameById[child.ageGroupId] || child.ageGroupId : "Not set"}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 1.5, pt: 1 }}>
          <Tab label="Profile" />
          <Tab label="Policy" />
          <Tab label="Analytics" />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <Stack spacing={2}>
              {profileError && <Alert severity="error">{profileError}</Alert>}
              <TextField
                label="Name"
                required
                value={profileForm.name}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <TextField
                label="Age"
                required
                type="number"
                inputProps={{ min: 2, max: 17 }}
                value={profileForm.age}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, age: event.target.value }))}
              />
              <TextField
                label="Avatar URL (optional)"
                value={profileForm.avatar}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, avatar: event.target.value }))}
              />
              <FormControl fullWidth>
                <InputLabel id="parent-child-page-age-group-label">Age Group</InputLabel>
                <Select
                  labelId="parent-child-page-age-group-label"
                  label="Age Group"
                  value={profileForm.ageGroupId}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, ageGroupId: event.target.value }))}
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
                label="PIN (optional, 4-8 digits)"
                value={profileForm.pin}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*", minLength: 4, maxLength: 8 }}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, pin: event.target.value }))}
              />
              <FormControl fullWidth>
                <InputLabel id="parent-child-status-label">Status</InputLabel>
                <Select
                  labelId="parent-child-status-label"
                  label="Status"
                  value={profileForm.isActive ? "active" : "inactive"}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      isActive: event.target.value === "active",
                    }))
                  }
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleSaveProfile}
                disabled={isProfileSubmitting}
                sx={{ width: "fit-content" }}
                type="button"
              >
                {isProfileSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={2}>
              {(policyError || loadingPolicy) && (
                <>
                  {policyError && <Alert severity="error">{policyError}</Alert>}
                  {loadingPolicy && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography variant="body2" color="text.secondary">
                        Loading policy...
                      </Typography>
                    </Stack>
                  )}
                </>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={policyForm.allowAllCategories}
                    onChange={(event) =>
                      setPolicyForm((prev) => ({
                        ...prev,
                        allowAllCategories: event.target.checked,
                      }))
                    }
                  />
                }
                label="Allow all categories"
              />
              <FormControl fullWidth disabled={policyForm.allowAllCategories}>
                <InputLabel id="policy-categories-label">Allowed Categories</InputLabel>
                <Select
                  labelId="policy-categories-label"
                  label="Allowed Categories"
                  multiple
                  value={policyForm.allowedCategoryIds}
                  onChange={(event) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      allowedCategoryIds:
                        typeof event.target.value === "string"
                          ? event.target.value.split(",")
                          : event.target.value,
                    }))
                  }
                  renderValue={(selected) =>
                    selected
                      .map((categoryId) => categories.find((item) => item.id === categoryId)?.name || categoryId)
                      .join(", ")
                  }
                >
                  {categories.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={policyForm.allowAllAgeGroups}
                    onChange={(event) =>
                      setPolicyForm((prev) => ({
                        ...prev,
                        allowAllAgeGroups: event.target.checked,
                      }))
                    }
                  />
                }
                label="Allow all age groups"
              />
              <FormControl fullWidth disabled={policyForm.allowAllAgeGroups}>
                <InputLabel id="policy-age-groups-label">Allowed Age Groups</InputLabel>
                <Select
                  labelId="policy-age-groups-label"
                  label="Allowed Age Groups"
                  multiple
                  value={policyForm.allowedAgeGroupIds}
                  onChange={(event) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      allowedAgeGroupIds:
                        typeof event.target.value === "string"
                          ? event.target.value.split(",")
                          : event.target.value,
                    }))
                  }
                  renderValue={(selected) =>
                    selected
                      .map((ageGroupId) => ageGroups.find((item) => item.id === ageGroupId)?.name || ageGroupId)
                      .join(", ")
                  }
                >
                  {ageGroups.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Daily Limit (minutes)"
                type="number"
                inputProps={{ min: 1, max: 600 }}
                value={policyForm.dailyLimitMinutes}
                onChange={(event) =>
                  setPolicyForm((prev) => ({
                    ...prev,
                    dailyLimitMinutes: event.target.value,
                  }))
                }
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Schedule Start"
                  type="time"
                  value={policyForm.scheduleStart}
                  onChange={(event) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      scheduleStart: event.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Schedule End"
                  type="time"
                  value={policyForm.scheduleEnd}
                  onChange={(event) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      scheduleEnd: event.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Button
                variant="contained"
                onClick={handleSavePolicy}
                disabled={isPolicySubmitting}
                sx={{ width: "fit-content" }}
                type="button"
              >
                {isPolicySubmitting ? "Saving..." : "Save Policy"}
              </Button>
            </Stack>
          )}

          {tab === 2 && (
            <Stack spacing={2}>
              {analyticsError && <Alert severity="error">{analyticsError}</Alert>}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                <TextField
                  label="From"
                  type="date"
                  value={dateRange.from}
                  onChange={(event) => setDateRange((prev) => ({ ...prev, from: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="To"
                  type="date"
                  value={dateRange.to}
                  onChange={(event) => setDateRange((prev) => ({ ...prev, to: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <Button variant="outlined" onClick={() => applyPreset(7)} type="button">
                  Last 7 Days
                </Button>
                <Button variant="outlined" onClick={() => applyPreset(30)} type="button">
                  Last 30 Days
                </Button>
                <Button variant="contained" onClick={handleLoadAnalytics} disabled={loadingAnalytics} type="button">
                  {loadingAnalytics ? "Loading..." : "Apply"}
                </Button>
              </Stack>

              {loadingAnalytics && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Loading analytics...
                  </Typography>
                </Stack>
              )}

              {!loadingAnalytics && analytics && (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(3, minmax(0, 1fr))",
                      },
                      gap: 2,
                    }}
                  >
                    <Card>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          Total Sessions
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                          {analytics.totalSessions}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          Total Minutes
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                          {analytics.totalMinutes}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          Last Read At
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, mt: 1.2 }}>
                          {analytics.lastReadAt
                            ? new Date(analytics.lastReadAt).toLocaleString()
                            : "No activity"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
                        Top Books
                      </Typography>
                      {analytics.topBooks.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No book activity for the selected date range.
                        </Typography>
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Book ID</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Sessions</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Minutes</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analytics.topBooks.map((item) => (
                              <TableRow key={item.bookId}>
                                <TableCell>{item.bookId}</TableCell>
                                <TableCell>{item.sessions}</TableCell>
                                <TableCell>{item.minutes}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

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
