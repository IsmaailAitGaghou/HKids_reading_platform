import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/styles/theme";
import { AppRouter } from "@/routes/AppRouter";
// import "@/App.css";

function App() {
   return (
      <ThemeProvider theme={theme}>
         <CssBaseline />
         <AppRouter />
      </ThemeProvider>
   );
}

export default App;
