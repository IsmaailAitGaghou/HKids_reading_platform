import { ArrowBackIosNew, ArrowForwardIos, MenuBook } from "@mui/icons-material";
import { Box, Button, Card, CardContent, IconButton, Stack, Typography } from "@mui/material";
import type { KidsBook } from "@/types/book.types";

interface KidsFeaturedBookProps {
  book: KidsBook | null;
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onReadNow: (bookId: string) => void;
}

export function KidsFeaturedBook({
  book,
  currentIndex,
  total,
  onPrev,
  onNext,
  onReadNow,
}: KidsFeaturedBookProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <IconButton onClick={onPrev} type="button" sx={{ bgcolor: "background.paper", boxShadow: 2 }}>
        <ArrowBackIosNew fontSize="small" />
      </IconButton>

      <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {!book ? (
            <Typography variant="body1" color="text.secondary">
              No featured book available.
            </Typography>
          ) : (
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <Box
                sx={{
                  width: { xs: "100%", md: 230 },
                  minWidth: { md: 230 },
                  height: 260,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  bgcolor: "action.hover",
                  display: "grid",
                  placeItems: "center",
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
                  <MenuBook sx={{ fontSize: 56, color: "text.disabled" }} />
                )}
              </Box>

              <Stack spacing={1.5} sx={{ flex: 1 }}>
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 800 }}>
                  {`Featured ${currentIndex + 1}/${Math.max(total, 1)}`}
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "2rem", md: "2.8rem" } }}>
                  {book.title}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {book.summary || "A new adventure is waiting for you."}
                </Typography>
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<MenuBook />}
                  onClick={() => onReadNow(book.id)}
                  sx={{ width: "fit-content", mt: 1 }}
                >
                  Read Now
                </Button>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>

      <IconButton onClick={onNext} type="button" sx={{ bgcolor: "background.paper", boxShadow: 2 }}>
        <ArrowForwardIos fontSize="small" />
      </IconButton>
    </Stack>
  );
}

