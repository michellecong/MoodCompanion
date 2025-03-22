import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import JournalPreview from './JournalPreview';

// Wrapper to provide Router context for Link components
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('JournalPreview Component', () => {
  // Test data
  const mockJournals = [
    { 
      _id: '1', 
      title: 'Happy Day', 
      content: 'Today was a great day with lots of sunshine.',
      createdAt: '2023-05-15T12:00:00Z',
      emotionsDetected: [
        { name: 'joy', score: 0.9 },
        { name: 'satisfaction', score: 0.7 }
      ]
    },
    { 
      _id: '2', 
      title: 'Feeling Down', 
      content: 'Not feeling my best today, hoping tomorrow is better.',
      createdAt: '2023-05-14T10:00:00Z',
      emotionsDetected: [
        { name: 'sadness', score: 0.8 },
        { name: 'anxiety', score: 0.5 }
      ]
    }
  ];

  test('renders no journals message when no journals provided', () => {
    renderWithRouter(<JournalPreview journals={[]} />);
    expect(screen.getByText('No journal entries yet. Create your first one!')).toBeInTheDocument();
  });

  test('renders journal entries correctly', () => {
    renderWithRouter(<JournalPreview journals={mockJournals} />);
    
    // Check if titles are rendered
    expect(screen.getByText('Happy Day')).toBeInTheDocument();
    expect(screen.getByText('Feeling Down')).toBeInTheDocument();
    
    // Check if content excerpts are rendered (using a more flexible approach)
    expect(screen.getByText(/Today was a great day with lots of sunshine/)).toBeInTheDocument();
    expect(screen.getByText(/Not feeling my best today, hoping tomorrow is better/)).toBeInTheDocument();
    
    // Check if dates are formatted correctly
    expect(screen.getByText('May 15, 2023')).toBeInTheDocument();
    expect(screen.getByText('May 14, 2023')).toBeInTheDocument();
  });

  test('renders correct emotion emojis', () => {
    const { container } = renderWithRouter(<JournalPreview journals={mockJournals} />);
    
    // Use querySelector to find the emotion containers
    const emotionContainers = container.querySelectorAll('.journal-emotions');
    
    // Check if the emotion containers exist and have the correct emoji content
    expect(emotionContainers.length).toBe(2);
    expect(emotionContainers[0].textContent).toBe('😊'); // Joy emoji for first journal
    expect(emotionContainers[1].textContent).toBe('😢'); // Sadness emoji for second journal
  });

  test('renders links to individual journal pages', () => {
    renderWithRouter(<JournalPreview journals={mockJournals} />);
    
    // Get all links and check their hrefs
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('/journal/1');
    expect(links[1].getAttribute('href')).toBe('/journal/2');
  });
});