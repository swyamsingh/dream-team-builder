import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { Button } from '../components/ui/button';

describe('Button', () => {
  it('renders label', () => {
    const { getByRole } = render(<Button>Click Me</Button>);
    const btn = getByRole('button');
    expect(btn.textContent).toContain('Click Me');
  });
  it('shows spinner when loading', () => {
    const { getByRole } = render(<Button loading>Loading</Button>);
    const spinner = getByRole('status');
    expect(spinner).toBeTruthy();
  });
});
