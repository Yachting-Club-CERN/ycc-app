import createTheme from '@mui/material/styles/createTheme';

const theme = createTheme({
  typography: {
    allVariants: {
      marginTop: '1rem',
      marginBottom: '1rem',
      textAlign: 'justify',
    },
    h1: {fontSize: '3rem', fontWeight: 500},
    h2: {fontSize: '2.5rem', fontWeight: 500},
    h3: {fontSize: '2rem', fontWeight: 500},
    h4: {fontSize: '1.75rem', fontWeight: 500},
    h5: {fontSize: '1.5rem', fontWeight: 500},
    h6: {fontSize: '1.25rem', fontWeight: 500},
  },
});

export default theme;
