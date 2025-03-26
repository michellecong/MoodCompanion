// src/pages/HomePage.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import HomePage from "./HomePage";

// Required mocks
jest.mock("../hooks/useUserData", () => ({
  useUserData: (isAuthenticated) => ({
    recentJournals: isAuthenticated
      ? [
          { _id: "1", title: "A good day", content: "Content..." },
          {
            _id: "2",
            title: "Feeling anxious about presentation",
            content: "Content...",
          },
        ]
      : [],
    currentMood: null,
    setCurrentMood: jest.fn(),
    isLoading: false,
  }),
}));

// Wrapper to provide Router context
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("HomePage Component", () => {
  test("renders landing page for unauthenticated users", () => {
    renderWithRouter(<HomePage isAuthenticated={false} user={null} />);

    // Check for hero section elements
    expect(
      screen.getByText("Your Personal AI Mood Companion")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Track your emotions, journal your thoughts, and find support in our community"
      )
    ).toBeInTheDocument();

    // Check for CTA buttons
    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();

    // Check for features section
    expect(
      screen.getByText("Features to Support Your Emotional Well-being")
    ).toBeInTheDocument();
    expect(screen.getByText("Digital Journal")).toBeInTheDocument();
    expect(screen.getByText("AI Companion")).toBeInTheDocument();
    expect(screen.getByText("Mood Tracking")).toBeInTheDocument();
    expect(screen.getByText("Wishing Well Community")).toBeInTheDocument();
  });

  test("renders dashboard for authenticated users", async () => {
    renderWithRouter(<HomePage isAuthenticated={true} user={{}} />);

    // Check for mood tracker
    expect(screen.getByText("How are you feeling today?")).toBeInTheDocument();

    // Check for journal section
    expect(screen.getByText("Recent Journal Entries")).toBeInTheDocument();
    expect(screen.getByText("View All")).toBeInTheDocument();
    expect(screen.getByText("+ New Journal Entry")).toBeInTheDocument();

    // Check for journal entries
    expect(screen.getByText("A good day")).toBeInTheDocument();
    expect(
      screen.getByText("Feeling anxious about presentation")
    ).toBeInTheDocument();
  });

  test("displays daily affirmation", () => {
    renderWithRouter(<HomePage isAuthenticated={false} user={null} />);

    // Check that affirmation section is present
    expect(screen.getByText("Today's Affirmation")).toBeInTheDocument();

    // Check that some affirmation text is displayed (we can't know which one due to randomness)
    const affirmationElement = screen.getByText(
      "Today's Affirmation"
    ).nextElementSibling;
    expect(affirmationElement).toBeInTheDocument();
    expect(affirmationElement.textContent).not.toBe("");
  });
});
