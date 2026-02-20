import { Box, Skeleton, Stack } from "@mui/material";

export function KidsLibrarySkeleton() {
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Skeleton variant="rounded" width={180} height={52} />
        <Skeleton variant="rounded" width={220} height={52} />
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ overflow: "hidden" }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" width={108} height={110} />
        ))}
      </Stack>

      <Skeleton variant="rounded" height={310} />

      <Box>
        <Skeleton variant="text" width={280} height={40} />
        <Stack direction="row" spacing={2} sx={{ overflow: "hidden" }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" width={180} height={260} />
          ))}
        </Stack>
      </Box>

      <Box>
        <Skeleton variant="text" width={220} height={40} />
        <Stack direction="row" spacing={2} sx={{ overflow: "hidden" }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" width={220} height={240} />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

