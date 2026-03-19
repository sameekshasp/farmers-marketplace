// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Suppress console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args) => {
    const arg = args[0];
    if (
      typeof arg === 'string' &&
      (arg.includes('Warning:') ||
        arg.includes('DeprecationWarning') ||
        arg.includes('DEP_WEBPACK'))
    ) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args) => {
    const arg = args[0];
    if (
      typeof arg === 'string' &&
      (arg.includes('Warning:') ||
        arg.includes('DeprecationWarning') ||
        arg.includes('DEP_WEBPACK'))
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
