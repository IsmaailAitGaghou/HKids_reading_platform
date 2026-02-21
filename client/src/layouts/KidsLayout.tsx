import { Box } from "@mui/material";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { kidsMotion } from "@/utils/kidsMotion";

const MotionBox = motion(Box);

export function KidsLayout() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const reduced = Boolean(reducedMotion);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AnimatePresence mode="wait" initial={false}>
        <MotionBox
          key={location.pathname}
          variants={kidsMotion.pageVariants(reduced)}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={kidsMotion.transition(reduced)}
          sx={{ minHeight: "100vh" }}
        >
          <Outlet />
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
}

