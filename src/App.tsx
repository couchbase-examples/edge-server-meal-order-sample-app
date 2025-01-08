import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import OrderSummary from "./components/OrderSummary";
import Cart from "./components/Cart";
import LeftSideBar from "./components/LeftSideBar";
import "./index.css";
import BusinessMealPage from "./components/businessMealPage";

const couchbaseTheme = createTheme({
  palette: {
    primary: { main: "#EA2328" },
    secondary: { main: "#00BCE4" },
  },
  typography: {
    fontFamily: ["Arial", "sans-serif"].join(","),
  },
});

function App() {
  return (
    <ThemeProvider theme={couchbaseTheme}>
      <CssBaseline />

      {/* 
         Full-height container for the layout. 
         (h-screen ensures the vertical space is used.)
      */}
      <div className="flex flex-col h-screen">
        {/* Top Navbar */}
        <Navbar />

        {/* Main row: left sidebar, content, cart */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-64 flex-none bg-white border-r border-gray-200">
            <LeftSideBar />
          </aside>

          {/* Center Content + Footer (stacked vertically) */}
          <div className="flex flex-col flex-1 overflow-y-auto bg-gray-50">
            <main className="flex-1 p-4">
              <h1 className="text-2xl font-bold mb-4">Meal Ordering</h1>
              <BusinessMealPage />
            </main>

            {/* 
              Footer that stays attached to the bottom. 
              - Either use "sticky bottom-0" if you want it to stick 
                within the scrolling container
              - Or use "fixed bottom-0 left-0 w-full" to lock it to the viewport
            */}
            <footer className="sticky bottom-0 bg-gray-100 p-4 border-t border-gray-200 z-50">
              <OrderSummary />
            </footer>
          </div>

          {/* Cart Section */}
          <aside className="w-72 flex-none p-4 bg-white border-l border-gray-200 relative">
            <Cart />
          </aside>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
