import { Box, Container, Skeleton, Stack } from "@mui/material";

export function DashboardSkeleton() {
   return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
         <Stack spacing={4}>
            {/* Header Skeleton */}
            <Box>
               <Skeleton variant="text" width={260} height={54} />
               <Skeleton variant="text" width={420} height={28} />
            </Box>

            {/* Stat Cards Skeleton */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
               {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                     key={index}
                     variant="rounded"
                     sx={{
                        flex: 1,
                        height: 140,
                        borderRadius: 3,
                     }}
                  />
               ))}
            </Stack>

            {/* Tabs and Filters Skeleton */}
            <Stack
               direction="row"
               justifyContent="space-between"
               alignItems="center"
            >
               <Skeleton variant="rounded" width={290} height={44} />
               <Skeleton variant="rounded" width={280} height={40} />
            </Stack>

            {/* Books Grid Skeleton */}
            <Box
               sx={{
                  display: "grid",
                  gridTemplateColumns: {
                     xs: "1fr",
                     sm: "repeat(2, 1fr)",
                     md: "repeat(3, 1fr)",
                     lg: "repeat(4, 1fr)",
                  },
                  gap: 3,
               }}
            >
               {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton
                     key={index}
                     variant="rounded"
                     sx={{
                        height: 320,
                        borderRadius: 3,
                     }}
                  />
               ))}
            </Box>
         </Stack>
      </Container>
   );
}
