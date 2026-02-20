import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Container, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext";
import { getBookResume, getKidsBooks } from "@/api/kids.api";
import { listPublicCategories } from "@/api/categories.api";
import {
  KidsBookRail,
  KidsFeaturedBook,
  KidsLibraryHeader,
  KidsLibrarySkeleton,
  KidsThemeTabs,
} from "@/components/kids";
import type { BookResumeData, KidsBook } from "@/types/book.types";
import { ROUTES } from "@/utils/constants";
import { isDailyReadingLimitReachedError } from "@/utils/readingLimits";

interface CategoryOption {
  key: string;
  label: string;
}

interface AllowedCategory {
  id: string;
  name: string;
  slug: string;
}

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
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [loadingResume, setLoadingResume] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [books, setBooks] = useState<KidsBook[]>([]);
  const [categories, setCategories] = useState<AllowedCategory[]>([]);
  const [resumeByBookId, setResumeByBookId] = useState<Record<string, BookResumeData>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadLibrary = async () => {
      try {
        setLoading(true);
        setError(null);
        const booksResponse = await getKidsBooks();
        if (!mounted) return;

        const normalizedBooks = (booksResponse.books || []).map((book) => ({
          ...book,
          categoryIds: Array.isArray(book.categoryIds) ? book.categoryIds : [],
        }));

        setBooks(normalizedBooks);
        setRemainingMinutes(booksResponse.remainingMinutes || 0);

        const responseCategories = booksResponse.categories || [];
        if (responseCategories.length > 0) {
          setCategories(responseCategories);
        } else {
          const uniqueCategoryIds = [...new Set(normalizedBooks.flatMap((book) => book.categoryIds))];

          if (uniqueCategoryIds.length > 0) {
            const categoriesResponse = await listPublicCategories();
            if (!mounted) return;
            const fallbackCategories = (categoriesResponse.categories || []).filter((category) =>
              uniqueCategoryIds.includes(category.id)
            );
            setCategories(fallbackCategories);
          } else {
            setCategories([]);
          }
        }
      } catch (loadError) {
        if (!mounted) return;
        if (isDailyReadingLimitReachedError(loadError)) {
          navigate(ROUTES.KIDS.SESSION_COMPLETE, { replace: true });
          return;
        }
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
  }, [navigate]);

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

  const categoryOptions = useMemo<CategoryOption[]>(
    () => [{ key: "all", label: "All" }, ...categories.map((category) => ({ key: category.id, label: category.name }))],
    [categories]
  );

  const filteredBooks = useMemo(() => {
    if (selectedCategoryId === "all") return books;
    return books.filter((book) => book.categoryIds.includes(selectedCategoryId));
  }, [books, selectedCategoryId]);

  useEffect(() => {
    if (featuredIndex >= filteredBooks.length) {
      setFeaturedIndex(0);
    }
  }, [featuredIndex, filteredBooks.length]);

  const selectedCategoryName = useMemo(() => {
    if (selectedCategoryId === "all") return "All";
    return categories.find((category) => category.id === selectedCategoryId)?.name || "Category";
  }, [categories, selectedCategoryId]);

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
            subtitle: progress >= 90 ? "Almost Done!" : `${Math.round(progress)}% Complete`,
          };
        })
        .filter((item) => item.progressPercent > 0 && item.progressPercent < 100),
    [filteredBooks, resumeByBookId]
  );

  const handleReadNow = async (bookId: string) => {
    navigate(ROUTES.KIDS.READING(bookId));
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
            options={categoryOptions}
            selectedKey={selectedCategoryId}
            onSelect={(value) => {
              setSelectedCategoryId(value);
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
            title={selectedCategoryId === "all" ? "Favorite Stories" : `Favorite ${selectedCategoryName} Stories`}
            ctaLabel="See all"
            onCtaClick={() => setSelectedCategoryId("all")}
            onItemClick={handleReadNow}
            items={favoriteRailItems}
            emptyMessage="No books found for this category."
          />

          <KidsBookRail
            title="Finish Reading"
            onItemClick={handleReadNow}
            items={continueReadingItems}
            emptyMessage={loadingResume ? "Loading reading progress..." : "No in-progress books yet."}
          />
        </Stack>
      </Container>
    </Box>
  );
}
