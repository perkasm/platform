/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

// Augment the Vitest expect with jest-dom matchers
import '@testing-library/jest-dom';

declare global {
  // allow importing this file in TypeScript tests without errors
  // no additional globals required - the reference types above provide matcher typings
}

export {};
