import { AutoStories } from "@mui/icons-material";
import { Box, Card, Stack, Typography, Button } from "@mui/material";
import type { KidsBook } from "@/types/book.types";

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
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        {ctaLabel && (
          <Button type="button" size="small" onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        )}
      </Stack>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 1,
          }}
        >
          {items.map(({ book, subtitle, progressPercent }) => (
            <Box key={book.id} sx={{ minWidth: 180, maxWidth: 180 }}>
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
                      sx={{
                        height: "100%",
                        width: `${Math.min(Math.max(progressPercent, 0), 100)}%`,
                        bgcolor: "primary.main",
                      }}
                    />
                  </Box>
                )}
              </Card>
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }} noWrap>
                {book.title}
              </Typography>
              <Typography variant="subtitle2" color="primary.main" noWrap>
                {subtitle}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Stack>
  );
}
