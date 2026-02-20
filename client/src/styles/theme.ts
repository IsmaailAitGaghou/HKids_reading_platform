import {  createTheme, type ThemeOptions } from "@mui/material/styles";

const palette = {
  primary: {
    main: "#702AFA",
    light: "#8B4DFF",
    dark: "#5A22C8",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#F2E6F5",
    light: "#F9F2FC",
    dark: "#E0D0ED",
    contrastText: "#1F2937",
  },
  background: {
    default: "#F7F6F8",
    paper: "#FFFFFF",
    kids: "#FEFCF6",
    lavender: "#F2E6F5",
  },
  text: {
    primary: "#1F2937",
    secondary: "#374151",
    disabled: "#9CA3AF",
  },
  success: { main: "#10B981", light: "#34D399", dark: "#059669" },
  warning: { main: "#F59E0B", light: "#FCD34D", dark: "#D97706" },
  error: { main: "#EF4444", light: "#F87171", dark: "#DC2626" },
  info: { main: "#3B82F6", light: "#60A5FA", dark: "#2563EB" },
  divider: "#E5E7EB",
  action: {
    hover: "#F3F4F6",
    selected: "#F2E6F5",
    disabled: "#9CA3AF",
    disabledBackground: "#E5E7EB",
  },
};

const typography = {
  fontFamily:
    "'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 16,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: { fontSize: "3rem", fontWeight: 800, lineHeight: 1.25, letterSpacing: "-0.02em" },
  h2: { fontSize: "2.25rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em" },
  h3: { fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.25 },
  h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.5 },
  subtitle1: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.5 },
  subtitle2: { fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.5 },
  body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5 },
  button: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.5, textTransform: "none" as const },
  caption: { fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.5 },
  overline: {
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1.5,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
};

const shadows = [
  "none",
  "0 1px 2px rgba(0, 0, 0, 0.05)",
  "0 1px 3px rgba(0, 0, 0, 0.1)",
  "0 4px 6px rgba(0, 0, 0, 0.07)",
  "0 10px 15px rgba(0, 0, 0, 0.1)",
  "0 20px 25px rgba(0, 0, 0, 0.1)",
  "0 4px 14px rgba(112, 42, 250, 0.2)",
  ...Array(18).fill("0 1px 3px rgba(0, 0, 0, 0.1)"),
] as ThemeOptions["shadows"];

export const theme = createTheme({
  palette,
  typography,
  spacing: 8,
  shape: { borderRadius: 8 },
  shadows,
  breakpoints: {
    values: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          color: palette.text.primary,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "12px 24px",
          fontSize: "1rem",
          fontWeight: 500,
          textTransform: "none",
          boxShadow: "none",
        },
        containedPrimary: {
          backgroundColor: palette.primary.main,
          color: palette.primary.contrastText,
          "&:hover": { backgroundColor: palette.primary.light, boxShadow: shadows?.[3] as string },
          "&:active": { backgroundColor: palette.primary.dark },
        },
        outlinedPrimary: {
          borderWidth: "2px",
          borderColor: palette.primary.main,
          color: palette.primary.main,
          "&:hover": { backgroundColor: palette.secondary.main, borderWidth: "2px" },
        },
        textPrimary: {
          color: palette.primary.main,
          "&:hover": { backgroundColor: palette.secondary.main },
        },
        sizeLarge: { padding: "14px 28px", fontSize: "1.125rem" },
        sizeSmall: { padding: "8px 16px", fontSize: "0.875rem" },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: shadows?.[2] as string,
          border: `1px solid ${palette.divider}`,
          "&.elevated": {
            borderRadius: 16,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 15px rgba(0, 0, 0, 0.1)",
            border: "none",
          },
          "&.book-card": {
            borderRadius: 16,
            border: `2px solid ${palette.secondary.main}`,
            boxShadow: "0 2px 8px rgba(112, 42, 250, 0.1)",
            transition: "all 200ms ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 16px rgba(112, 42, 250, 0.2)",
            },
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "& fieldset": { borderColor: palette.divider },
            "&:hover fieldset": { borderColor: palette.primary.main },
            "&.Mui-focused fieldset": {
              borderColor: palette.primary.main,
              borderWidth: "2px",
            },
            "&.Mui-error fieldset": { borderColor: palette.error.main },
          },
        },
      },
    },

    // safer than broad MuiInputBase padding for everything
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: "10px 16px",
          "&::placeholder": { color: palette.text.disabled, opacity: 1 },
        },
      },
    },

    MuiDrawer: {
  styleOverrides: {
    paper: {
      backgroundColor: palette.background.paper,
      color: palette.text.primary,
    },
  },
},

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: "inherit",
        },
      },
    },

    MuiListItemButton: {
  styleOverrides: {
    root: {
      borderRadius: 8,
      margin: "4px 8px",
      "&:hover": {
        backgroundColor: palette.action.hover,
      },
      "&.Mui-selected": {
        backgroundColor: palette.action.selected,
        color: palette.primary.main,
        "&:hover": { backgroundColor: palette.action.selected },
      },
    },
  },
},

    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: palette.primary.main,
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
  },
});

// Keep extras here (best place for non-MUI)
export const customTokens = {
  fontWeights: { semibold: 600, extrabold: 800 },
  colors: {
    kids: {
      background: "#FEFCF6",
      cardBorder: "#F2E6F5",
      cardShadow: "rgba(112, 42, 250, 0.1)",
      cardShadowHover: "rgba(112, 42, 250, 0.2)",
    },
    admin: { sidebar: "#1F2937", sidebarText: "#FFFFFF", activeItem: "#702AFA" },
    parent: { sectionBg: "#F2E6F5" },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { sm: 4, md: 8, lg: 12, xl: 16, xxl: 24, full: 9999 },
  transitions: { fast: "150ms ease-in-out", base: "200ms ease-in-out", slow: "300ms ease-in-out" },
};

declare module "@mui/material/styles" {
  interface Palette {
    background: {
      default: string;
      paper: string;
      kids: string;
      lavender: string;
    };
  }
  interface PaletteOptions {
    background?: {
      default?: string;
      paper?: string;
      kids?: string;
      lavender?: string;
    };
  }
  interface TypeBackground {
    kids: string;
    lavender: string;
  }
}

export default theme;
