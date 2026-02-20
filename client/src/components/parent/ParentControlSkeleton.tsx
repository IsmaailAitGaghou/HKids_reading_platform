import { Box, Card, Skeleton, Stack } from "@mui/material";

export function ParentControlSkeleton() {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Skeleton variant="text" width={260} height={28} />
        <Skeleton variant="text" width={520} height={54} />
        <Skeleton variant="text" width={420} height={28} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 2.5,
        }}
      >
        <Stack spacing={2.5}>
          <Card sx={{ p: 3 }}>
            <Skeleton variant="rounded" height={220} />
          </Card>
          <Card sx={{ p: 3 }}>
            <Skeleton variant="rounded" height={240} />
          </Card>
          <Card sx={{ p: 3 }}>
            <Skeleton variant="rounded" height={220} />
          </Card>
        </Stack>

        <Stack spacing={2.5}>
          <Card sx={{ p: 3 }}>
            <Skeleton variant="rounded" height={220} />
          </Card>
          <Card sx={{ p: 3 }}>
            <Skeleton variant="rounded" height={180} />
          </Card>
          <Card sx={{ p: 3 }}>
            <Skeleton variant="rounded" height={140} />
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
