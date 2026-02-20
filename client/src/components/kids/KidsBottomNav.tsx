import { EmojiEvents, Home, MenuBook, Person } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { key: "home", label: "HOME", icon: <Home fontSize="small" /> },
  { key: "shelf", label: "BOOKSHELF", icon: <MenuBook fontSize="small" /> },
  { key: "rewards", label: "REWARDS", icon: <EmojiEvents fontSize="small" /> },
  { key: "profile", label: "PROFILE", icon: <Person fontSize="small" /> },
];

export function KidsBottomNav() {
  return (
    <Box
      sx={{
        position: "sticky",
        bottom: 12,
        width: "fit-content",
        mx: "auto",
        px: 2.5,
        py: 1.2,
        borderRadius: 999,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: 3,
      }}
    >
      <Stack direction="row" spacing={4} alignItems="center">
        {navItems.map((item, index) => {
          const selected = index === 0;
          return (
            <Stack
              key={item.key}
              alignItems="center"
              spacing={0.4}
              sx={{ color: selected ? "primary.main" : "text.secondary" }}
            >
              {item.icon}
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {item.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

