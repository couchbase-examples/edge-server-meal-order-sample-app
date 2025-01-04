import {
  Drawer,
  List,
  ListItemText,
  Box,
  TextField,
  IconButton,
  ListItemButton,
  ListItemIcon,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MovieIcon from "@mui/icons-material/Movie";
import FlightIcon from "@mui/icons-material/Flight";
import LuggageIcon from "@mui/icons-material/Luggage";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import FastfoodIcon from '@mui/icons-material/Fastfood';

export default function LeftSideBar() {
  const links = [
    { name: "Movies", icon: <MovieIcon /> },
    { name: "My Flight", icon: <FlightIcon /> },
    { name: "Luggage", icon: <LuggageIcon /> },
    { name: "Music Audio", icon: <MusicNoteIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        "& .MuiDrawer-paper": {
          width: "20%", // Sidebar width
          height: "calc(100vh - 45px)", // Full screen height minus navbar height
          marginTop: "45px", // Adjust for navbar
          backgroundColor: "background.default", // Theme background
          borderRight: "1px solid divider", // Theme divider
        },
      }}
    >
      <Box display="flex" flexDirection="column" height="100%">
        {/* Menu Options */}
        <List>
          {links.map((link) => (
            <ListItemButton component="a" href="#" key={link.name}>
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.name} />
            </ListItemButton>
          ))}
          {/* Highlighted Food Order Item */}
          <ListItemButton
            component="a"
            href="#"
            key="Food Order"
            sx={{
              backgroundColor: "red", // Highlight color
              "&:hover": {
                backgroundColor: "darkred", // Darker highlight on hover
              },
              color: "white", // White text
            }}
          >
            <ListItemIcon>
              <FastfoodIcon sx={{ color: "white" }} /> {/* Icon with white color */}
            </ListItemIcon>
            <ListItemText primary="Food Order" />
          </ListItemButton>
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
    </Drawer>
  );
}
