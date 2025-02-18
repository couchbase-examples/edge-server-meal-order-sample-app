import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store";

jest.mock("./utils/createSeatId", () => ({
	retrieveOrGenerateSeatId: jest.fn(),
}));

describe("App Component", () => {
	it("renders App component", () => {
		const { getByText, getByLabelText } = render(
			<BrowserRouter>
				<Provider store={store}>
					<Routes>
						<Route path=":seatClass/" element={<App />} />
						<Route path="*" element={<App />} />
					</Routes>
				</Provider>
			</BrowserRouter>
		);

		expect(getByText('American Airlines')).toBeInTheDocument();
    expect(getByLabelText('My Flight')).toBeInTheDocument();
	});
});
