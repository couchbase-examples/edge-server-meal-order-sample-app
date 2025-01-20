import { createTheme } from "@mui/material/styles";

// BUSINESS theme => primary is red, secondary is teal
export const businessTheme = createTheme({
	palette: {
		primary: { main: "#EA2328" }, // "cb-red"
		secondary: { main: "#2E22D4" }, // "cb-teal"
	},
	typography: {
		fontFamily: ["Arial", "sans-serif"].join(","),
	},
});

// ECONOMY theme => primary is teal, secondary is red
export const economyTheme = createTheme({
	palette: {
		primary: { main: "#2E22D4" }, // "cb-teal"
		secondary: { main: "#EA2328" }, // "cb-red"
	},
	typography: {
		fontFamily: ["Arial", "sans-serif"].join(","),
	},
});
