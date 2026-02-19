import { z as zod } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
   Box,
   Link,
   Alert,
   Typography,
   Stack,
   Card,
   Container,
   TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FaceRetouchingNatural, ArrowBack } from "@mui/icons-material";
import { useAuthContext } from "@/context/useAuthContext";
import { ROUTES } from "@/utils/constants";

// Validation Schema
const ChildLoginSchema = zod.object({
   childId: zod.string().min(1, { message: "Child ID is required" }),
   pin: zod
      .string()
      .min(4, { message: "PIN must be 4 digits" })
      .max(4, { message: "PIN must be 4 digits" })
      .regex(/^\d+$/, { message: "PIN must contain only numbers" }),
});

type ChildLoginSchemaType = zod.infer<typeof ChildLoginSchema>;

export function ChildLoginPage() {
   const { loginWithPin } = useAuthContext();
   const [searchParams] = useSearchParams();
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

   // Get childId from URL param if available
   const urlChildId = searchParams.get("childId") || "";

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<ChildLoginSchemaType>({
      resolver: zodResolver(ChildLoginSchema),
      defaultValues: {
         childId: urlChildId,
         pin: "",
      },
   });

   const onSubmit = async (data: ChildLoginSchemaType) => {
      try {
         setErrorMessage(null);
         await loginWithPin(data.childId, data.pin);
      } catch (error: unknown) {
         console.error(error);
         const message =
            error instanceof Error ? error.message : "Invalid PIN or Child ID";
         setErrorMessage(message);
      }
   };

   return (
      <Box
         sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "background.kids", // Kids theme background
            py: 6,
         }}
      >
         <Container maxWidth="sm">
            <Card
               sx={{
                  p: { xs: 3, md: 5 },
                  boxShadow: (theme) => theme.shadows[20],
                  borderRadius: 4,
                  background:
                     "linear-gradient(135deg, #FEFCF6 0%, #F2E6F5 100%)",
               }}
            >
               <Stack spacing={4}>
                  {/* Header */}
                  <Stack spacing={2} alignItems="center">
                     <Box
                        sx={{
                           width: 80,
                           height: 80,
                           borderRadius: "50%",
                           backgroundColor: "primary.main",
                           display: "flex",
                           alignItems: "center",
                           justifyContent: "center",
                           mb: 1,
                        }}
                     >
                        <FaceRetouchingNatural
                           sx={{ fontSize: 48, color: "white" }}
                        />
                     </Box>
                     <Typography
                        variant="h3"
                        sx={{
                           fontWeight: 700,
                           color: "primary.main",
                           textAlign: "center",
                        }}
                     >
                        Welcome Back!
                     </Typography>
                     <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ textAlign: "center", maxWidth: 360 }}
                     >
                        Enter your 4-digit PIN to continue reading
                     </Typography>
                  </Stack>

                  {/* Error Alert */}
                  {errorMessage && (
                     <Alert
                        severity="error"
                        onClose={() => setErrorMessage(null)}
                     >
                        {errorMessage}
                     </Alert>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)}>
                     <Stack spacing={3}>
                        {/* Child ID Field (hidden if provided via URL) */}
                        {!urlChildId && (
                           <TextField
                              {...register("childId")}
                              label="Child ID"
                              placeholder="Enter your child ID"
                              fullWidth
                              error={!!errors.childId}
                              helperText={errors.childId?.message}
                              InputProps={{
                                 style: {
                                    fontSize: "18px",
                                    borderRadius: "12px",
                                 },
                              }}
                           />
                        )}

                        {/* PIN Field */}
                        <Box>
                           <input
                              {...register("pin")}
                              type="text"
                              inputMode="numeric"
                              maxLength={4}
                              placeholder="Enter PIN"
                              style={{
                                 width: "100%",
                                 padding: "20px 24px",
                                 fontSize: "32px",
                                 fontWeight: 700,
                                 textAlign: "center",
                                 letterSpacing: "12px",
                                 border: `2px solid ${
                                    errors.pin ? "#EF4444" : "#702AFA"
                                 }`,
                                 borderRadius: "16px",
                                 outline: "none",
                                 transition: "all 0.2s",
                                 backgroundColor: "white",
                              }}
                              onFocus={(e) => {
                                 e.target.style.borderColor = "#702AFA";
                                 e.target.style.boxShadow =
                                    "0 0 0 4px rgba(112, 42, 250, 0.15)";
                              }}
                              onBlur={(e) => {
                                 e.target.style.borderColor = errors.pin
                                    ? "#EF4444"
                                    : "#702AFA";
                                 e.target.style.boxShadow = "none";
                              }}
                           />
                           {errors.pin && (
                              <Typography
                                 variant="body2"
                                 color="error"
                                 sx={{
                                    mt: 1.5,
                                    textAlign: "center",
                                    fontWeight: 500,
                                 }}
                              >
                                 {errors.pin.message}
                              </Typography>
                           )}
                        </Box>

                        {/* Submit Button */}
                        <LoadingButton
                           fullWidth
                           size="large"
                           type="submit"
                           variant="contained"
                           loading={isSubmitting}
                           sx={{
                              py: 2,
                              fontSize: "1.125rem",
                              fontWeight: 700,
                              textTransform: "none",
                              borderRadius: 3,
                              boxShadow: (theme) => theme.shadows[8],
                           }}
                        >
                           Start Reading
                        </LoadingButton>

                        {/* Help Text */}
                        <Typography
                           variant="body2"
                           color="text.secondary"
                           sx={{ textAlign: "center", fontStyle: "italic" }}
                        >
                           Ask your parent if you forgot your PIN
                        </Typography>
                     </Stack>
                  </form>

                  {/* Back to Login Link */}
                  <Link
                     component={RouterLink}
                     to={ROUTES.LOGIN}
                     sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                        color: "primary.main",
                        textDecoration: "none",
                        fontWeight: 600,
                        "&:hover": {
                           textDecoration: "underline",
                        },
                     }}
                  >
                     <ArrowBack sx={{ fontSize: 18 }} />
                     Parent Sign In
                  </Link>
               </Stack>
            </Card>
         </Container>
      </Box>
   );
}
