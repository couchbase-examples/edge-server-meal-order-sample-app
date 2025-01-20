import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import BusinessMealPage from "./components/businessMealPage";
import Cart from "./components/Cart";
import LeftSideBar from "./components/LeftSideBar";
import Navbar from "./components/Navbar";
import OrderSummary from "./components/OrderSummary";
import { useAppDispatch } from "./hooks/useAppDispatch";
import "./index.css";
import { fetchExistingOrder } from "./store/mealSlice";
import { getOrCreateSeatId } from "./utils/createSeatId";

const couchbaseTheme = createTheme({
	palette: {
		primary: { main: "#EA2328" },
		secondary: { main: "#00BCE4" },
	},
	typography: {
		fontFamily: ["Arial", "sans-serif"].join(","),
	},
});

export default function App() {
	// Seat ID logic just as a placeholder
	getOrCreateSeatId();

	const isDesktop = useMediaQuery(couchbaseTheme.breakpoints.up("md")); // ≥768px

	// Single state: isSidebarOpen => whether the sidebar is fully expanded (true) or icon-only (false)
	const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);

	// Whenever screen size changes from mobile to desktop or vice versa,
	// reset the sidebar to open if it's desktop, or collapsed if it's mobile.
	useEffect(() => {
		setIsSidebarOpen(isDesktop);
	}, [isDesktop]);

	// Toggle for our hamburger button
	const handleSidebarToggle = () => {
		setIsSidebarOpen((prev) => !prev);
	};

	// Decide how wide the sidebar is
	// if open => 240px, if icon => 64px
	// main content shifts accordingly to avoid overlap.
	const sidebarWidth = isSidebarOpen ? 240 : 64;

	const dispatch = useAppDispatch();

	/**
	 * Initialize app state by loading existing order.
	 * Priority: Server > localStorage
	 */
	useEffect(() => {
		const loadExistingOrder = async () => {
			const seatId = getOrCreateSeatId();
			try {
				// Fetch from server first
				await dispatch(fetchExistingOrder(seatId)).unwrap();
			} catch (error) {
				console.error('Failed to fetch from server:', error);
			}
		};

		loadExistingOrder();
	}, [dispatch]);

	return (
		<ThemeProvider theme={couchbaseTheme}>
			<CssBaseline />
			<div className="flex flex-col h-screen">
				{/* Single hamburger in Navbar */}
				<Navbar onMenuClick={handleSidebarToggle} />

				{/* Main container (under the 45px navbar) */}
				<div className="flex flex-1 h-[calc(100vh-45px)]">
					{/* Left SideBar (always "permanent" so it does NOT overlay) */}
					<LeftSideBar isSidebarOpen={isSidebarOpen} />

					{/* Main content area: shift right so it’s never hidden */}
					<div
						className="flex flex-col flex-1 overflow-y-auto bg-gray-50 transition-all duration-300 ease-in-out"
						style={{ marginLeft: `${sidebarWidth}px` }}
					>
						<main className="flex-1">
							<div className="p-2 sm:p-4 mt-8">
								<BusinessMealPage />
							</div>
						</main>

						<footer className="sticky bottom-0 bg-gray-100 p-2 sm:p-4 border-t border-gray-200">
							<OrderSummary />
						</footer>
					</div>

					{/* Right Cart (desktop only) */}
					<aside className="w-72 mt-12 bg-white border-l border-gray-200">
						<Cart />
					</aside>
				</div>
			</div>
		</ThemeProvider>
	);
}
