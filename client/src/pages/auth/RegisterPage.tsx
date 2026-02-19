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
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthContext } from '@/context/useAuthContext';
import { ROUTES } from '@/utils/constants';
import { Form, Field } from '@/components/hook-form';
import { FormHead } from '@/components/auth/FormHead';

// ----------------------------------------------------------------------

export type SignUpSchemaType = zod.infer<typeof SignUpSchema>;

export const SignUpSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
  role: zod.enum(['ADMIN', 'PARENT'], { message: 'Role is required!' }),
});

// ----------------------------------------------------------------------

export function RegisterPage() {
  const { register: registerUser } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: SignUpSchemaType = {
    name: '',
    email: '',
    password: '',
    role: 'PARENT',
  };

  const methods = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);
      await registerUser(data.name, data.email, data.password, data.role);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      setErrorMessage(message);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="name"
        label="Full name"
        placeholder="John Doe"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="email"
        label="Email address"
        placeholder="name@example.com"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="password"
        label="Password"
        placeholder="6+ characters"
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Field.Text
        name="role"
        label="Account Type"
        select
        slotProps={{ inputLabel: { shrink: true } }}
      >
        <MenuItem value="PARENT">Parent</MenuItem>
        <MenuItem value="ADMIN">Admin</MenuItem>
      </Field.Text>

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Creating account..."
        sx={{
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        Create account
      </LoadingButton>
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
              title="Get started with HKids"
              description={
                <>
                  {`Already have an account? `}
                  <Link
                    component={RouterLink}
                    to={ROUTES.LOGIN}
                    variant="subtitle2"
                    sx={{ textDecoration: 'none' }}
                  >
                    Sign in
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

            {/* Terms */}
            <Box sx={{ textAlign: 'center', typography: 'caption', color: 'text.secondary' }}>
              By signing up, I agree to{' '}
              <Link component={RouterLink} to="#" underline="always" color="text.primary">
                Terms of Service
              </Link>
              {' and '}
              <Link component={RouterLink} to="#" underline="always" color="text.primary">
                Privacy Policy
              </Link>
              .
            </Box>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
