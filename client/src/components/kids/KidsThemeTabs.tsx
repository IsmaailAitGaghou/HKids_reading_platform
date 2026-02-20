import { AutoAwesome, Pets, RocketLaunch, Science, Search } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface ThemeOption {
  key: string;
  label: string;
}

interface KidsThemeTabsProps {
  options: ThemeOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

const themeIcons: ReactNode[] = [
  <Pets key="pets" />,
  <RocketLaunch key="rocket" />,
  <AutoAwesome key="magic" />,
  <Science key="science" />,
  <Search key="search" />,
];

export function KidsThemeTabs({
  options,
  selectedKey,
  onSelect,
}: KidsThemeTabsProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        overflowX: "auto",
        pb: 1,
      }}
    >
      {options.map((option, index) => {
        const selected = option.key === selectedKey;
        return (
          <Button
            key={option.key}
            type="button"
            onClick={() => onSelect(option.key)}
            sx={{
              minWidth: 96,
              px: 1.75,
              py: 1.3,
              borderRadius: 999,
              border: "1px solid",
              borderColor: selected ? "primary.main" : "divider",
              bgcolor: selected ? "primary.main" : "background.paper",
              color: selected ? "common.white" : "text.primary",
              flexDirection: "column",
              gap: 0.75,
              boxShadow: selected ? 4 : 1,
            }}
          >
            <Box sx={{ display: "grid", placeItems: "center" }}>
              {themeIcons[index % themeIcons.length]}
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {option.label}
            </Typography>
          </Button>
        );
      })}
    </Stack>
  );
}

