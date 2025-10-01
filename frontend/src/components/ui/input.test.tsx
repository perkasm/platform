import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { Input } from './input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render input with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render input with value', () => {
      render(<Input value="Test value" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Test value');
    });

    it('should render input with default value', () => {
      render(<Input defaultValue="Default value" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Default value');
    });

    it('should apply custom className', () => {
      render(<Input className="custom-input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-input');
    });
  });

  describe('Input Types', () => {
    it('should render text input', () => {
      render(<Input type="text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render email input', () => {
      render(<Input type="email" />);
      const input = document.querySelector('input[type="email"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render number input', () => {
      render(<Input type="number" />);
      const input = document.querySelector('input[type="number"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render search input', () => {
      render(<Input type="search" />);
      const input = document.querySelector('input[type="search"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should render tel input', () => {
      render(<Input type="tel" />);
      const input = document.querySelector('input[type="tel"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render url input', () => {
      render(<Input type="url" />);
      const input = document.querySelector('input[type="url"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'url');
    });

    it('should render date input', () => {
      render(<Input type="date" />);
      const input = document.querySelector('input[type="date"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'date');
    });

    it('should render time input', () => {
      render(<Input type="time" />);
      const input = document.querySelector('input[type="time"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'time');
    });

    it('should render file input', () => {
      render(<Input type="file" />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'file');
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should apply disabled styles', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should handle readonly state', () => {
      render(<Input readOnly value="Read only" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should handle required state', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });
  });

  describe('Value Changes', () => {
    it('should call onChange when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'Hello');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value on user input', async () => {
      const user = userEvent.setup();
      
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.type(input, 'Test input');
      expect(input.value).toBe('Test input');
    });

    it('should handle controlled input', async () => {
      const TestComponent = () => {
        const [value, setValue] = useState('');
        return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
      };
      
      const user = userEvent.setup();
      render(<TestComponent />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.type(input, 'Controlled');
      expect(input.value).toBe('Controlled');
    });

    it('should handle uncontrolled input', async () => {
      const user = userEvent.setup();
      
      render(<Input defaultValue="Initial" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.clear(input);
      await user.type(input, 'Uncontrolled');
      expect(input.value).toBe('Uncontrolled');
    });

    it('should not change value when disabled', async () => {
      const user = userEvent.setup();
      
      render(<Input disabled defaultValue="Disabled" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.type(input, 'New');
      expect(input.value).toBe('Disabled');
    });

    it('should not change value when readonly', async () => {
      const user = userEvent.setup();
      
      render(<Input readOnly defaultValue="Read only" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.type(input, 'New');
      expect(input.value).toBe('Read only');
    });
  });

  describe('Validation', () => {
    it('should support minLength attribute', () => {
      render(<Input minLength={5} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minlength', '5');
    });

    it('should support maxLength attribute', () => {
      render(<Input maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxlength', '10');
    });

    it('should support pattern attribute', () => {
      render(<Input pattern="[0-9]*" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });

    it('should support min attribute for number input', () => {
      render(<Input type="number" min={0} />);
      const input = document.querySelector('input[type="number"]');
      expect(input).toHaveAttribute('min', '0');
    });

    it('should support max attribute for number input', () => {
      render(<Input type="number" max={100} />);
      const input = document.querySelector('input[type="number"]');
      expect(input).toHaveAttribute('max', '100');
    });

    it('should support step attribute for number input', () => {
      render(<Input type="number" step={0.1} />);
      const input = document.querySelector('input[type="number"]');
      expect(input).toHaveAttribute('step', '0.1');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Username" />);
      expect(screen.getByRole('textbox', { name: 'Username' })).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="help-text" />
          <div id="help-text">Enter your username</div>
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should support aria-invalid', () => {
      render(<Input aria-invalid="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should support aria-required', () => {
      render(<Input aria-required="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      await user.tab();
      expect(input).toHaveFocus();
    });

    it('should have focus-visible ring styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring');
    });
  });

  describe('Base Styles', () => {
    it('should have flex display', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex');
    });

    it('should have correct height and width', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('h-10', 'w-full');
    });

    it('should have rounded corners', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('rounded-md');
    });

    it('should have border styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border', 'border-input');
    });

    it('should have background color', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-background');
    });

    it('should have padding', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-3', 'py-2');
    });

    it('should have text size', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('text-base', 'md:text-sm');
    });

    it('should have placeholder styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('placeholder:text-muted-foreground');
    });

    it('should have file input styles', () => {
      render(<Input type="file" />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveClass('file:border-0', 'file:bg-transparent', 'file:text-sm', 'file:font-medium');
    });
  });

  describe('HTML Attributes', () => {
    it('should support name attribute', () => {
      render(<Input name="username" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('should support id attribute', () => {
      render(<Input id="email-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('should support autocomplete attribute', () => {
      render(<Input autoComplete="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });

    it('should support data attributes', () => {
      render(<Input data-testid="custom-input" data-value="test" />);
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('data-value', 'test');
    });

    it('should support form attribute', () => {
      render(<Input form="my-form" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('form', 'my-form');
    });
  });

  describe('Event Handlers', () => {
    it('should call onFocus when focused', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur when blurred', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should call onKeyDown on key press', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      await user.keyboard('A');
      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('should call onKeyUp on key release', async () => {
      const handleKeyUp = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onKeyUp={handleKeyUp} />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      await user.keyboard('A');
      expect(handleKeyUp).toHaveBeenCalled();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });

    it('should allow ref to access input methods', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.focus).toBeDefined();
    });

    it('should allow programmatic focus via ref', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      render(<Input value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle null className', () => {
      render(<Input className={null as any} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle undefined type', () => {
      render(<Input type={undefined} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle special characters in value', async () => {
      const user = userEvent.setup();
      
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.type(input, '!@#$%^&*()');
      expect(input.value).toBe('!@#$%^&*()');
    });

    it('should handle very long text', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(1000);
      
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.type(input, longText);
      expect(input.value).toBe(longText);
    });

    it('should handle number input with decimals', async () => {
      const user = userEvent.setup();
      
      render(<Input type="number" step={0.01} />);
      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
      
      await user.type(input, '123.45');
      expect(input.value).toBe('123.45');
    });
  });
});
