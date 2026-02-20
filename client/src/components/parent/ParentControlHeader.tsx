import { Box, Breadcrumbs, Button, Link, Stack, Typography } from "@mui/material";
import { Save } from "@mui/icons-material";

interface ParentControlHeaderProps {
  childName: string;
  onSave: () => void;
  isSaving: boolean;
}

export function ParentControlHeader({
  childName,
  onSave,
  isSaving,
}: ParentControlHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      spacing={2}
    >
      <Box>
        <Breadcrumbs sx={{ mb: 1 }} aria-label="breadcrumb">
          <Link underline="hover" color="inherit">
            Profiles
          </Link>
          <Typography color="primary.main" sx={{ fontWeight: 600 }}>
            {`${childName}'s Settings`}
          </Typography>
        </Breadcrumbs>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.75 }}>
          {`Content Control: ${childName}'s Profile`}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure age filters, reading interests, and screen time usage.
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<Save />}
        type="button"
        onClick={onSave}
        disabled={isSaving}
        sx={{ px: 3, py: 1.25, borderRadius: 1.5, whiteSpace: "nowrap" }}
      >
        {isSaving ? "Saving..." : "Save All Changes"}
      </Button>
    </Stack>
  );
}
