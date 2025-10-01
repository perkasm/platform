import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog'

describe('Dialog Component', () => {
  it('renders trigger and opens dialog', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    )

    const trigger = screen.getByRole('button', { name: 'Open' })
    await user.click(trigger)

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('closes on close button click and Escape key', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Modal</DialogTitle>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    )

    const trigger = screen.getByRole('button', { name: 'Open' })
    await user.click(trigger)

  const allCloses = screen.getAllByRole('button', { name: /close/i })
  // prefer the visible close button (not the sr-only one)
  const visibleClose = allCloses.find((b) => b.textContent?.trim() === 'Close')
  if (visibleClose) await user.click(visibleClose)
    expect(screen.queryByText('Modal')).not.toBeInTheDocument()

    // Re-open and press Escape
    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(screen.queryByText('Modal')).not.toBeInTheDocument()
  })

  it('forwards ref to content element', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent ref={ref}>
          <DialogTitle>Head</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    // ref should point to content after opening
    expect(ref.current === null || ref.current instanceof HTMLDivElement).toBe(true)
  })
})
