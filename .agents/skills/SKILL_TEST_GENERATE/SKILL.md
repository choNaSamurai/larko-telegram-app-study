---
name: SKILL_TEST_GENERATE
description: Generates automated tests (Unit and E2E) tailored to the project's testing framework (e.g., Jest/Vitest/Playwright). Use this strictly after business logic verification has succeeded, or whenever the workflow explicitly demands testing coverage for critical components.
---

# Test Generation Instructions

You are responsible for preventing regressions by generating robust automated tests.

## Process
1. **Identify Framework**: Inspect the `package.json` to confirm the testing stack (e.g., Vitest + React Testing Library, Playwright).
2. **Target Components/Logic**: Focus on custom React hooks (`use...`), state managers (Zustand), and complex UI interactions over simple static elements.
3. **Generate Mocks**: Construct mock data required to isolate the unit being tested (API mocks using MSW or module mocking).
4. **Output Test Syntax**: Generate the exact, runnable test script content. Do not write pseudocode.

## Report Structure
```ts
// File: [filename.test.tsx]
import { render, screen } from '@testing-library/react';
// ... generated test code blocks
```
*Follow the code block with instructions on where to save the file and how to run it.*

## Example
**Input**: `export const formatCurrency = (amount: number) => '$' + amount;`
**Output**:
```ts
// File: formatCurrency.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('adds prefix correctly', () => {
    expect(formatCurrency(10)).toBe('$10');
  });
});
```
