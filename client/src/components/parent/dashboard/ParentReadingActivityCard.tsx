import { Card, CardContent, Chip, Stack, Typography, Box, CircularProgress } from "@mui/material";

interface ActivityPoint {
  label: string;
  minutes: number;
}

interface ParentReadingActivityCardProps {
  points: ActivityPoint[];
  loading?: boolean;
}

export function ParentReadingActivityCard({
  points,
  loading = false,
}: ParentReadingActivityCardProps) {
  const maxValue = Math.max(...points.map((point) => point.minutes), 1);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2.75 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Reading Activity
          </Typography>
          <Chip size="small" label="Last 7 Days" color="primary" variant="outlined" />
        </Stack>

        {loading ? (
          <Stack sx={{ minHeight: 220, alignItems: "center", justifyContent: "center" }}>
            <CircularProgress size={26} />
          </Stack>
        ) : (
          <Stack spacing={1.25}>
            <Stack
              direction="row"
              alignItems="flex-end"
              justifyContent="space-between"
              spacing={1}
              sx={{ minHeight: 200 }}
            >
              {points.map((point) => {
                const heightPercent = Math.max((point.minutes / maxValue) * 100, 2);
                return (
                  <Stack key={point.label} spacing={0.75} sx={{ flex: 1, alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      {point.minutes > 0 ? `${point.minutes}m` : ""}
                    </Typography>
                    <Box
                      sx={{
                        width: "70%",
                        borderRadius: 999,
                        minHeight: 8,
                        height: `${heightPercent}%`,
                        bgcolor: point.minutes > 0 ? "primary.main" : "action.hover",
                        transition: "height 220ms ease",
                      }}
                    />
                  </Stack>
                );
              })}
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={1}>
              {points.map((point) => (
                <Typography
                  key={`${point.label}-label`}
                  variant="caption"
                  color="text.secondary"
                  sx={{ flex: 1, textAlign: "center", fontWeight: 700 }}
                >
                  {point.label}
                </Typography>
              ))}
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
