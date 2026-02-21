import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { kidsMotion } from "@/utils/kidsMotion";

export function KidsSessionCompletePage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const reduced = Boolean(reducedMotion);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.kids", py: 4 }}>
      <Container maxWidth="sm">
        <Paper
          component={motion.div}
          variants={kidsMotion.fadeScaleVariants(reduced)}
          initial="initial"
          animate="animate"
          exit="exit"
          elevation={2}
          sx={{ borderRadius: 4, p: { xs: 3, md: 5 } }}
        >
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
              <motion.div {...kidsMotion.buttonMotion(reduced)}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate(ROUTES.KIDS.LIBRARY)}
                >
                  Back to Library
                </Button>
              </motion.div>
              <motion.div {...kidsMotion.buttonMotion(reduced)}>
                <Button
                  type="button"
                  variant="contained"
                  onClick={() => navigate(ROUTES.CHILD_LOGIN)}
                >
                  Done
                </Button>
              </motion.div>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
