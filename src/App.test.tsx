import { render } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from './store/index';
import App from './App';

test('renders the App component', () => {
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
