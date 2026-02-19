import type { CardProps } from "@mui/material/Card";
import { Box, Card, Typography, Stack } from "@mui/material";
import { fNumber, fPercent } from "@/utils/formatters";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

interface Props extends CardProps {
   title: string;
   total: number;
   percent: number;
   icon: React.ReactNode;
   color?: string;
}

export function WidgetSummary({
   title,
   total,
   percent,
   icon,
   color = "primary.main",
   sx,
   ...other
}: Props) {
   const isPositive = percent >= 0;

   return (
      <Card
         sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 3,
            boxShadow: (theme) => theme.shadows[2],
            ...sx,
         }}
         {...other}
      >
         {/* Icon Section */}
         <Box
            sx={{
               width: 64,
               height: 64,
               borderRadius: 2,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               backgroundColor: color,
               color: "white",
               flexShrink: 0,
            }}
         >
            {icon}
         </Box>

         {/* Content Section */}
         <Stack spacing={0.5} flex="1">
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
               {fNumber(total)}
            </Typography>

            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
               {title}
            </Typography>

            {/* Trending */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
               {isPositive ? (
                  <TrendingUp sx={{ fontSize: 20, color: "success.main" }} />
               ) : (
                  <TrendingDown sx={{ fontSize: 20, color: "error.main" }} />
               )}
               <Typography
                  variant="body2"
                  sx={{
                     fontWeight: 600,
                     color: isPositive ? "success.main" : "error.main",
                  }}
               >
                  {isPositive && "+"}
                  {fPercent(percent)}
               </Typography>
               <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  vs last month
               </Typography>
            </Stack>
         </Stack>
      </Card>
   );
}
