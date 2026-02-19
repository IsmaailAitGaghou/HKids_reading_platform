import {
   Box,
   Card,
   CardContent,
   Container,
   Skeleton,
   Stack,
} from "@mui/material";

export function FormLoadingSkeleton() {
   return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
         <Stack spacing={3}>
            {/* Back Button */}
            <Skeleton variant="rounded" width={120} height={40} />

            {/* Header */}
            <Box>
               <Skeleton variant="text" width={280} height={54} />
               <Skeleton variant="text" width={400} height={28} />
            </Box>

            {/* Form Card */}
            <Card sx={{ borderRadius: 3 }}>
               <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack spacing={2.5}>
                     {/* Title Field */}
                     <Skeleton variant="rounded" width="100%" height={56} />

                     {/* Summary Field */}
                     <Skeleton variant="rounded" width="100%" height={100} />

                     {/* Cover Image Section */}
                     <Stack spacing={1}>
                        <Skeleton variant="text" width={120} height={24} />
                        <Skeleton variant="rounded" width="100%" height={120} />
                     </Stack>

                     {/* Age Group Select */}
                     <Skeleton variant="rounded" width="100%" height={56} />

                     {/* Categories Select */}
                     <Skeleton variant="rounded" width="100%" height={56} />

                     {/* Tags Field */}
                     <Skeleton variant="rounded" width="100%" height={56} />

                     {/* Visibility Select */}
                     <Skeleton variant="rounded" width="100%" height={56} />

                     {/* Pages Section Header */}
                     <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ pt: 2 }}
                     >
                        <Skeleton variant="text" width={150} height={32} />
                        <Skeleton variant="rounded" width={140} height={36} />
                     </Stack>

                     {/* Page Cards */}
                     {Array.from({ length: 2 }).map((_, index) => (
                        <Skeleton
                           key={index}
                           variant="rounded"
                           width="100%"
                           height={280}
                           sx={{ borderRadius: 2 }}
                        />
                     ))}

                     {/* Action Buttons */}
                     <Stack
                        direction="row"
                        spacing={1.5}
                        justifyContent="flex-end"
                        sx={{ pt: 2 }}
                     >
                        <Skeleton variant="rounded" width={100} height={42} />
                        <Skeleton variant="rounded" width={140} height={42} />
                     </Stack>
                  </Stack>
               </CardContent>
            </Card>
         </Stack>
      </Container>
   );
}
