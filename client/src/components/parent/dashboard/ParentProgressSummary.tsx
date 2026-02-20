import { AutoStories, LocalFireDepartment, Schedule } from "@mui/icons-material";
import { Card, CardContent, Stack, Typography } from "@mui/material";

interface ParentProgressSummaryProps {
  totalMinutes: number;
  booksCompleted: number;
  currentStreakDays: number;
}

const formatTotalTime = (minutes: number) => {
  const safe = Math.max(minutes, 0);
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${hours}h ${mins}m`;
};

export function ParentProgressSummary({
  totalMinutes,
  booksCompleted,
  currentStreakDays,
}: ParentProgressSummaryProps) {
  const items = [
    {
      label: "Total Time Read",
      value: formatTotalTime(totalMinutes),
      icon: <Schedule color="primary" fontSize="small" />,
    },
    {
      label: "Books Completed",
      value: String(booksCompleted),
      icon: <AutoStories color="success" fontSize="small" />,
    },
    {
      label: "Current Streak",
      value: `${currentStreakDays} Days`,
      icon: <LocalFireDepartment color="warning" fontSize="small" />,
    },
  ] as const;

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      sx={{ width: "100%" }}
    >
      {items.map((item) => (
        <Card key={item.label} sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ p: 2.25 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {item.icon}
              <Stack spacing={0.25}>
                <Typography variant="subtitle2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {item.value}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

