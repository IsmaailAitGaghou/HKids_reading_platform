import { Box, Card, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface StatCardProps {
   label: string;
   value: string;
   helper?: ReactNode;
   icon: ReactNode;
   iconBg: string;
}

export function StatCard({
   label,
   value,
   helper,
   icon,
   iconBg,
}: StatCardProps) {
   return (
      <Card
         sx={{
            flex: 1,
            p: 3,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 1,
            transition: "transform 200ms ease, box-shadow 200ms ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
         }}
      >
         <Stack spacing={1.5}>
            <Stack
               direction="row"
               alignItems="center"
               justifyContent="space-between"
            >
               <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
               >
                  {label}
               </Typography>

               <Box
                  sx={{
                     width: 40,
                     height: 40,
                     borderRadius: 2,
                     display: "grid",
                     placeItems: "center",
                     bgcolor: iconBg,
                  }}
               >
                  {icon}
               </Box>
            </Stack>

            <Typography
               variant="h3"
               sx={{ fontWeight: 800, fontSize: "2rem", lineHeight: 1.1 }}
            >
               {value}
            </Typography>

            {helper}
         </Stack>
      </Card>
   );
}
