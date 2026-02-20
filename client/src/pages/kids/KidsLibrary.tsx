import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Container, Snackbar, Stack } from "@mui/material";
import { useAuthContext } from "@/context/useAuthContext";
import { getBookResume, getKidsBooks, startReading } from "@/api/kids.api";
import {
  KidsBookRail,
  KidsBottomNav,
  KidsFeaturedBook,
  KidsLibraryHeader,
  KidsLibrarySkeleton,
  KidsThemeTabs,
} from "@/components/kids";
import type { BookResumeData, KidsBook } from "@/types/book.types";

interface ThemeOption {
  key: string;
  label: string;
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "into",
  "your",
  "have",
  "are",
  "our",
  "their",
  "book",
  "story",
]);

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const extractWords = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4 && !STOP_WORDS.has(word));

const calculateProgress = (book: KidsBook, resume?: BookResumeData) => {
  if (!resume || !resume.hasProgress) return 0;
  const pageCount = Math.max(book.pageCount, 1);
  return Math.min(Math.max(((resume.pageIndex + 1) / pageCount) * 100, 0), 100);
};

const getReadingLevel = (pageCount: number) => {
  const level = Math.max(1, Math.ceil(pageCount / 8));
  return `Level ${level} Reading`;
};

export function KidsLibrary() {
  const { user, logout } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [loadingResume, setLoadingResume] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [books, setBooks] = useState<KidsBook[]>([]);
  const [resumeByBookId, setResumeByBookId] = useState<Record<string, BookResumeData>>({});
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadLibrary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getKidsBooks();
        if (!mounted) return;

        setBooks(response.books || []);
        setRemainingMinutes(response.remainingMinutes || 0);
      } catch (loadError) {
        if (!mounted) return;
        const message =
          typeof loadError === "object" &&
          loadError !== null &&
          "error" in loadError &&
          typeof loadError.error === "string"
            ? loadError.error
            : "Failed to load library books.";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadLibrary();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (books.length === 0) {
      setResumeByBookId({});
      return;
    }

    let mounted = true;

    const loadResume = async () => {
      try {
        setLoadingResume(true);
        const resumes = await Promise.all(
          books.map(async (book) => {
            const resume = await getBookResume(book.id);
            return [book.id, resume] as const;
          })
        );

        if (!mounted) return;
        setResumeByBookId(Object.fromEntries(resumes));
      } catch {
        if (!mounted) return;
      } finally {
        if (mounted) setLoadingResume(false);
      }
    };

    void loadResume();
    return () => {
      mounted = false;
    };
  }, [books]);

  const themeOptions = useMemo<ThemeOption[]>(() => {
    const countMap = new Map<string, number>();

    for (const book of books) {
      const text = `${book.title} ${book.summary || ""}`;
      const uniqueWords = new Set(extractWords(text));
      uniqueWords.forEach((word) => {
        countMap.set(word, (countMap.get(word) || 0) + 1);
      });
    }

    const dynamicThemes = [...countMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => ({
        key: word,
        label: toTitleCase(word),
      }));

    return [{ key: "all", label: "All" }, ...dynamicThemes];
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (selectedTheme === "all") return books;
    return books.filter((book) => {
      const haystack = `${book.title} ${book.summary || ""}`.toLowerCase();
      return haystack.includes(selectedTheme.toLowerCase());
    });
  }, [books, selectedTheme]);

  useEffect(() => {
    if (featuredIndex >= filteredBooks.length) {
      setFeaturedIndex(0);
    }
  }, [featuredIndex, filteredBooks.length]);

  const featuredBook = filteredBooks.length > 0 ? filteredBooks[featuredIndex] : null;

  const favoriteRailItems = useMemo(
    () =>
      filteredBooks.map((book) => ({
        book,
        subtitle: getReadingLevel(book.pageCount),
      })),
    [filteredBooks]
  );

  const continueReadingItems = useMemo(
    () =>
      filteredBooks
        .map((book) => {
          const progress = calculateProgress(book, resumeByBookId[book.id]);
          return {
            book,
            progressPercent: progress,
            subtitle:
              progress >= 90
                ? "Almost Done!"
                : `${Math.round(progress)}% Complete`,
          };
        })
        .filter((item) => item.progressPercent > 0 && item.progressPercent < 100),
    [filteredBooks, resumeByBookId]
  );

  const handleReadNow = async (bookId: string) => {
    try {
      const response = await startReading({ bookId });
      setToastMessage(response.message || "Reading session started.");
    } catch {
      setToastMessage("Unable to start reading session.");
    }
  };

  const handlePrevFeatured = () => {
    if (filteredBooks.length <= 1) return;
    setFeaturedIndex((prev) => (prev - 1 + filteredBooks.length) % filteredBooks.length);
  };

  const handleNextFeatured = () => {
    if (filteredBooks.length <= 1) return;
    setFeaturedIndex((prev) => (prev + 1) % filteredBooks.length);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.kids", py: 3 }}>
        <Container maxWidth="xl">
          <KidsLibrarySkeleton />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.kids", py: 3 }}>
      <Container maxWidth="xl">
        <Stack spacing={3.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <KidsLibraryHeader
            childName={user?.name || "Child"}
            childAvatar={(user as { avatar?: string } | null)?.avatar}
            remainingMinutes={remainingMinutes}
            onLockClick={logout}
          />

          <KidsThemeTabs
            options={themeOptions}
            selectedKey={selectedTheme}
            onSelect={(value) => {
              setSelectedTheme(value);
              setFeaturedIndex(0);
            }}
          />

          <KidsFeaturedBook
            book={featuredBook}
            currentIndex={featuredIndex}
            total={filteredBooks.length}
            onPrev={handlePrevFeatured}
            onNext={handleNextFeatured}
            onReadNow={handleReadNow}
          />

          <KidsBookRail
            title={
              selectedTheme === "all"
                ? "Favorite Stories"
                : `Favorite ${toTitleCase(selectedTheme)} Stories`
            }
            ctaLabel="See all"
            onCtaClick={() => setSelectedTheme("all")}
            items={favoriteRailItems}
            emptyMessage="No books found for this theme."
          />

          <KidsBookRail
            title="Finish Reading"
            items={continueReadingItems}
            emptyMessage={loadingResume ? "Loading reading progress..." : "No in-progress books yet."}
          />

          <KidsBottomNav />
        </Stack>
      </Container>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={2600}
        onClose={() => setToastMessage(null)}
        message={toastMessage || ""}
      />
    </Box>
  );
}

