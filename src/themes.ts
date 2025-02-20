import { createTheme } from "@mui/material/styles";

// BUSINESS theme => primary is red, secondary is blue
export const businessTheme = createTheme({
	palette: {
		primary: { main: "#EA2328" }, // "cb-red"
		secondary: { main: "#2E22D4" }, // "cb-blue"
	},
	typography: {
		fontFamily: ["Arial", "sans-serif"].join(","),
	},
});

// ECONOMY theme => primary is blue, secondary is red
export const economyTheme = createTheme({
	palette: {
		primary: { main: "#2E22D4" }, // "cb-teal"
		secondary: { main: "#EA2328" }, // "cb-blue"
	},
	typography: {
		fontFamily: ["Arial", "sans-serif"].join(","),
	},
});
