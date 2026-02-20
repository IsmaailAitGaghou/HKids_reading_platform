import { Card, CardContent, Link, Stack, Typography } from "@mui/material";
import { HelpOutline } from "@mui/icons-material";

export function NeedAssistanceCard() {
  return (
    <Card
      sx={{
        borderRadius: 2,
        borderStyle: "dashed",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.5 }}>
          <HelpOutline color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Need assistance?
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Learn how filtering algorithms work to keep your child safe while browsing books.
        </Typography>
        <Link underline="none" sx={{ fontWeight: 700 }}>
          View help articles
        </Link>
      </CardContent>
    </Card>
  );
}
