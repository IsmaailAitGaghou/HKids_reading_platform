import { Box, Skeleton, Stack } from "@mui/material";

export function ParentProgressDashboardSkeleton() {
  return (
    <Stack spacing={2.5}>
      <Skeleton variant="text" width={260} height={42} />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={102} sx={{ flex: 1, borderRadius: 2 }} />
        ))}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "2fr 1fr" },
          gap: 2.5,
        }}
      >
        <Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" height={240} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" height={240} sx={{ borderRadius: 2 }} />
      </Box>
    </Stack>
  );
}

