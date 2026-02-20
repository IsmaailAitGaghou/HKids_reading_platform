import { Lock, MenuBook } from "@mui/icons-material";
import { Avatar, Box, IconButton, Stack, Typography } from "@mui/material";

interface KidsLibraryHeaderProps {
  childName: string;
  childAvatar?: string;
  remainingMinutes: number;
  onLockClick: () => void;
}

export function KidsLibraryHeader({
  childName,
  childAvatar,
  remainingMinutes,
  onLockClick,
}: KidsLibraryHeaderProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "common.white",
            display: "grid",
            placeItems: "center",
            boxShadow: 4,
          }}
        >
          <MenuBook />
        </Box>
        <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 800 }}>
          HKids
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Avatar src={childAvatar || undefined} sx={{ width: 34, height: 34 }}>
            {(childName.charAt(0) || "C").toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {`${childName}'s Library`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {`${remainingMinutes} mins left today`}
            </Typography>
          </Box>
        </Stack>

        <IconButton onClick={onLockClick} type="button" sx={{ bgcolor: "secondary.main" }}>
          <Lock />
        </IconButton>
      </Stack>
    </Stack>
  );
}

