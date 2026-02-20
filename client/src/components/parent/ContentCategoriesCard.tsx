import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Category, Search } from "@mui/icons-material";

interface ContentCategoriesCardProps {
  categories: Array<{ id: string; name: string }>;
  selectedCategoryIds: string[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onToggleCategory: (id: string, checked: boolean) => void;
  onSelectAll: () => void;
}

export function ContentCategoriesCard({
  categories,
  selectedCategoryIds,
  searchValue,
  onSearchChange,
  onToggleCategory,
  onSelectAll,
}: ContentCategoriesCardProps) {
  const filtered = categories.filter((category) =>
    category.name.toLowerCase().includes(searchValue.toLowerCase().trim())
  );

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 0 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          justifyContent="space-between"
          sx={{ p: 3 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
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
              <Category color="primary" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Content Categories
            </Typography>
          </Stack>

          <TextField
            size="small"
            placeholder="Search categories..."
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            sx={{ width: { xs: "100%", md: 360 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Divider />

        <Box
          sx={{
            p: 3,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            columnGap: 2,
            rowGap: 1.25,
          }}
        >
          {filtered.map((category) => {
            const checked = selectedCategoryIds.includes(category.id);
            return (
              <Stack key={category.id} direction="row" alignItems="center">
                <Checkbox
                  checked={checked}
                  onChange={(event) => onToggleCategory(category.id, event.target.checked)}
                />
                <Typography variant="h6" sx={{ fontWeight: 500, fontSize: "1rem" }}>
                  {category.name}
                </Typography>
              </Stack>
            );
          })}
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Only checked categories will be visible in this profile library.
          </Typography>
          <IconButton onClick={onSelectAll} type="button" sx={{ borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
              Select All
            </Typography>
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
