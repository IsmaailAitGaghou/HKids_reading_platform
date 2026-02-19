import {
   Box,
   Card,
   CardActionArea,
   CardContent,
   Chip,
   IconButton,
   Stack,
   Typography,
   useTheme,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import type { MouseEvent } from "react";
import type { Book } from "../../types/book.types";

interface BookCardProps {
   book: Book;
   statusChipSx: (status: string) => Record<string, unknown>;
   ageGroupLabel: string;
   categoryLabel: string;
   onCardClick: () => void;
   onMenuClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function BookCard({
   book,
   statusChipSx,
   ageGroupLabel,
   categoryLabel,
   onCardClick,
   onMenuClick,
}: BookCardProps) {
   const theme = useTheme();

   return (
      <Card
         sx={{
            position: "relative",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: 1,
            transition: "all 200ms ease",
            "&:hover": {
               boxShadow: 4,
               transform: "translateY(-4px)",
            },
         }}
      >
         <CardActionArea onClick={onCardClick}>
            <Box
               sx={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "133.33%",
                  bgcolor: "grey.100",
                  backgroundImage: book.coverImageUrl
                     ? `url(${book.coverImageUrl})`
                     : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
               }}
            >
               <Chip
                  label={book.status?.toUpperCase() || "DRAFT"}
                  size="small"
                  sx={statusChipSx(book.status || "draft")}
               />
            </Box>

            <CardContent sx={{ p: 2 }}>
               <Stack spacing={1}>
                  <Typography
                     variant="h6"
                     sx={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minHeight: "2.6em",
                     }}
                  >
                     {book.title}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                     <Chip
                        label={ageGroupLabel}
                        size="small"
                        sx={{
                           bgcolor: theme.palette.primary.main,
                           color: theme.palette.common.white,
                           fontWeight: 600,
                           fontSize: "0.7rem",
                        }}
                     />
                     <Chip
                        label={categoryLabel}
                        size="small"
                        variant="outlined"
                        sx={{
                           fontWeight: 600,
                           fontSize: "0.7rem",
                        }}
                     />
                  </Stack>
               </Stack>
            </CardContent>
         </CardActionArea>

         <IconButton
            size="small"
            onClick={onMenuClick}
            sx={{
               position: "absolute",
               top: 8,
               right: 8,
               bgcolor: "background.paper",
               boxShadow: 2,
               "&:hover": {
                  bgcolor: "background.paper",
               },
            }}
         >
            <MoreVert fontSize="small" />
         </IconButton>
      </Card>
   );
}
