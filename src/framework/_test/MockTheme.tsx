import { createTheme, ThemeProvider } from '@mui/material';

function MockTheme({ children }: any) {
  const theme = createTheme({});
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export default MockTheme;