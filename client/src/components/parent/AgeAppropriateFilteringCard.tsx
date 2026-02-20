import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { ChildCare, School } from "@mui/icons-material";

interface AgeGroupOption {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
}

interface AgeAppropriateFilteringCardProps {
  enabled: boolean;
  ageGroups: AgeGroupOption[];
  selectedAgeGroupIds: string[];
  onToggleEnabled: (next: boolean) => void;
  onToggleAgeGroup: (ageGroupId: string, checked: boolean) => void;
}

export function AgeAppropriateFilteringCard({
  enabled,
  ageGroups,
  selectedAgeGroupIds,
  onToggleEnabled,
  onToggleAgeGroup,
}: AgeAppropriateFilteringCardProps) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: "action.hover",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ChildCare color="primary" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Age-Appropriate Filtering
            </Typography>
          </Stack>
          <Switch checked={enabled} onChange={(event) => onToggleEnabled(event.target.checked)} />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {ageGroups.map((group) => {
            const isActive = selectedAgeGroupIds.includes(group.id);
            return (
              <IconButton
                key={group.id}
                onClick={() => onToggleAgeGroup(group.id, !isActive)}
                type="button"
                sx={{
                  width: "100%",
                  height: 122,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: isActive ? "primary.main" : "divider",
                  bgcolor: isActive ? "action.selected" : "background.paper",
                  flexDirection: "column",
                  gap: 1.2,
                }}
              >
                <School fontSize="small" />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: isActive ? "primary.main" : "text.primary" }}
                >
                  {group.name || `Ages ${group.minAge}-${group.maxAge}`}
                </Typography>
              </IconButton>
            );
          })}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2.2, textAlign: "center" }}>
          Selecting age groups automatically hides content rated for older audiences.
        </Typography>
      </CardContent>
    </Card>
  );
}
