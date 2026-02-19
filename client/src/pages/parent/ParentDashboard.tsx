import {
   Container,
   Typography,
   Stack,
   Paper,
   Grid,
   Card,
   CardContent,
   Button,
   Box,
} from "@mui/material";
import { useAuthContext } from "@/context/useAuthContext";
import {
   ChildCare,
   Analytics,
   Settings,
   Book,
   Timer,
   Star,
} from "@mui/icons-material";

export function ParentDashboard() {
   const { user, logout } = useAuthContext();

   const stats = [
      {
         title: "My Children",
         icon: <ChildCare />,
         count: "3",
         color: "#702AFA",
      },
      { title: "Books Read", icon: <Book />, count: "24", color: "#10B981" },
      {
         title: "Reading Time",
         icon: <Timer />,
         count: "12h",
         color: "#F59E0B",
      },
      { title: "Achievements", icon: <Star />, count: "8", color: "#EF4444" },
   ];

   return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
         <Stack spacing={4}>
            {/* Header */}
            <Paper sx={{ p: 3, backgroundColor: "background.default" }}>
               <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
               >
                  <Stack>
                     <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "primary.main" }}
                     >
                        Parent Dashboard
                     </Typography>
                     <Typography variant="body1" color="text.secondary">
                        Welcome back, {user?.name}
                     </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                     <Button variant="outlined" startIcon={<Settings />}>
                        Settings
                     </Button>
                     <Button variant="contained" onClick={logout}>
                        Logout
                     </Button>
                  </Stack>
               </Stack>
            </Paper>

            {/* Quick Stats */}
            <Grid container spacing={3}>
               {stats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                     <Card
                        sx={{
                           height: "100%",
                           cursor: "pointer",
                           transition: "all 0.2s",
                           "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: (theme) => theme.shadows[12],
                           },
                        }}
                     >
                        <CardContent>
                           <Stack spacing={2} alignItems="center">
                              <Box
                                 sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 2,
                                    backgroundColor: stat.color + "20",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                 }}
                              >
                                 <Box
                                    sx={{
                                       color: stat.color,
                                       "& svg": { fontSize: 32 },
                                    }}
                                 >
                                    {stat.icon}
                                 </Box>
                              </Box>
                              <Stack spacing={0.5} alignItems="center">
                                 <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 600 }}
                                 >
                                    {stat.count}
                                 </Typography>
                                 <Typography
                                    variant="body2"
                                    color="text.secondary"
                                 >
                                    {stat.title}
                                 </Typography>
                              </Stack>
                           </Stack>
                        </CardContent>
                     </Card>
                  </Grid>
               ))}
            </Grid>

            {/* Content Area */}
            <Paper sx={{ p: 4, minHeight: 400 }}>
               <Stack
                  spacing={3}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ minHeight: 300 }}
               >
                  <Analytics
                     sx={{ fontSize: 80, color: "primary.main", opacity: 0.5 }}
                  />
                  <Typography variant="h5" color="text.secondary">
                     Parent portal coming soon...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Track your children's reading progress and manage their
                     accounts
                  </Typography>
               </Stack>
            </Paper>
         </Stack>
      </Container>
   );
}
