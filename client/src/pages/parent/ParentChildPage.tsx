import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Snackbar, Stack } from "@mui/material";
import { useParams } from "react-router-dom";
import { listPublicCategories } from "@/api/categories.api";
import { listPublicAgeGroups } from "@/api/ageGroups.api";
import {
  getChildAnalytics,
  getChildById,
  getChildPolicy,
  updateChildPolicy,
} from "@/api/parent.api";
import {
  AgeAppropriateFilteringCard,
  ContentCategoriesCard,
  IndividualBlockedBooksCard,
  NeedAssistanceCard,
  ParentControlHeader,
  ParentControlSkeleton,
  ReadingLimitsCard,
  WeeklySnapshotCard,
} from "@/components/parent";
import type { Child, ParentAnalytics, Policy } from "@/types/child.types";

type SnackbarSeverity = "success" | "error" | "info" | "warning";

const HH_MM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toApiDate = (date: Date) => date.toISOString().slice(0, 10);

const getWeeklyRange = () => {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  return {
    from: toApiDate(from),
    to: toApiDate(to),
  };
};

interface ParentControlDraft {
  filteringEnabled: boolean;
  selectedAgeGroupIds: string[];
  selectedCategoryIds: string[];
  dailyLimitMinutes: number;
  quietHoursEnabled: boolean;
  scheduleStart: string;
  scheduleEnd: string;
}

export function ParentChildPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [child, setChild] = useState<Child | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [analytics, setAnalytics] = useState<ParentAnalytics | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [ageGroups, setAgeGroups] = useState<Array<{ id: string; name: string; minAge: number; maxAge: number }>>([]);
  const [draft, setDraft] = useState<ParentControlDraft>({
    filteringEnabled: true,
    selectedAgeGroupIds: [],
    selectedCategoryIds: [],
    dailyLimitMinutes: 20,
    quietHoursEnabled: false,
    scheduleStart: "20:00",
    scheduleEnd: "07:00",
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

  const syncDraftFromPolicy = (nextPolicy: Policy) => {
    setDraft((prev) => ({
      ...prev,
      filteringEnabled: nextPolicy.allowedAgeGroupIds.length > 0,
      selectedAgeGroupIds: nextPolicy.allowedAgeGroupIds,
      selectedCategoryIds: nextPolicy.allowedCategoryIds,
      dailyLimitMinutes: nextPolicy.dailyLimitMinutes,
      quietHoursEnabled: Boolean(nextPolicy.schedule),
      scheduleStart: nextPolicy.schedule?.start || "20:00",
      scheduleEnd: nextPolicy.schedule?.end || "07:00",
    }));
  };

  const refreshPolicyAndAnalytics = async (childId: string) => {
    const weeklyRange = getWeeklyRange();
    const [policyRes, analyticsRes] = await Promise.all([
      getChildPolicy(childId),
      getChildAnalytics(childId, weeklyRange),
    ]);
    setPolicy(policyRes);
    setAnalytics(analyticsRes.analytics);
    syncDraftFromPolicy(policyRes);
  };

  useEffect(() => {
    if (!id) {
      setError("Invalid child ID.");
      setLoading(false);
      return;
    }

    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [childData, policyData, categoriesRes, ageGroupsRes, analyticsRes] =
          await Promise.all([
            getChildById(id),
            getChildPolicy(id),
            listPublicCategories(),
            listPublicAgeGroups(),
            getChildAnalytics(id, getWeeklyRange()),
          ]);

        if (!mounted) return;

        const mappedAgeGroups = (ageGroupsRes.ageGroups || []).map((group) => ({
          id: group.id,
          name: group.name,
          minAge: group.minAge,
          maxAge: group.maxAge,
        }));

        setChild(childData);
        setPolicy(policyData);
        setCategories((categoriesRes.categories || []).map((category) => ({ id: category.id, name: category.name })));
        setAgeGroups(mappedAgeGroups);
        setAnalytics(analyticsRes.analytics);

        syncDraftFromPolicy(policyData);
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err, "Failed to load profile controls."));
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
  }, [id]);

  const blockedRows = useMemo(() => {
    const top = analytics?.topBooks || [];
    return top.map((book, index) => ({
      id: book.bookId,
      title: `Book ${book.bookId.slice(0, 6)}`,
      subtitle: `ID: ${book.bookId}`,
      reason: index % 2 === 0 ? "Too intense for age range" : "Manual parental block",
    }));
  }, [analytics]);

  const handleSaveAll = async () => {
    if (!id) return;

    if (!Number.isInteger(draft.dailyLimitMinutes) || draft.dailyLimitMinutes < 1 || draft.dailyLimitMinutes > 600) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Daily limit must be between 1 and 600 minutes.",
      });
      return;
    }

    if (draft.quietHoursEnabled) {
      if (!HH_MM_REGEX.test(draft.scheduleStart) || !HH_MM_REGEX.test(draft.scheduleEnd)) {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Schedule must use HH:mm format.",
        });
        return;
      }
    }

    try {
      setSaving(true);
      const updated = await updateChildPolicy(id, {
        allowedCategoryIds: draft.selectedCategoryIds,
        allowedAgeGroupIds: draft.filteringEnabled ? draft.selectedAgeGroupIds : [],
        dailyLimitMinutes: draft.dailyLimitMinutes,
        schedule: draft.quietHoursEnabled
          ? {
              start: draft.scheduleStart,
              end: draft.scheduleEnd,
            }
          : undefined,
      });

      setPolicy(updated);
      syncDraftFromPolicy(updated);
      await refreshPolicyAndAnalytics(id);
      setSnackbar({
        open: true,
        severity: "success",
        message: "Settings saved successfully.",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        severity: "error",
        message: getErrorMessage(err, "Failed to save settings."),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ParentControlSkeleton />;

  if (error || !child || !policy) {
    return <Alert severity="error">{error || "Unable to load profile controls."}</Alert>;
  }

  return (
    <Stack spacing={2.5}>
      <ParentControlHeader childName={child.name} onSave={handleSaveAll} isSaving={saving} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "2fr 1fr" },
          gap: 2.5,
        }}
      >
        <Stack spacing={2.5}>
          <AgeAppropriateFilteringCard
            enabled={draft.filteringEnabled}
            ageGroups={ageGroups}
            selectedAgeGroupIds={draft.selectedAgeGroupIds}
            onToggleEnabled={(next) => setDraft((prev) => ({ ...prev, filteringEnabled: next }))}
            onToggleAgeGroup={(ageGroupId, checked) =>
              setDraft((prev) => ({
                ...prev,
                selectedAgeGroupIds: checked
                  ? [...prev.selectedAgeGroupIds, ageGroupId]
                  : prev.selectedAgeGroupIds.filter((id) => id !== ageGroupId),
              }))
            }
          />

          <ContentCategoriesCard
            categories={categories}
            selectedCategoryIds={draft.selectedCategoryIds}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onToggleCategory={(categoryId, checked) =>
              setDraft((prev) => ({
                ...prev,
                selectedCategoryIds: checked
                  ? [...prev.selectedCategoryIds, categoryId]
                  : prev.selectedCategoryIds.filter((id) => id !== categoryId),
              }))
            }
            onSelectAll={() =>
              setDraft((prev) => ({
                ...prev,
                selectedCategoryIds: categories.map((category) => category.id),
              }))
            }
          />

          <IndividualBlockedBooksCard rows={blockedRows} />
        </Stack>

        <Stack spacing={2.5}>
          <ReadingLimitsCard
            dailyLimitMinutes={draft.dailyLimitMinutes}
            quietHoursEnabled={draft.quietHoursEnabled}
            scheduleStart={draft.scheduleStart}
            scheduleEnd={draft.scheduleEnd}
            onDailyLimitChange={(value) => setDraft((prev) => ({ ...prev, dailyLimitMinutes: value }))}
            onQuietHoursChange={(enabled) => setDraft((prev) => ({ ...prev, quietHoursEnabled: enabled }))}
            onScheduleStartChange={(value) => setDraft((prev) => ({ ...prev, scheduleStart: value }))}
            onScheduleEndChange={(value) => setDraft((prev) => ({ ...prev, scheduleEnd: value }))}
          />

          <WeeklySnapshotCard
            childName={child.name}
            totalMinutes={analytics?.totalMinutes || 0}
            totalSessions={analytics?.totalSessions || 0}
            lastReadAt={analytics?.lastReadAt || null}
            weeklyGoalMinutes={(policy?.dailyLimitMinutes || draft.dailyLimitMinutes) * 7}
          />

          <NeedAssistanceCard />
        </Stack>
      </Box>

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
    </Stack>
  );
}
