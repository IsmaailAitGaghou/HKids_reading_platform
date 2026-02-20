import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Link,
  Alert,
  IconButton,
  Stack,
  Card,
  Container,
  InputAdornment,
  Typography,
  Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthContext } from '@/context/useAuthContext';
import { ROUTES } from '@/utils/constants';
import { Form, Field } from '@/components/hook-form';
import { FormHead } from '@/components/auth/FormHead';

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function LoginPage() {
  const { login } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: SignInSchemaType = {
    email: '',
    password: '',
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);
      await login(data.email, data.password);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : 'Invalid email or password';
      setErrorMessage(message);
    }
  });

  const renderForm = () => (
     <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
        <Field.Text
           name="email"
           label="Email address"
           placeholder="name@example.com"
           size="small"
           slotProps={{ inputLabel: { shrink: true } }}
        />

        <Box sx={{ gap: 1.5, display: "flex", flexDirection: "column" }}>
           <Field.Text
              name="password"
              label="Password"
              size="small"
              placeholder="6+ characters"
              type={showPassword ? "text" : "password"}
              slotProps={{
                 inputLabel: { shrink: true },
                 input: {
                    endAdornment: (
                       <InputAdornment position="end">
                          <IconButton
                             onClick={() => setShowPassword(!showPassword)}
                             edge="end"
                          >
                             {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                       </InputAdornment>
                    ),
                 },
              }}
           />
           <Link
              component={RouterLink}
              to="#"
              variant="body2"
              color="inherit"
              sx={{ alignSelf: "flex-end" }}
           >
              Forgot password?
           </Link>
        </Box>

        <LoadingButton
           fullWidth
           color="primary"
           size="small"
           type="submit"
           variant="contained"
           loading={isSubmitting}
           loadingIndicator="Signing in..."
           sx={{
              textTransform: "none",
              fontWeight: 600,
           }}
        >
           Sign in
        </LoadingButton>
        <Box
           sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.lavender",
           }}
        >
           <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: "text.primary", textAlign: "center" }}
           >
              Test Accounts
           </Typography>

           <Divider sx={{ my: 1.5 }} />

           <Stack spacing={1}>
              <Box>
                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Admin login
                 </Typography>
                 <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    admin@hkids.com / Admin123
                 </Typography>
              </Box>

              <Box>
                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Parent login
                 </Typography>
                 <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    sarah@hkids.com / Parent123
                 </Typography>
              </Box>
           </Stack>
        </Box>
     </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: { xs: 3, md: 5 },
            boxShadow: (theme) => theme.shadows[20],
            borderRadius: 3,
          }}
        >
          <Stack spacing={3}>
            <FormHead
              title="Sign in to HKids"
              description={
                <>
                  {`Don't have an account? `}
                  <Link
                    component={RouterLink}
                    to={ROUTES.REGISTER}
                    variant="subtitle2"
                    sx={{ textDecoration: 'none' }}
                  >
                    Get started
                  </Link>
                </>
              }
              sx={{ textAlign: { xs: 'center', md: 'left' } }}
            />

            {!!errorMessage && (
              <Alert severity="error" onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}

            <Form methods={methods} onSubmit={onSubmit}>
              {renderForm()}
            </Form>

            

            
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
