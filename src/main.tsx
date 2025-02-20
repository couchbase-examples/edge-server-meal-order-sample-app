import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/index";
import App from "./App";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import timestampData from "../timestamp.json";

// Function to perform the conditional cleanup
// We are cleaning the localstorage when we re-run the react app
// This is to ensure that the localstorage is in sync with the timestamp
const performConditionalCleanup = () => {
	const timestamp: { timestamp: string } = timestampData;
	const appTimestamp = timestamp.timestamp;// Get the timestamp from the JSON file
	const storedTimestamp = localStorage.getItem("cbmd:storedTimestamp");
  
	if (appTimestamp !== storedTimestamp) {
	  Object.keys(window.localStorage).forEach((key) => {
		if (key.startsWith("cbmd:")) {
		  window.localStorage.removeItem(key);
		}
	  });
	  localStorage.setItem("cbmd:storedTimestamp", appTimestamp || ""); // Update stored timestamp
	}
  };

performConditionalCleanup();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<BrowserRouter>
		<React.StrictMode>
			<Provider store={store}>
				<Routes>
					<Route path=":seatClass/" element={<App />} />
					<Route path="*" element={<App />} />
				</Routes>
			</Provider>
		</React.StrictMode>
	</BrowserRouter>
);
