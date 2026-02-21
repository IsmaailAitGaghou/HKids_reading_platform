import { AutoStories } from "@mui/icons-material";
import { Box, Card, Stack, Typography, Button } from "@mui/material";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { KidsBook } from "@/types/book.types";
import { kidsMotion } from "@/utils/kidsMotion";

interface KidsBookRailItem {
  book: KidsBook;
  subtitle: string;
  progressPercent?: number;
}

interface KidsBookRailProps {
  title: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  onItemClick?: (bookId: string) => void;
  items: KidsBookRailItem[];
  emptyMessage: string;
}

export function KidsBookRail({
  title,
  ctaLabel,
  onCtaClick,
  onItemClick,
  items,
  emptyMessage,
}: KidsBookRailProps) {
  const reducedMotion = useReducedMotion();
  const reduced = Boolean(reducedMotion);

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        {ctaLabel && (
          <motion.div {...kidsMotion.buttonMotion(reduced)}>
            <Button type="button" size="small" onClick={onCtaClick}>
              {ctaLabel}
            </Button>
          </motion.div>
        )}
      </Stack>

      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div
            key="kids-rail-empty"
            variants={kidsMotion.fadeScaleVariants(reduced)}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Typography variant="body2" color="text.secondary">
              {emptyMessage}
            </Typography>
          </motion.div>
        ) : (
          <motion.div
            key="kids-rail-list"
            variants={kidsMotion.listStaggerVariants(reduced)}
            initial="initial"
            animate="animate"
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 1,
              }}
            >
              {items.map(({ book, subtitle, progressPercent }) => (
                <motion.div key={book.id} variants={kidsMotion.listItemVariants(reduced)}>
                  <Box sx={{ minWidth: 180, maxWidth: 180 }}>
                    <motion.div
                      whileHover={reduced ? undefined : { scale: 1.02, y: -2 }}
                      whileTap={reduced ? undefined : { scale: 0.98 }}
                      transition={kidsMotion.transition(reduced, kidsMotion.duration.fast)}
                    >
                      <Card
                        sx={{
                          borderRadius: 2,
                          overflow: "hidden",
                          cursor: onItemClick ? "pointer" : "default",
                        }}
                        onClick={() => onItemClick?.(book.id)}
                      >
                        <Box
                          sx={{
                            height: 220,
                            bgcolor: "action.hover",
                            display: "grid",
                            placeItems: "center",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {book.coverImageUrl ? (
                            <Box
                              component="img"
                              src={book.coverImageUrl}
                              alt={book.title}
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <AutoStories sx={{ fontSize: 48, color: "text.disabled" }} />
                          )}
                        </Box>
                        {typeof progressPercent === "number" && (
                          <Box sx={{ height: 5, bgcolor: "action.hover" }}>
                            <Box
                              component={motion.div}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
                              transition={kidsMotion.transition(reduced)}
                              sx={{ height: "100%", bgcolor: "primary.main" }}
                            />
                          </Box>
                        )}
                      </Card>
                    </motion.div>
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }} noWrap>
                      {book.title}
                    </Typography>
                    <Typography variant="subtitle2" color="primary.main" noWrap>
                      {subtitle}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
}
