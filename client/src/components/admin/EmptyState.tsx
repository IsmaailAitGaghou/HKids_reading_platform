import {
   alpha,
   Box,
   Button,
   Card,
   Stack,
   Typography,
   useTheme,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import type { ReactNode } from "react";

interface EmptyStateProps {
   icon?: ReactNode;
   title: string;
   description: string;
   actionLabel?: string;
   onAction?: () => void;
}

export function EmptyState({
   icon,
   title,
   description,
   actionLabel,
   onAction,
}: EmptyStateProps) {
   const theme = useTheme();

   return (
      <Card
         sx={{
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            borderRadius: 3,
            border: "1px dashed",
            borderColor: alpha(theme.palette.primary.main, 0.35),
            bgcolor: alpha(theme.palette.primary.main, 0.04),
         }}
      >
         <Stack spacing={2} alignItems="center">
            {icon && (
               <Box
                  sx={{
                     width: 64,
                     height: 64,
                     borderRadius: "50%",
                     display: "grid",
                     placeItems: "center",
                     bgcolor: alpha(theme.palette.primary.main, 0.12),
                     color: theme.palette.primary.main,
                  }}
               >
                  {icon}
               </Box>
            )}

            <Box>
               <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {title}
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  {description}
               </Typography>
            </Box>

            {actionLabel && onAction && (
               <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={onAction}
                  sx={{ mt: 1 }}
               >
                  {actionLabel}
               </Button>
            )}
         </Stack>
      </Card>
   );
}
