import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";

export function KidsSessionCompletePage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.kids", py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={2} sx={{ borderRadius: 4, p: { xs: 3, md: 5 } }}>
          <Stack spacing={2.5} alignItems="center" textAlign="center">
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Session Complete
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Great reading today.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your reading time for today is finished. Please come back tomorrow.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ pt: 1 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(ROUTES.KIDS.LIBRARY)}
              >
                Back to Library
              </Button>
              <Button
                type="button"
                variant="contained"
                onClick={() => navigate(ROUTES.CHILD_LOGIN)}
              >
                Done
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
