import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import MealSelection from './components/MealSelection';
import OrderSummary from './components/OrderSummary';
import Cart from './components/Cart';
import './index.css';
import LeftSideBar from './components/LeftSideBar';

const couchbaseTheme = createTheme({
  palette: {
    primary: {
      main: '#EA2328'
    },
    secondary: {
      main: '#00BCE4'
    }
  },
  typography: {
    fontFamily: ['Arial', 'sans-serif'].join(',')
  }
});

function App() {
  return (
    <ThemeProvider theme={couchbaseTheme}>
      <CssBaseline />
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-1">
          <LeftSideBar />
          <main className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ marginLeft: '20%' }}>
            <div className="flex items-center mb-4">
              <h1 className="text-2xl font-bold">Meal Ordering</h1>
            </div>
            <MealSelection />
          </main>
          <aside className="w-72 p-4 bg-white border-l border-gray-200">
            <Cart />
          </aside>
        </div>
        <footer className="bg-gray-100 p-4">
          <OrderSummary />
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
