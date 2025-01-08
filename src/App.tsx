import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import MealSelection from "./components/MealSelection";
import OrderSummary from "./components/OrderSummary";
import Cart from "./components/Cart";
import "./index.css";
import LeftSideBar from "./components/LeftSideBar";
import BusinessMealPage from "./components/businessMealPage";

const couchbaseTheme = createTheme({
	palette: {
		primary: {
			main: "#EA2328", // You can pull from your tailwind config or define here
		},
		secondary: {
			main: "#00BCE4",
		},
	},
	typography: {
		fontFamily: ["Arial", "sans-serif"].join(","),
	},
});

function App() {
	return (
		<ThemeProvider theme={couchbaseTheme}>
			<CssBaseline />
			<div className="flex flex-col h-screen">
				<Navbar />
				<div className="flex flex-1">
					{/* Left Sidebar */}
					<LeftSideBar />
					{/* Main Content Area */}
					<div className="flex flex-col flex-1" style={{ marginLeft: "20%" }}>
						<main className="flex-1 p-4 overflow-y-auto bg-gray-50">
							<div className="flex items-center mb-4">
								<h1 className="text-2xl font-bold">Meal Ordering</h1>
							</div>
							<MealSelection />
              <BusinessMealPage/>
						</main>
						{/* Footer */}
						<footer className="bg-gray-100 p-4 border-t border-gray-200">
							<OrderSummary />
						</footer>
					</div>
					{/* Cart Section */}
					<aside className="w-72 p-4 bg-white border-l border-gray-200">
						<Cart />
					</aside>
				</div>
			</div>
		</ThemeProvider>
	);
}

export default App;
