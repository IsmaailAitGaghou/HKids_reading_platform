import {
   Container,
   Typography,
   Stack,
   Grid,
   Card,
   CardContent,
   Button,
   Box,
} from "@mui/material";
import { useAuthContext } from "@/context/useAuthContext";
import { AutoStories, Logout } from "@mui/icons-material";

export function KidsLibrary() {
   const { user, logout } = useAuthContext();

   // Mock books
   const books = [
      { title: "Adventure Time", color: "#FF6B6B" },
      { title: "Space Journey", color: "#4ECDC4" },
      { title: "Magic Forest", color: "#95E1D3" },
      { title: "Ocean Tales", color: "#5B9BD5" },
      { title: "Dinosaur World", color: "#70AD47" },
      { title: "Fairy Friends", color: "#F4A7B9" },
   ];

   return (
      <Box
         sx={{
            minHeight: "100vh",
            backgroundColor: "background.kids",
            py: 4,
         }}
      >
         <Container maxWidth="xl">
            <Stack spacing={4}>
               {/* Header */}
               <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
               >
                  <Stack>
                     <Typography
                        variant="h3"
                        sx={{
                           fontWeight: 800,
                           color: "primary.main",
                           fontSize: { xs: "2rem", md: "3rem" },
                        }}
                     >
                        Welcome, {user?.name}! 📚
                     </Typography>
                     <Typography variant="h6" color="text.secondary">
                        What would you like to read today?
                     </Typography>
                  </Stack>
                  <Button
                     variant="outlined"
                     onClick={logout}
                     startIcon={<Logout />}
                     sx={{ borderRadius: 3 }}
                  >
                     Exit
                  </Button>
               </Stack>

               {/* Books Grid */}
               <Grid container spacing={3}>
                  {books.map((book, index) => (
                     <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card
                           sx={{
                              cursor: "pointer",
                              transition: "all 0.3s",
                              borderRadius: 3,
                              "&:hover": {
                                 transform: "scale(1.05)",
                                 boxShadow: (theme) => theme.shadows[16],
                              },
                           }}
                        >
                           <Box
                              sx={{
                                 height: 240,
                                 backgroundColor: book.color,
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                              }}
                           >
                              <AutoStories
                                 sx={{
                                    fontSize: 80,
                                    color: "white",
                                    opacity: 0.9,
                                 }}
                              />
                           </Box>
                           <CardContent>
                              <Typography
                                 variant="h6"
                                 sx={{ fontWeight: 700, textAlign: "center" }}
                              >
                                 {book.title}
                              </Typography>
                           </CardContent>
                        </Card>
                     </Grid>
                  ))}
               </Grid>

               {/* Empty State */}
               {books.length === 0 && (
                  <Stack
                     alignItems="center"
                     justifyContent="center"
                     sx={{ minHeight: 400 }}
                  >
                     <AutoStories
                        sx={{
                           fontSize: 100,
                           color: "primary.main",
                           opacity: 0.5,
                           mb: 2,
                        }}
                     />
                     <Typography variant="h5" color="text.secondary">
                        No books available yet
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                        Ask your parent to add some books for you!
                     </Typography>
                  </Stack>
               )}
            </Stack>
         </Container>
      </Box>
   );
}
