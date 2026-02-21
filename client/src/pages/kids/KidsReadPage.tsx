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
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useNavigate, useParams } from "react-router-dom";
import { endReading, getKidsBook, getKidsBookPages, startReading, trackProgress } from "@/api/kids.api";
import type { BookPage, KidsBook } from "@/types/book.types";
import { ROUTES } from "@/utils/constants";
import { isDailyReadingLimitReachedError } from "@/utils/readingLimits";

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

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
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfRenderLoading, setPdfRenderLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfViewportVersion, setPdfViewportVersion] = useState(0);
  const endedSessionRef = useRef(false);
  const sessionRef = useRef<SessionState | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfViewportRef = useRef<HTMLDivElement | null>(null);

  const isPdfBook = (book?.contentType || "structured") === "pdf";
  const currentPage = isPdfBook ? null : pages[currentIndex] || null;
  const totalPages = isPdfBook ? Math.max(book?.pdfPageCount || 0, 0) : pages.length;
  const displayedPageNumber = isPdfBook ? currentIndex + 1 : currentPage?.pageNumber || currentIndex + 1;
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

        const contentType = bookRes.contentType || pagesRes.book.contentType || "structured";
        const safePages = [...pagesRes.pages].sort((a, b) => a.pageNumber - b.pageNumber);
        const resolvedPdfPageCount = Math.max(
          bookRes.pdfPageCount || pagesRes.book.pdfPageCount || pagesRes.book.pageCount || 0,
          0
        );
        const pageCount = contentType === "pdf" ? resolvedPdfPageCount : safePages.length;
        const safeStartIndex = Math.max(
          0,
          Math.min(sessionRes.session.resumePageIndex || 0, Math.max(pageCount - 1, 0))
        );

        setBook({
          ...bookRes,
          contentType,
          pdfUrl: bookRes.pdfUrl || pagesRes.book.pdfUrl || "",
          pdfPageCount: resolvedPdfPageCount,
        });
        setPages(contentType === "structured" ? safePages : []);
        setSession({
          id: sessionRes.session.id,
          resumed: sessionRes.session.resumed,
        });
        setCurrentIndex(safeStartIndex);
      } catch (loadError) {
        if (mounted && isDailyReadingLimitReachedError(loadError)) {
          navigate(ROUTES.KIDS.SESSION_COMPLETE, { replace: true });
          return;
        }

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
  }, [id, navigate]);

  useEffect(() => {
    if (!session || totalPages < 1) return;
    void trackProgress({
      sessionId: session.id,
      pageIndex: currentIndex,
    });
  }, [session, currentIndex, totalPages]);

  useEffect(() => {
    if (isPdfBook || !readToMe || !currentPage?.text) {
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
  }, [isPdfBook, readToMe, currentPage?.text]);

  useEffect(() => {
    if (!isPdfBook || !book?.pdfUrl) {
      setPdfDocument(null);
      setPdfError(null);
      return;
    }

    let cancelled = false;
    const task = getDocument(book.pdfUrl);

    const loadPdf = async () => {
      try {
        setPdfLoading(true);
        setPdfError(null);
        const nextDocument = await task.promise;
        if (cancelled) return;
        setPdfDocument(nextDocument);
      } catch {
        if (cancelled) return;
        setPdfDocument(null);
        setPdfError("Failed to load this PDF book.");
      } finally {
        if (!cancelled) setPdfLoading(false);
      }
    };

    void loadPdf();
    return () => {
      cancelled = true;
      void task.destroy();
    };
  }, [isPdfBook, book?.pdfUrl]);

  useEffect(() => {
    if (!isPdfBook || !pdfDocument) return;

    let cancelled = false;

    const renderPdfPage = async () => {
      try {
        setPdfRenderLoading(true);
        setPdfError(null);

        const canvas = pdfCanvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Missing PDF canvas context");

        const pageNumber = Math.min(Math.max(currentIndex + 1, 1), Math.max(totalPages, 1));
        const page = await pdfDocument.getPage(pageNumber);

        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const viewportContainer = pdfViewportRef.current;
        const availableWidth = Math.max((viewportContainer?.clientWidth ?? window.innerWidth) - 16, 120);
        const availableHeight = Math.max((viewportContainer?.clientHeight ?? window.innerHeight) - 16, 120);
        const widthScale = availableWidth / baseViewport.width;
        const heightScale = availableHeight / baseViewport.height;
        const scale = Math.max(Math.min(widthScale, heightScale), 0.1);
        const viewport = page.getViewport({ scale });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
      } catch {
        if (cancelled) return;
        setPdfError("Failed to render this PDF page.");
      } finally {
        if (!cancelled) setPdfRenderLoading(false);
      }
    };

    void renderPdfPage();
    return () => {
      cancelled = true;
    };
  }, [isPdfBook, pdfDocument, currentIndex, totalPages, pdfViewportVersion]);

  useEffect(() => {
    if (!isPdfBook) return;
    const onResize = () => setPdfViewportVersion((prev) => prev + 1);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [isPdfBook]);

  const handleGoHome = async () => {
    const activeSession = sessionRef.current;
    if (!activeSession) {
      navigate(ROUTES.KIDS.LIBRARY);
      return;
    }

    try {
      const response = await endReading({ sessionId: activeSession.id });
      endedSessionRef.current = true;

      if (response.limits.remainingMinutes <= 0) {
        navigate(ROUTES.KIDS.SESSION_COMPLETE, { replace: true });
        return;
      }
    } catch {
      await safelyEndSession(activeSession);
    }

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

  if (error || !book || totalPages < 1 || (!isPdfBook && !currentPage)) {
    return (
      <Stack spacing={2} sx={{ minHeight: "100vh", p: 3 }}>
        <Alert severity="error">{error || "Unable to open reader."}</Alert>
        <Button variant="contained" onClick={() => navigate(ROUTES.KIDS.LIBRARY)} type="button">
          Back to Library
        </Button>
      </Stack>
    );
  }

  const safeCurrentPage = currentPage as BookPage;

  return (
    <Box
      sx={{
        height: "100dvh",
        maxWidth: "xl",
        mx: "auto",
        bgcolor: "background.default",
        p: { xs: 1.5, md: 2.5 },
        overflow: "hidden",
      }}
    >
      <Stack spacing={2} sx={{ height: "100%", minHeight: 0 }}>
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
                {`${book.title} - Page ${displayedPageNumber} of ${totalPages}`}
              </Typography>
            </Box>
          </Stack>

          {!isPdfBook && (
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
          )}
        </Stack>

        {isPdfBook ? (
          <Card sx={{ borderRadius: 3, overflow: "hidden", position: "relative", flex: 1, minHeight: 0 }}>
            <Box
              ref={pdfViewportRef}
              sx={{
                height: "100%",
                minHeight: 0,
                bgcolor: "background.paper",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 1,
                position: "relative",
              }}
            >
              {(pdfLoading || pdfRenderLoading) && (
                <Stack sx={{ alignItems: "center", gap: 1.25 }}>
                  <CircularProgress />
                </Stack>
              )}

              {!pdfLoading && !pdfRenderLoading && pdfError && (
                <Alert severity="error" sx={{ maxWidth: 520 }}>
                  {pdfError}
                </Alert>
              )}

              <Box
                component="canvas"
                ref={pdfCanvasRef}
                sx={{
                  width: "auto",
                  maxWidth: "100%",
                  height: "auto",
                  maxHeight: "100%",
                  display: pdfError ? "none" : "block",
                }}
              />

              <IconButton
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0 || pdfLoading || pdfRenderLoading}
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

              <IconButton
                type="button"
                onClick={handleNext}
                disabled={currentIndex === totalPages - 1 || pdfLoading || pdfRenderLoading}
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
            </Box>
          </Card>
        ) : (
          <Card
            sx={{ borderRadius: 3, overflow: "hidden", position: "relative", flex: 1, minHeight: 0 }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "50% 50%" },
                height: "100%",
                minHeight: 0,
              }}
            >
              <Box sx={{ position: "relative", bgcolor: "action.hover" }}>
                {safeCurrentPage.imageUrl ? (
                  <Box
                    component="img"
                    src={safeCurrentPage.imageUrl}
                    alt={
                      safeCurrentPage.title ||
                      `Page ${safeCurrentPage.pageNumber}`
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
                  overflowY: "auto",
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}>
                  {safeCurrentPage.title || `Page ${safeCurrentPage.pageNumber}`}
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
                    : [safeCurrentPage.text || ""]
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
                  {safeCurrentPage.pageNumber}
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
        )}

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
