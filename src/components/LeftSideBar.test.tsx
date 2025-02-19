import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import LeftSideBar from "./LeftSideBar";

// Create a mock theme
const mockTheme = createTheme();

// Wrapper component for providing theme context
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe("LeftSideBar", () => {
  test("renders all navigation links when sidebar is open", () => {
    renderWithTheme(<LeftSideBar isSidebarOpen={true} />);
    
    // Check if all main links are rendered with text
    expect(screen.getByText("Movies")).toBeTruthy();
    expect(screen.getByText("My Flight")).toBeTruthy();
    expect(screen.getByText("Luggage")).toBeTruthy();
    expect(screen.getByText("Music Audio")).toBeTruthy();
    expect(screen.getByText("Food & Drinks")).toBeTruthy();
    expect(screen.getByText("More")).toBeTruthy();
  });

  test("renders icons only when sidebar is closed", () => {
    renderWithTheme(<LeftSideBar isSidebarOpen={false} />);
    
    // Text should not be visible when sidebar is closed
    expect(screen.queryByText("Movies")).toBeNull();
    expect(screen.queryByText("My Flight")).toBeNull();
    
    // Icons should still be present (checking for their roles)
    const icons = screen.getAllByRole("button");
    expect(icons.length).toBeGreaterThan(0);
  });

  test("renders search field when sidebar is open", () => {
    renderWithTheme(<LeftSideBar isSidebarOpen={true} />);
    expect(screen.getByPlaceholderText("Search...")).toBeTruthy();
    expect(screen.getByTestId("SearchIcon")).toBeTruthy();
  });
});