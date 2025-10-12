import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from './textarea'

describe('Textarea Component', () => {
  it('should render without crashing', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<Textarea ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    const { container } = render(<Textarea className="custom-class" />)
    const textarea = container.querySelector('textarea')
    expect(textarea).toHaveClass('custom-class')
  })

  it('should have correct default classes', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')
    expect(textarea).toHaveClass(
      'flex',
      'min-h-[80px]',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-background',
      'px-3',
      'py-2',
      'text-sm',
      'ring-offset-background',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50'
    )
  })

  it('should forward other props', () => {
    render(<Textarea data-testid="custom-textarea" placeholder="Enter text" />)
    const textarea = screen.getByTestId('custom-textarea')
    expect(textarea).toHaveAttribute('placeholder', 'Enter text')
  })

  it('should handle value prop', () => {
    render(<Textarea value="test value" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('test value')
  })

  it('should handle defaultValue prop', () => {
    render(<Textarea defaultValue="default value" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('default value')
  })

  it('should handle disabled prop', () => {
    render(<Textarea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('should handle readOnly prop', () => {
    render(<Textarea readOnly />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('readonly')
  })

  it('should handle rows prop', () => {
    render(<Textarea rows={5} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('should handle cols prop', () => {
    render(<Textarea cols={30} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('cols', '30')
  })

  it('should handle maxLength prop', () => {
    render(<Textarea maxLength={100} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('maxlength', '100')
  })

  it('should handle minLength prop', () => {
    render(<Textarea minLength={10} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('minlength', '10')
  })

  it('should handle required prop', () => {
    render(<Textarea required />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('required')
  })

  it('should handle name prop', () => {
    render(<Textarea name="description" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('name', 'description')
  })

  it('should handle id prop', () => {
    render(<Textarea id="textarea-id" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('id', 'textarea-id')
  })

  it('should handle autoComplete prop', () => {
    render(<Textarea autoComplete="off" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('autocomplete', 'off')
  })

  it('should handle spellCheck prop', () => {
    render(<Textarea spellCheck={false} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('spellcheck', 'false')
  })

  it('should handle wrap prop', () => {
    render(<Textarea wrap="hard" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('wrap', 'hard')
  })

  it('should be focusable', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.click(textarea)
    expect(textarea).toHaveFocus()
  })

  it('should handle user input', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'Hello World')
    expect(textarea).toHaveValue('Hello World')
  })

  it('should handle onChange callback', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Textarea onChange={handleChange} />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'a')
    expect(handleChange).toHaveBeenCalled()
  })

  it('should handle onFocus callback', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()
    render(<Textarea onFocus={handleFocus} />)
    const textarea = screen.getByRole('textbox')

    await user.click(textarea)
    expect(handleFocus).toHaveBeenCalled()
  })

  it('should handle onBlur callback', async () => {
    const user = userEvent.setup()
    const handleBlur = vi.fn()
    render(<Textarea onBlur={handleBlur} />)
    const textarea = screen.getByRole('textbox')

    await user.click(textarea)
    await user.tab()
    expect(handleBlur).toHaveBeenCalled()
  })

  it('should have correct displayName', () => {
    expect(Textarea.displayName).toBe('Textarea')
  })

  it('should merge classes correctly with cn utility', () => {
    const { container } = render(<Textarea className="custom-class another-class" />)
    const textarea = container.querySelector('textarea')
    expect(textarea).toHaveClass('custom-class', 'another-class')
    // Should still have default classes
    expect(textarea).toHaveClass('flex', 'min-h-[80px]')
  })

  it('should handle aria attributes', () => {
    render(<Textarea aria-label="Description" aria-describedby="help-text" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-label', 'Description')
    expect(textarea).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('should handle data attributes', () => {
    render(<Textarea data-cy="textarea" data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea).toHaveAttribute('data-cy', 'textarea')
  })
})
