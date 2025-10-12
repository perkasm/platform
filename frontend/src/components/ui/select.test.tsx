import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from './select'

describe('Select Component', () => {
  beforeAll(() => {
    // Radix expects these DOM methods in some environments (pointer capture & scrollIntoView)
    // Provide no-op implementations so tests in jsdom don't throw.

    // @ts-expect-error: JSDOM doesn't support these methods, but Radix does
    if (typeof HTMLElement !== 'undefined') {
      // @ts-expect-error: JSDOM doesn't support these methods, but Radix does
      HTMLElement.prototype.hasPointerCapture = HTMLElement.prototype.hasPointerCapture || function () { return false }
      // @ts-expect-error: JSDOM doesn't support these methods, but Radix does
      HTMLElement.prototype.setPointerCapture = HTMLElement.prototype.setPointerCapture || function () {}
      // @ts-expect-error: JSDOM doesn't support these methods, but Radix does
      HTMLElement.prototype.releasePointerCapture = HTMLElement.prototype.releasePointerCapture || function () {}
      // @ts-expect-error: JSDOM doesn't support these methods, but Radix does
      HTMLElement.prototype.scrollIntoView = HTMLElement.prototype.scrollIntoView || function () {}
    }
  })

  it('renders trigger with placeholder value', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">One</SelectItem>
        </SelectContent>
      </Select>
    )

  const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
    expect(screen.getByText('Choose')).toBeInTheDocument()
  })

  it('opens content and selects an option', async () => {
    const user = userEvent.setup()

    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Beta</SelectItem>
          <SelectItem value="c">Charlie</SelectItem>
        </SelectContent>
      </Select>
    )

  const trigger = screen.getByRole('combobox')
  await user.click(trigger)

  // options render in a portal, wait for the option to appear
  const option = await screen.findByRole('option', { name: 'Beta' })
  await user.click(option)

  // selected value should be visible in trigger (value may be rendered inside the trigger)
  expect(await screen.findByText('Beta')).toBeInTheDocument()
  })

  it('supports keyboard navigation (ArrowDown + Enter)', async () => {
    const user = userEvent.setup()

    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Nav" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">One</SelectItem>
          <SelectItem value="2">Two</SelectItem>
          <SelectItem value="3">Three</SelectItem>
        </SelectContent>
      </Select>
    )

  const trigger = screen.getByRole('combobox')
  // open the list first and wait for options to render in the portal
  await user.click(trigger)
  await screen.findByRole('option', { name: 'One' })

  // Arrow down once to second item and press Enter
  await user.keyboard('{ArrowDown}{Enter}')

    const combobox = await screen.findByRole('combobox')
    expect(combobox.textContent).toContain('Two')
  })

  it('forwards ref to trigger element', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <Select>
        <SelectTrigger ref={ref}>
          <SelectValue placeholder="Ref" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">X</SelectItem>
        </SelectContent>
      </Select>
    )

    expect(ref.current).toBeInstanceOf(HTMLElement)
  })
})
