import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Block } from "@mui/icons-material";

interface BlockedBookRow {
  id: string;
  title: string;
  subtitle: string;
  reason: string;
}

interface IndividualBlockedBooksCardProps {
  rows: BlockedBookRow[];
}

export function IndividualBlockedBooksCard({
  rows,
}: IndividualBlockedBooksCardProps) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 0 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 3 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: "action.hover",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Block color="error" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Individual Blocked Books
            </Typography>
          </Stack>

          <Chip label={`${rows.length} TITLES`} size="small" sx={{ fontWeight: 700 }} />
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>BOOK TITLE</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>REASON</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                ACTION
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {row.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.subtitle}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.reason}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Button variant="outlined" size="small" type="button">
                    Unblock
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="body2" color="text.secondary">
                    No blocked books configured for this profile.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
