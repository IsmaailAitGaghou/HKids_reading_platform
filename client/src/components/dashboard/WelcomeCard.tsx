import type { BoxProps } from "@mui/material/Box";
import { Box, Typography, Stack } from "@mui/material";

interface Props extends BoxProps {
   title: string;
   description?: string;
   img?: React.ReactNode;
   action?: React.ReactNode;
}

export function WelcomeCard({
   title,
   description,
   action,
   img,
   sx,
   ...other
}: Props) {
   return (
      <Box
         sx={{
            position: "relative",
            borderRadius: 2,
            overflow: "hidden",
            background: (theme) =>
               `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            p: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 240,
            ...sx,
         }}
         {...other}
      >
         {/* Content */}
         <Stack spacing={2} sx={{ flex: "1 1 auto", zIndex: 2 }}>
            <Typography
               variant="h4"
               sx={{ fontWeight: 700, whiteSpace: "pre-line" }}
            >
               {title}
            </Typography>

            {description && (
               <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 420 }}>
                  {description}
               </Typography>
            )}

            {action && <Box sx={{ mt: 2 }}>{action}</Box>}
         </Stack>

         {/* Image/Illustration */}
         {img && (
            <Box
               sx={{
                  position: "relative",
                  maxWidth: 240,
                  zIndex: 1,
                  display: { xs: "none", md: "block" },
               }}
            >
               {img}
            </Box>
         )}

         {/* Background Pattern */}
         <Box
            sx={{
               position: "absolute",
               top: 0,
               right: 0,
               width: "50%",
               height: "100%",
               opacity: 0.05,
               backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm10 10h20v20H10V10z' fill='%23fff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
            }}
         />
      </Box>
   );
}
