import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/index";
import App from "./App";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

Object.keys(window.localStorage).forEach((key) => {
	if (key.startsWith("cbmd:")) {
		window.localStorage.removeItem(key);
	}
});

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
