/* src/App.tsx */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
	ThemeProvider,
	useMediaQuery,
	CssBaseline,
} from "@mui/material";
import Navbar from "./components/Navbar";
import LeftSideBar from "./components/LeftSideBar";
import Cart from "./components/Cart";
import { businessTheme, economyTheme } from "./themes";
import { getOrCreateSeatId } from "./utils/createSeatId";
import "./index.css";
import BusinessMealPage from "./components/businessMealPage";

export default function App() {
	// Read the seatClass from the URL (possible "business" or "economy")
	const { seatClass } = useParams();

	// Decide which theme to use
	const selectedTheme = seatClass === "economy" ? economyTheme : businessTheme;

	getOrCreateSeatId();

	const isDesktop = useMediaQuery(selectedTheme.breakpoints.up("md"));
	const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);

	useEffect(() => {
		setIsSidebarOpen(isDesktop);
	}, [isDesktop]);

	const handleSidebarToggle = () => {
		setIsSidebarOpen((prev) => !prev);
	};

	const sidebarWidth = isSidebarOpen ? 240 : 64;

	return (
		<ThemeProvider theme={selectedTheme}>
			<CssBaseline />
			<div className="flex flex-col h-screen">
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
					</div>

					{/* Right Cart (desktop only) */}
					<aside className="w-72 bg-white border-l border-gray-200">
						<Cart />
					</aside>
				</div>
			</div>
		</ThemeProvider>
	);
}
