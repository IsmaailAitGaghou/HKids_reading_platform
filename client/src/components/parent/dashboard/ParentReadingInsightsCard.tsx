import { Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";

interface InsightItem {
  label: string;
  percentage: number;
}

interface ParentReadingInsightsCardProps {
  items: InsightItem[];
  helperText: string;
}

export function ParentReadingInsightsCard({
  items,
  helperText,
}: ParentReadingInsightsCardProps) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2.75 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Reading Insights
        </Typography>

        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No reading insights yet for this week.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {items.map((item) => (
              <Stack key={item.label} spacing={0.6}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
                    {`${Math.round(item.percentage)}%`}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(Math.max(item.percentage, 0), 100)}
                  sx={{ height: 8, borderRadius: 999 }}
                />
              </Stack>
            ))}
          </Stack>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: "italic" }}>
          {helperText}
        </Typography>
      </CardContent>
    </Card>
  );
}

