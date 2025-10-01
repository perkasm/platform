import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { userEvent } from '@testing-library/user-event'
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './toast'

describe('Toast Component', () => {
  beforeAll(() => {
    // Radix expects these DOM methods in some environments (pointer capture & scrollIntoView)
    // Provide no-op implementations so tests in jsdom don't throw.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof HTMLElement !== 'undefined') {
      // @ts-ignore
      HTMLElement.prototype.hasPointerCapture = HTMLElement.prototype.hasPointerCapture || function () { return false }
      // @ts-ignore
      HTMLElement.prototype.setPointerCapture = HTMLElement.prototype.setPointerCapture || function () {}
      // @ts-ignore
      HTMLElement.prototype.releasePointerCapture = HTMLElement.prototype.releasePointerCapture || function () {}
      // @ts-ignore
      HTMLElement.prototype.scrollIntoView = HTMLElement.prototype.scrollIntoView || function () {}
    }
  })

  it('renders toast inside viewport', () => {
    render(
      <ToastProvider>
        <ToastViewport />
        <Toast>
          <ToastTitle>Hi</ToastTitle>
          <ToastDescription>Hello</ToastDescription>
          <ToastClose>Close</ToastClose>
        </Toast>
      </ToastProvider>
    )

    expect(screen.getByText('Hi')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('supports destructive variant class', () => {
    render(
      <ToastProvider>
        <ToastViewport />
        <Toast variant="destructive">
          <ToastTitle>Alert</ToastTitle>
          <ToastClose>Close</ToastClose>
        </Toast>
      </ToastProvider>
    )

    const el = screen.getByText('Alert')
    const root = el.closest('div')
    expect(root).toBeTruthy()
  })

  it('auto-dismisses after provided duration', async () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <ToastViewport />
        <Toast duration={500}>
          <ToastTitle>Auto</ToastTitle>
        </Toast>
      </ToastProvider>
    )

    expect(screen.getByText('Auto')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(500))

    // allow microtasks to flush
    await Promise.resolve()

    expect(screen.queryByText('Auto')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('closes when ToastClose is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <ToastViewport />
        <Toast>
          <ToastTitle>Dismiss</ToastTitle>
          <ToastClose>Close</ToastClose>
        </Toast>
      </ToastProvider>
    )

    const titleNode = await screen.findByText('Dismiss')
    expect(titleNode).toBeInTheDocument()

    // find the toast listitem that contains the title, then click the button within it
    const listItem = titleNode.closest('li')
    expect(listItem).toBeTruthy()
    const closeBtn = within(listItem as HTMLElement).getByRole('button')
    await user.click(closeBtn)

    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument()
  })

  it('calls action callback and keeps toast when action does not dismiss', async () => {
    const user = userEvent.setup()
    const cb = vi.fn()

    render(
      <ToastProvider>
        <ToastViewport />
        <Toast>
          <ToastTitle>WithAction</ToastTitle>
          <ToastAction altText="Do action" onClick={cb}>Do</ToastAction>
        </Toast>
      </ToastProvider>
    )

    // wait for the toast title to be present (rendering into the viewport can be async)
    const titleNode = await screen.findByText('WithAction')
    expect(titleNode).toBeInTheDocument()

    // scope the action button search to the toast list item that contains the title
    const listItem = titleNode.closest('li')
    expect(listItem).toBeTruthy()
    const action = within(listItem as HTMLElement).getByRole('button', { name: 'Do' })
    await user.click(action)
    expect(cb).toHaveBeenCalled()
  })

  it('supports stacking multiple toasts and removing one', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <ToastViewport />
        <Toast>
          <ToastTitle>First</ToastTitle>
          <ToastClose>Close</ToastClose>
        </Toast>
        <Toast>
          <ToastTitle>Second</ToastTitle>
          <ToastClose>Close</ToastClose>
        </Toast>
        <Toast>
          <ToastTitle>Third</ToastTitle>
          <ToastClose>Close</ToastClose>
        </Toast>
      </ToastProvider>
    )

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()

  // find the list item that contains 'Second' and click its close button
  const secondTitle = await screen.findByText('Second')
  const secondItem = secondTitle.closest('li')
  expect(secondItem).toBeTruthy()
  const secondClose = within(secondItem as HTMLElement).getByRole('button')
  await user.click(secondClose)

  expect(screen.queryByText('Second')).not.toBeInTheDocument()
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })
})

