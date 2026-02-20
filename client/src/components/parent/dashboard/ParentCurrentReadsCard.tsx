import { AutoStories, MenuBook } from "@mui/icons-material";
import { Box, Button, Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";

interface CurrentReadItem {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
}

interface ParentCurrentReadsCardProps {
  items: CurrentReadItem[];
  onViewLibrary: () => void;
}

export function ParentCurrentReadsCard({
  items,
  onViewLibrary,
}: ParentCurrentReadsCardProps) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2.75 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Current Reads
          </Typography>
          <Button size="small" onClick={onViewLibrary} type="button">
            View Library
          </Button>
        </Stack>

        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No active reads yet.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 1.5,
            }}
          >
            {items.map((item) => (
              <Card key={item.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack direction="row" spacing={1.25}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 1.5,
                        bgcolor: "action.hover",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {item.progress >= 50 ? <MenuBook color="primary" /> : <AutoStories color="secondary" />}
                    </Box>

                    <Stack spacing={0.4} sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.subtitle}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(Math.max(item.progress, 0), 100)}
                        sx={{ height: 6, borderRadius: 999, mt: 0.5 }}
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

