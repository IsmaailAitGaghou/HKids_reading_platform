import {
  Box,
  Card,
  CardContent,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { AccessTime, NotificationsActive } from "@mui/icons-material";

interface ReadingLimitsCardProps {
  dailyLimitMinutes: number;
  quietHoursEnabled: boolean;
  scheduleStart: string;
  scheduleEnd: string;
  onDailyLimitChange: (value: number) => void;
  onQuietHoursChange: (enabled: boolean) => void;
  onScheduleStartChange: (value: string) => void;
  onScheduleEndChange: (value: string) => void;
}

export function ReadingLimitsCard({
  dailyLimitMinutes,
  quietHoursEnabled,
  scheduleStart,
  scheduleEnd,
  onDailyLimitChange,
  onQuietHoursChange,
  onScheduleStartChange,
  onScheduleEndChange,
}: ReadingLimitsCardProps) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              bgcolor: "action.hover",
              display: "grid",
              placeItems: "center",
            }}
          >
            <NotificationsActive color="warning" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Reading Limits
          </Typography>
        </Stack>

        <Stack spacing={1} sx={{ mb: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Daily Goal</Typography>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
              {dailyLimitMinutes} mins
            </Typography>
          </Stack>
          <Slider
            min={1}
            max={600}
            step={1}
            value={dailyLimitMinutes}
            onChange={(_, value) => onDailyLimitChange(Number(value))}
            aria-label="Daily Goal"
          />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              1m
            </Typography>
            <Typography variant="caption" color="text.secondary">
              10h
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="h6">Quiet Hours</Typography>
            <Typography variant="caption" color="text.secondary">
              App access locked during this time
            </Typography>
          </Box>
          <Switch
            checked={quietHoursEnabled}
            onChange={(event) => onQuietHoursChange(event.target.checked)}
          />
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            type="time"
            label="STARTS AT"
            value={scheduleStart}
            onChange={(event) => onScheduleStartChange(event.target.value)}
            fullWidth
            disabled={!quietHoursEnabled}
            InputLabelProps={{ shrink: true }}
            InputProps={{ startAdornment: <AccessTime sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} /> }}
          />
          <TextField
            size="small"
            type="time"
            label="ENDS AT"
            value={scheduleEnd}
            onChange={(event) => onScheduleEndChange(event.target.value)}
            fullWidth
            disabled={!quietHoursEnabled}
            InputLabelProps={{ shrink: true }}
            InputProps={{ startAdornment: <AccessTime sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} /> }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
