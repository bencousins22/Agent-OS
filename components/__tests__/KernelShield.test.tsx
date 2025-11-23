import React from 'react';
import { render } from '@testing-library/react';
import { KernelShield } from '../KernelShield';

describe('KernelShield', () => {
  it('renders without crashing', () => {
    render(<KernelShield />);
  });
});
