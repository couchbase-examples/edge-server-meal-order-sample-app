import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./store";
import { retrieveOrGenerateSeatId } from "./utils/createSeatId";

// Mock the retrieveOrGenerateSeatId function
jest.mock("./utils/createSeatId", () => ({
  retrieveOrGenerateSeatId: jest.fn(),
}));

// Mock a small functional implementation for the useMediaQuery hook
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: jest.fn().mockReturnValue(true),  // Assume desktop by default
}));

describe("App Component", () => {
  // Function to render the component with specified route
  const renderWithRoute = (route: string) => {
    window.history.pushState({}, 'Test Page', route);
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/:seatClass" element={<App />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it("renders App component in business class theme", () => {
    renderWithRoute("/business");

    // Assertions for Navbar, LeftSideBar, MealPage, and Cart
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(retrieveOrGenerateSeatId).toHaveBeenCalled();

    // Ensure the sidebar and meal page are correctly shown
    expect(screen.getByTestId('meal-page')).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toBeInTheDocument(); // Check left sidebar

    const cart = screen.queryAllByRole('complementary', { hidden: true });
    expect(cart.length).toBeGreaterThan(0);  // Ensure Cart exists in DOM for desktop
  });

  it("renders App component in economy class theme", () => {
    renderWithRoute("/economy");

    // Checks for Navbar presence
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(retrieveOrGenerateSeatId).toHaveBeenCalled();
  });
});
