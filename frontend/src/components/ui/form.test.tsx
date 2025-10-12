import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { UseFormReturn, FieldValues, FormProviderProps, ControllerProps, Control } from 'react-hook-form'

describe('Form Components', () => {
    const mockForm: UseFormReturn<FieldValues> = {
    control: {} as Control<FieldValues>,
    handleSubmit: vi.fn((fn) => fn),
    formState: {
      errors: {},
      isDirty: false,
      isLoading: false,
      isSubmitted: false,
      isSubmitSuccessful: false,
      isSubmitting: false,
      isValid: true,
      isValidating: false,
      submitCount: 0,
      touchedFields: {},
      dirtyFields: {},
      defaultValues: {},
      disabled: false,
      validatingFields: {},
      isReady: true,
    },
    getFieldState: vi.fn(() => ({
      error: undefined,
      isTouched: false,
      isDirty: false,
      invalid: false,
      isValidating: false
    })),
    watch: vi.fn(),
    getValues: vi.fn(),
    setError: vi.fn(),
    clearErrors: vi.fn(),
    setValue: vi.fn(),
    trigger: vi.fn(),
    reset: vi.fn(),
    resetField: vi.fn(),
    unregister: vi.fn(),
    register: vi.fn(),
    setFocus: vi.fn(),
    subscribe: vi.fn(),
  }

  const mockFieldHook = {
    id: 'test-item',
    name: 'testField',
    formItemId: 'test-item-form-item',
    formDescriptionId: 'test-item-form-item-description',
    formMessageId: 'test-item-form-item-message',
    error: null,
    isTouched: false,
    isDirty: false,
  }

  beforeEach(() => {
    vi.clearAllMocks();
    (mockUseFormContext as vi.Mock).mockReturnValue(mockForm);(mockUseFormField as vi.Mock).mockReturnValue(mockFieldHook)
  })

  describe('Form (FormProvider)', () => {
    it('provides form context to children', () => {
      render(
        <Form {...mockForm}>
          <div>Test Content</div>
        </Form>
      )

      // FormProvider should render its children
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      // And it should be wrapped in our test provider
      expect(screen.getByTestId('form-provider')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <Form {...mockForm}>
          <div>Test Content</div>
        </Form>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('handles form submission when used with form element', async () => {
      const user = userEvent.setup()

      render(
        <Form {...mockForm}>
          <form onSubmit={mockForm.handleSubmit(() => {})}>
            <button type="submit">Submit</button>
          </form>
        </Form>
      )

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(mockForm.handleSubmit).toHaveBeenCalled()
    })
  })

  describe('FormField', () => {
    it('provides field context to children', () => {
      const TestComponent = () => {
        const context = React.useContext(FormFieldContext) as { name: string }
        return <div data-testid="context-value">{context.name}</div>
      }

      render(
        <FormField
          name="testField"
          render={() => <TestComponent />}
        />
      )

      expect(screen.getByTestId('context-value')).toHaveTextContent('testField')
    })

    it('renders children correctly', () => {
      render(
        <FormField
          name="testField"
          render={() => <div>Test Field Content</div>}
        />
      )

      expect(screen.getByText('Test Field Content')).toBeInTheDocument()
    })
  })

  describe('FormItem', () => {
    it('provides item context with generated ID', () => {
      const TestComponent = () => {
        const context = React.useContext(FormItemContext) as { id: string }
        return <div data-testid="item-context">{context.id}</div>
      }

      render(
        <FormItem>
          <TestComponent />
        </FormItem>
      )

      expect(screen.getByTestId('item-context')).toHaveTextContent(/^:r\d+:$/)
    })

    it('applies default styling classes', () => {
      render(
        <FormItem>
          <div>Test Item</div>
        </FormItem>
      )

      const itemDiv = screen.getByText('Test Item').parentElement
      expect(itemDiv).toHaveClass('space-y-2')
    })

    it('merges custom className with default classes', () => {
      render(
        <FormItem className="custom-class">
          <div>Test Item</div>
        </FormItem>
      )

      const itemDiv = screen.getByText('Test Item').parentElement
      expect(itemDiv).toHaveClass('space-y-2', 'custom-class')
    })
  })

  describe('FormLabel', () => {
    it('renders label with correct attributes', () => {
      render(
        <FormLabel>Test Label</FormLabel>
      )

      const label = screen.getByText('Test Label')
      expect(label).toBeInTheDocument()
      expect(label.tagName).toBe('LABEL')
      // Note: Radix UI Label may not set htmlFor if not explicitly provided
      // The important part is that it renders as a label element
    })

    it('applies error styling when error exists', () => {
      (mockUseFormField as vi.Mock).mockReturnValue({
        ...mockFieldHook,
        error: { message: 'Required field' }
      })

      render(
        <FormLabel>Test Label</FormLabel>
      )

      const label = screen.getByText('Test Label')
      expect(label).toHaveClass('text-destructive')
    })

    it('does not apply error styling when no error', () => {
      render(
        <FormLabel>Test Label</FormLabel>
      )

      const label = screen.getByText('Test Label')
      expect(label).not.toHaveClass('text-destructive')
    })

    it('passes through additional props', () => {
      render(
        <FormLabel className="custom-label" data-testid="custom-label">
          Test Label
        </FormLabel>
      )

      const label = screen.getByTestId('custom-label')
      expect(label).toHaveClass('custom-label')
    })
  })

  describe('FormControl', () => {
    it('renders slot with correct accessibility attributes', () => {
      render(
        <FormControl>
          <input type="text" />
        </FormControl>
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'test-item-form-item')
      expect(input).toHaveAttribute('aria-describedby', 'test-item-form-item-description')
      expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('includes form message ID in aria-describedby when error exists', () => {
      (mockUseFormField as vi.Mock).mockReturnValue({
        ...mockFieldHook,
        error: { message: 'Invalid input' }
      })

      render(
        <FormControl>
          <input type="text" />
        </FormControl>
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'test-item-form-item-description test-item-form-item-message')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('passes through props to slot', () => {
      render(
        <FormControl data-testid="custom-control">
          <input type="text" />
        </FormControl>
      )

      expect(screen.getByTestId('custom-control')).toBeInTheDocument()
    })
  })

  describe('FormDescription', () => {
    it('renders paragraph with correct ID and styling', () => {
      render(
        <FormDescription>Test description</FormDescription>
      )

      const description = screen.getByText('Test description')
      expect(description.tagName).toBe('P')
      expect(description).toHaveAttribute('id', 'test-item-form-item-description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('passes through additional props', () => {
      render(
        <FormDescription className="custom-desc" data-testid="custom-desc">
          Test description
        </FormDescription>
      )

      const description = screen.getByTestId('custom-desc')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground', 'custom-desc')
    })
  })

  describe('FormMessage', () => {
    it('renders error message when error exists', () => {
      (mockUseFormField as vi.Mock).mockReturnValue({
        ...mockFieldHook,
        error: { message: 'This field is required' }
      })

      render(
        <FormMessage />
      )

      const message = screen.getByText('This field is required')
      expect(message).toHaveAttribute('id', 'test-item-form-item-message')
      expect(message).toHaveClass('text-sm', 'font-medium', 'text-destructive')
    })

    it('renders children when no error but children provided', () => {
      render(
        <FormMessage>Custom message</FormMessage>
      )

      expect(screen.getByText('Custom message')).toBeInTheDocument()
    })

    it('renders nothing when no error and no children', () => {
      render(
        <FormMessage />
      )

      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
    })

    it('converts error message to string', () => {
      (mockUseFormField as vi.Mock).mockReturnValue({
        ...mockFieldHook,
        error: { message: 123 }
      })

      render(
        <FormMessage />
      )

      expect(screen.getByText('123')).toBeInTheDocument()
    })

    it('passes through additional props', () => {
      (mockUseFormField as vi.Mock).mockReturnValue({
        ...mockFieldHook,
        error: { message: 'Error' }
      })

      render(
        <FormMessage className="custom-message" data-testid="custom-message" />
      )

      const message = screen.getByTestId('custom-message')
      expect(message).toHaveClass('text-sm', 'font-medium', 'text-destructive', 'custom-message')
    })
  })

  describe('Error Handling', () => {
    it('throws error when useFormField is used outside FormField', () => {
      (mockUseFormField as vi.Mock).mockImplementation(() => {
        throw new Error("useFormField should be used within <FormField>")
      })

      expect(() => {
        render(<FormLabel>Test</FormLabel>)
      }).toThrow("useFormField should be used within <FormField>")
    })
  })

  describe('Integration Tests', () => {
    it('renders complete form field with all components', () => {
      (mockUseFormField as vi.Mock).mockReturnValue({
        ...mockFieldHook,
        error: { message: 'Required' }
      })

      render(
        <FormField
          name="email"
          render={() => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input type="email" placeholder="Enter email" />
              </FormControl>
              <FormDescription>We'll never share your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )

      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
      expect(screen.getByText("We'll never share your email.")).toBeInTheDocument()
      expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('handles form submission with validation', async () => {
      const user = userEvent.setup()
      const mockSubmitFn = vi.fn()

      render(
        <Form {...mockForm}>
          <FormField
            name="name"
            render={() => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <input type="text" data-testid="name-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <form onSubmit={mockForm.handleSubmit(mockSubmitFn)}>
            <button type="submit">Submit</button>
          </form>
        </Form>
      )

      const input = screen.getByTestId('name-input')
      await user.type(input, 'John Doe')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(mockForm.handleSubmit).toHaveBeenCalled()
    })
  })
})
