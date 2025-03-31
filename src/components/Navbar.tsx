import { AppBar, Toolbar, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

interface NavbarProps {
	onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
	return (
		<AppBar
			position="fixed"
			sx={{
				height: "45px",
				zIndex: (theme) => theme.zIndex.drawer + 1,
			}}
		>
			<Toolbar variant="dense" sx={{ minHeight: "45px !important" }}>
				{/* Single hamburger for all screen sizes */}
				<IconButton
					color="inherit"
					aria-label="open drawer"
					edge="start"
					onClick={onMenuClick}
					sx={{ mr: 2 }}
				>
					<MenuIcon />
				</IconButton>

				<div className="flex items-center">
        <FlightTakeoffIcon className="mr-2" />
        <span className="font-bold text-lg">America Airlines</span>
      </div>
      <ul className="ml-auto flex space-x-4">
        <li>Home</li>
        <li>Profile</li>
      </ul>
			</Toolbar>
		</AppBar>
	);
}

export default Navbar;
