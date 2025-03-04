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
import { retrieveOrGenerateSeatId } from "./utils/createSeatId";
import "./index.css";
import MealPage from "./components/MealPage";

const App = () => {
	// Read the seatClass from the URL (possible "business" or "economy")
	const { seatClass } = useParams();

	// Decide which theme to use
	const selectedTheme = seatClass === "economy" ? economyTheme : businessTheme;

	retrieveOrGenerateSeatId();

	const isDesktop = useMediaQuery(selectedTheme.breakpoints.up("md"));
	const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);

	useEffect(() => {
		setIsSidebarOpen(isDesktop);
	}, [isDesktop]);

	const toggleSidebar = () => {
		setIsSidebarOpen((prev) => !prev);
	};

	return (
		<ThemeProvider theme={selectedTheme}>
			<CssBaseline />
			<div className="flex flex-col h-screen">
				<Navbar onMenuClick={toggleSidebar} />

				{/* Main container */}
				<div className="flex flex-1 h-[calc(100vh-45px)] relative">
					{/* Left SideBar */}
					<LeftSideBar isSidebarOpen={isSidebarOpen} />

					{/* Main content area */}
					<div
						className="flex flex-col flex-1 overflow-y-auto bg-gray-50 transition-all duration-300 ease-in-out"
						style={{ marginLeft: `${isSidebarOpen ? 240 : 64}px` }}
					>
						<main className="flex-1">
							<div data-testid="meal-page" className="p-2 sm:p-4 mt-8 pb-[72px] md:pb-4">
								<MealPage />
							</div>
						</main>
					</div>

					{/* Right Cart (desktop) or Bottom Cart (mobile/tablet) */}
					<aside className="hidden md:block w-72 bg-white border-l border-gray-200">
						<Cart />
					</aside>
					<div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
						<Cart isMobile={true} />
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
};

export default App;
