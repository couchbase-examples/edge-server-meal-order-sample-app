import {
	Drawer,
	Box,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Tooltip,
  IconButton,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MovieIcon from "@mui/icons-material/Movie";
import FlightIcon from "@mui/icons-material/Flight";
import LuggageIcon from "@mui/icons-material/Luggage";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface LeftSideBarProps {
	isSidebarOpen: boolean;
}

export default function LeftSideBar({ isSidebarOpen }: LeftSideBarProps) {
	// Expanded => 240px, Collapsed => 64px
	const drawerWidth = isSidebarOpen ? 240 : 64;

	const links = [
		{ name: "Movies", icon: <MovieIcon /> },
		{ name: "My Flight", icon: <FlightIcon /> },
		{ name: "Luggage", icon: <LuggageIcon /> },
		{ name: "Music Audio", icon: <MusicNoteIcon /> },
	];

	return (
		<Drawer
			variant="permanent"
			open
			sx={{
				"& .MuiDrawer-paper": {
					position: "fixed",
					top: "38px", // below the navbar
					left: 0,
					width: drawerWidth,
					height: "calc(100% - 45px)",
					transition: "width 0.3s ease-in-out",
					overflowX: "hidden",
					borderRight: "1px solid #ddd",
					zIndex: 40,
				},
			}}
		>
			<SidebarContent isSidebarOpen={isSidebarOpen} links={links} />
		</Drawer>
	);
}

function SidebarContent({
	isSidebarOpen,
	links,
}: {
	isSidebarOpen: boolean;
	links: Array<{ name: string; icon: JSX.Element }>;
}) {
	// If it's closed => icons only; if open => icons + text
	return (
		<Box display="flex" flexDirection="column" height="100%" pt={2}>
			<List>
				{links.map((link) => (
					<Tooltip
						key={link.name}
						title={!isSidebarOpen ? link.name : ""}
						placement="right"
					>
						<ListItemButton
							component="a"
							href="#"
							sx={{
								minHeight: 48,
								justifyContent: isSidebarOpen ? "initial" : "center",
								px: 2.5,
							}}
						>
							<ListItemIcon
								sx={{
									minWidth: 0,
									mr: isSidebarOpen ? 2 : 0,
									justifyContent: "center",
								}}
							>
								{link.icon}
							</ListItemIcon>
							{isSidebarOpen && <ListItemText primary={link.name} />}
						</ListItemButton>
					</Tooltip>
				))}

				{/* Special Food & Drinks */}
				<Tooltip
					title={!isSidebarOpen ? "Food & Drinks" : ""}
					placement="right"
				>
					<ListItemButton
						component="a"
						href="#"
						sx={{
							minHeight: 48,
							justifyContent: isSidebarOpen ? "initial" : "center",
							px: 2.5,
							backgroundColor: "red",
							"&:hover": {
								backgroundColor: "darkred",
							},
							color: "white",
							mt: 2,
						}}
					>
						<ListItemIcon
							sx={{
								minWidth: 0,
								mr: isSidebarOpen ? 2 : 0,
								justifyContent: "center",
								color: "white",
							}}
						>
							<FastfoodIcon />
						</ListItemIcon>
						{isSidebarOpen && <ListItemText primary="Food & Drinks" />}
					</ListItemButton>
				</Tooltip>

				{/* "More" link */}
				<Tooltip title={!isSidebarOpen ? "More" : ""} placement="right">
					<ListItemButton
						sx={{
							minHeight: 48,
							justifyContent: isSidebarOpen ? "initial" : "center",
							px: 2.5,
							mt: 2,
						}}
					>
						<ListItemIcon
							sx={{
								minWidth: 0,
								mr: isSidebarOpen ? 2 : 0,
								justifyContent: "center",
							}}
						>
							<ExpandMoreIcon />
						</ListItemIcon>
						{isSidebarOpen && <ListItemText primary="More" />}
					</ListItemButton>
				</Tooltip>
			</List>

      {/* Search Option */}
				<Box mt="auto" p={2}>
					<Box display="flex" alignItems="center" gap={1}>
						<TextField
							fullWidth
							placeholder="Search..."
							variant="outlined"
							size="small"
						/>
						<IconButton>
							<SearchIcon />
						</IconButton>
					</Box>
				</Box>
		</Box>
	);
}
