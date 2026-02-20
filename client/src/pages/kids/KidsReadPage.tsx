import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  VolumeUp,
  VolumeOff,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { endReading, getKidsBook, getKidsBookPages, startReading, trackProgress } from "@/api/kids.api";
import type { BookPage, KidsBook } from "@/types/book.types";
import { ROUTES } from "@/utils/constants";

interface SessionState {
  id: string;
  resumed: boolean;
}

const splitParagraphs = (text: string) =>
  text
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

export function KidsReadPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [book, setBook] = useState<KidsBook | null>(null);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [session, setSession] = useState<SessionState | null>(null);
  const [readToMe, setReadToMe] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const endedSessionRef = useRef(false);
  const sessionRef = useRef<SessionState | null>(null);

  const currentPage = pages[currentIndex] || null;
  const totalPages = pages.length;
  const progressPercent = totalPages > 0 ? ((currentIndex + 1) / totalPages) * 100 : 0;

  const pageParagraphs = useMemo(
    () => splitParagraphs(currentPage?.text || ""),
    [currentPage?.text]
  );

  const safelyEndSession = async (nextSession: SessionState | null) => {
    if (!nextSession || endedSessionRef.current) return;
    endedSessionRef.current = true;
    try {
      await endReading({ sessionId: nextSession.id });
    } catch {
      endedSessionRef.current = false;
    }
  };

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (!id) {
      setError("Invalid book id.");
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadReader = async () => {
      try {
        setLoading(true);
        setError(null);
        endedSessionRef.current = false;

        const [bookRes, pagesRes, sessionRes] = await Promise.all([
          getKidsBook(id),
          getKidsBookPages(id),
          startReading({ bookId: id }),
        ]);

        if (!mounted) return;

        const safePages = [...pagesRes].sort((a, b) => a.pageNumber - b.pageNumber);
        const safeStartIndex = Math.max(
          0,
          Math.min(sessionRes.session.resumePageIndex || 0, Math.max(safePages.length - 1, 0))
        );

        setBook(bookRes);
        setPages(safePages);
        setSession({
          id: sessionRes.session.id,
          resumed: sessionRes.session.resumed,
        });
        setCurrentIndex(safeStartIndex);
      } catch (loadError) {
        const message =
          typeof loadError === "object" &&
          loadError !== null &&
          "error" in loadError &&
          typeof loadError.error === "string"
            ? loadError.error
            : "Failed to open reader.";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadReader();
    return () => {
      mounted = false;
      window.speechSynthesis?.cancel();
      const latestSession = sessionRef.current;
      if (latestSession && !endedSessionRef.current) {
        endedSessionRef.current = true;
        void endReading({ sessionId: latestSession.id });
      }
    };
  }, [id]);

  useEffect(() => {
    if (!session || !currentPage) return;
    void trackProgress({
      sessionId: session.id,
      pageIndex: currentIndex,
    });
  }, [session, currentPage, currentIndex]);

  useEffect(() => {
    if (!readToMe || !currentPage?.text) {
      window.speechSynthesis?.cancel();
      return;
    }

    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(currentPage.text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    synth.speak(utterance);

    return () => {
      synth.cancel();
    };
  }, [readToMe, currentPage?.text]);

  const handleGoHome = async () => {
    await safelyEndSession(sessionRef.current);
    navigate(ROUTES.KIDS.LIBRARY);
  };

  const handlePrev = () => {
    if (currentIndex <= 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex >= totalPages - 1) return;
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <Stack sx={{ minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error || !book || !currentPage) {
    return (
      <Stack spacing={2} sx={{ minHeight: "100vh", p: 3 }}>
        <Alert severity="error">{error || "Unable to open reader."}</Alert>
        <Button variant="contained" onClick={() => navigate(ROUTES.KIDS.LIBRARY)} type="button">
          Back to Library
        </Button>
      </Stack>
    );
  }

  return (
     <Box
        sx={{
           minHeight: "100vh",
           maxWidth: "xl",
           mx: "auto",
           bgcolor: "background.default",
           p: { xs: 1.5, md: 2.5 },
        }}
     >
        <Stack spacing={2}>
           <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
           >
              <Stack direction="row" spacing={1.5} alignItems="center">
                 <IconButton
                    onClick={handleGoHome}
                    type="button"
                    sx={{ bgcolor: "background.paper", boxShadow: 1 }}
                 >
                    <Home fontSize="small" />
                 </IconButton>
                 <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                       HKids Reader
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                       {`${book.title} - Page ${currentPage.pageNumber}`}
                    </Typography>
                 </Box>
              </Stack>

              <Stack direction="row" spacing={1}>
                 <Button
                    type="button"
                    variant="contained"
                    startIcon={readToMe ? <VolumeOff /> : <VolumeUp />}
                    onClick={() => setReadToMe((prev) => !prev)}
                 >
                    {readToMe ? "Stop Reading" : "Read to Me"}
                 </Button>
              </Stack>
           </Stack>

           <Card
              sx={{ borderRadius: 3, overflow: "hidden", position: "relative" }}
           >
              <Box
                 sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "44% 56%" },
                    minHeight: { xs: 560, md: 720 },
                 }}
              >
                 <Box sx={{ position: "relative", bgcolor: "action.hover" }}>
                    {currentPage.imageUrl ? (
                       <Box
                          component="img"
                          src={currentPage.imageUrl}
                          alt={
                             currentPage.title ||
                             `Page ${currentPage.pageNumber}`
                          }
                          sx={{
                             width: "100%",
                             height: "100%",
                             objectFit: "cover",
                          }}
                       />
                    ) : (
                       <Stack
                          sx={{
                             height: "100%",
                             alignItems: "center",
                             justifyContent: "center",
                             p: 3,
                          }}
                       >
                          <Typography variant="h6" color="text.secondary">
                             No image for this page
                          </Typography>
                       </Stack>
                    )}

                    <IconButton
                       type="button"
                       onClick={handlePrev}
                       disabled={currentIndex === 0}
                       sx={{
                          position: "absolute",
                          left: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          bgcolor: "background.paper",
                          boxShadow: 2,
                       }}
                    >
                       <ChevronLeft />
                    </IconButton>
                 </Box>

                 <Box
                    sx={{
                       p: { xs: 2, md: 5 },
                       display: "flex",
                       flexDirection: "column",
                       justifyContent: "center",
                    }}
                 >
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}>
                       {currentPage.title || `Page ${currentPage.pageNumber}`}
                    </Typography>

                    <Stack
                       spacing={3}
                       sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          height: "100%",
                       }}
                    >
                       {(pageParagraphs.length > 0
                          ? pageParagraphs
                          : [currentPage.text || ""]
                       ).map((paragraph, idx) => (
                          <Typography
                             key={idx}
                             variant="h4"
                             sx={{ fontWeight: 400, lineHeight: 1.25 }}
                          >
                             {paragraph}
                          </Typography>
                       ))}
                    </Stack>

                    <Typography
                       variant="caption"
                       color="text.secondary"
                       sx={{ mt: "auto", alignSelf: "flex-end" }}
                    >
                       {currentPage.pageNumber}
                    </Typography>
                 </Box>
              </Box>

              <IconButton
                 type="button"
                 onClick={handleNext}
                 disabled={currentIndex === totalPages - 1}
                 sx={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "background.paper",
                    boxShadow: 2,
                 }}
              >
                 <ChevronRight />
              </IconButton>
           </Card>

           <Box sx={{ maxWidth: "100%", mx: "auto", width: "100%" }}>
              <LinearProgress
                 variant="determinate"
                 value={progressPercent}
                 sx={{ height: 8, borderRadius: 999 }}
              />
              <Typography
                 variant="overline"
                 sx={{ display: "block", textAlign: "center", mt: 0.75 }}
              >
                 {`READING PROGRESS: ${Math.round(progressPercent)}%`}
              </Typography>
           </Box>
        </Stack>

        <Snackbar
           open={Boolean(snackbar)}
           autoHideDuration={2200}
           onClose={() => setSnackbar(null)}
           message={snackbar || ""}
        />
     </Box>
  );
}
