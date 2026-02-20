import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getChildAnalytics, listChildren } from "@/api/parent.api";
import {
  ParentCurrentReadsCard,
  ParentProgressDashboardSkeleton,
  ParentProgressSummary,
  ParentReadingActivityCard,
  ParentReadingInsightsCard,
} from "@/components/parent";
import type { Child, ParentAnalytics } from "@/types/child.types";
import { ROUTES } from "@/utils/constants";

interface ActivityPoint {
  label: string;
  minutes: number;
}

const formatDate = (value: Date) => value.toISOString().slice(0, 10);

const getLastSevenDates = () => {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const next = new Date(today);
    next.setDate(today.getDate() - i);
    dates.push(next);
  }
  return dates;
};

const toWeekdayLabel = (value: Date) =>
  value.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();

const calculateCurrentStreak = (points: ActivityPoint[]) => {
  let streak = 0;
  for (let i = points.length - 1; i >= 0; i -= 1) {
    if (points[i].minutes > 0) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
};

export function ParentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [childrenProfiles, setChildrenProfiles] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [analytics, setAnalytics] = useState<ParentAnalytics | null>(null);
  const [activityPoints, setActivityPoints] = useState<ActivityPoint[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadChildren = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listChildren();
        if (!mounted) return;

        const list = response.children || [];
        setChildrenProfiles(list);
        setSelectedChildId((prev) => prev || list[0]?.id || "");
      } catch {
        if (!mounted) return;
        setError("Failed to load child profiles.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadChildren();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedChildId) {
      setAnalytics(null);
      setActivityPoints([]);
      return;
    }

    let mounted = true;

    const loadAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        setError(null);

        const days = getLastSevenDates();
        const from = formatDate(days[0]);
        const to = formatDate(days[days.length - 1]);

        const [summaryResponse, dayResponses] = await Promise.all([
          getChildAnalytics(selectedChildId, { from, to }),
          Promise.all(
            days.map(async (day) => {
              const dayKey = formatDate(day);
              const response = await getChildAnalytics(selectedChildId, {
                from: dayKey,
                to: dayKey,
              });
              return {
                label: toWeekdayLabel(day),
                minutes: response.analytics.totalMinutes,
              };
            })
          ),
        ]);

        if (!mounted) return;
        setAnalytics(summaryResponse.analytics);
        setActivityPoints(dayResponses);
      } catch {
        if (!mounted) return;
        setError("Failed to load child progress.");
      } finally {
        if (mounted) setLoadingAnalytics(false);
      }
    };

    void loadAnalytics();
    return () => {
      mounted = false;
    };
  }, [selectedChildId]);

  const selectedChild = useMemo(
    () => childrenProfiles.find((child) => child.id === selectedChildId) || null,
    [childrenProfiles, selectedChildId]
  );

  const insightItems = useMemo(() => {
    const books = analytics?.topBooks || [];
    const totalMinutes = books.reduce((acc, item) => acc + item.minutes, 0);
    return books.slice(0, 3).map((item) => ({
      label: item.title?.trim() || "Untitled Book",
      percentage: totalMinutes > 0 ? (item.minutes / totalMinutes) * 100 : 0,
    }));
  }, [analytics]);

  const currentReads = useMemo(() => {
    const books = analytics?.topBooks || [];
    const highestMinutes = Math.max(...books.map((book) => book.minutes), 1);
    return books.slice(0, 2).map((book) => ({
      id: book.bookId,
      title: book.title?.trim() || "Untitled Book",
      subtitle: `${book.sessions} sessions`,
      progress: (book.minutes / highestMinutes) * 100,
    }));
  }, [analytics]);

  if (loading) {
    return <ParentProgressDashboardSkeleton />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (childrenProfiles.length === 0) {
    return (
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Child Progress
        </Typography>
        <Typography color="text.secondary">
          Add a child profile first to start tracking progress.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ md: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Child Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track reading time, consistency, and active books.
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="parent-dashboard-child-select">Profile</InputLabel>
          <Select
            labelId="parent-dashboard-child-select"
            value={selectedChildId}
            label="Profile"
            onChange={(event) => setSelectedChildId(event.target.value)}
          >
            {childrenProfiles.map((child) => (
              <MenuItem key={child.id} value={child.id}>
                {child.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <ParentProgressSummary
        totalMinutes={analytics?.totalMinutes || 0}
        booksCompleted={analytics?.topBooks.length || 0}
        currentStreakDays={calculateCurrentStreak(activityPoints)}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "2fr 1fr" },
          gap: 2.5,
        }}
      >
        <ParentReadingActivityCard points={activityPoints} loading={loadingAnalytics} />

        <ParentReadingInsightsCard
          items={insightItems}
          helperText={
            selectedChild
              ? `${selectedChild.name}'s top reading focus for the last 7 days.`
              : "Reading focus for the last 7 days."
          }
        />

        <ParentCurrentReadsCard
          items={currentReads}
          onViewLibrary={() => {
            if (selectedChildId) {
              navigate(ROUTES.PARENT.CHILD_VIEW(selectedChildId));
            }
          }}
        />

        {/* <ParentRecentAchievementsCard
          achievements={achievements}
          onClaimRewards={() => {
            if (selectedChildId) {
              navigate(ROUTES.PARENT.CHILD_VIEW(selectedChildId));
            }
          }}
        /> */}
      </Box>

      {loadingAnalytics && (
        <Typography variant="caption" color="text.secondary">
          Updating progress...
        </Typography>
      )}
    </Stack>
  );
}
