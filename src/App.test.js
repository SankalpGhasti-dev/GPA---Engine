import { render, screen } from '@testing-library/react';
import App from './App';

test('renders GPA Engine app title', () => {
  render(<App />);
  const titleElements = screen.getAllByText(/GPA Engine/i);
  expect(titleElements.length).toBeGreaterThan(0);
});
