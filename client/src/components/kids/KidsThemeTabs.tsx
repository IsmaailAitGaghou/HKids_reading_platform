import { Box, Button, Stack, Typography } from "@mui/material";

interface ThemeOption {
  key: string;
  label: string;
}

interface KidsThemeTabsProps {
  options: ThemeOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export function KidsThemeTabs({
  options,
  selectedKey,
  onSelect,
}: KidsThemeTabsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        pb: 1,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        useFlexGap
        sx={{
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {options.map((option) => {
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
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                {option.label}
              </Typography>
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}
