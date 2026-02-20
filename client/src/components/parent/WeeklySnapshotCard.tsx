import { Box, Card, CardContent, LinearProgress, Typography } from "@mui/material";

interface WeeklySnapshotCardProps {
  childName: string;
  totalMinutes: number;
  totalSessions: number;
  lastReadAt: string | null;
  weeklyGoalMinutes: number;
}

const toHours = (minutes: number) => (minutes / 60).toFixed(1);

export function WeeklySnapshotCard({
  childName,
  totalMinutes,
  totalSessions,
  lastReadAt,
  weeklyGoalMinutes,
}: WeeklySnapshotCardProps) {
  const weeklyGoal = Math.max(weeklyGoalMinutes, 1);
  const progressPercent = Math.min((totalMinutes / weeklyGoal) * 100, 100);
  const lastReadLabel = lastReadAt
    ? new Date(lastReadAt).toLocaleDateString()
    : "No reading activity";

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 800 }}>
          WEEKLY SNAPSHOT
        </Typography>

        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 1 }}>
          <Typography variant="h2" sx={{ fontWeight: 800 }}>
            {toHours(totalMinutes)}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            hrs reading
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{ mt: 2, height: 7, borderRadius: 999 }}
        />

        <Typography variant="body2" sx={{ mt: 2 }}>
          {`${childName} has reached ${Math.round(progressPercent)}% of this weekly reading goal.`}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          {`Sessions: ${totalSessions}`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {`Last read: ${lastReadLabel}`}
        </Typography>
      </CardContent>
    </Card>
  );
}
