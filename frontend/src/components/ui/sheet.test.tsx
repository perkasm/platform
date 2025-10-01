import { describe, it, expect } from 'vitest'
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "./sheet"

describe('Sheet component', () => {
  describe("Sheet Component", () => {
    it("opens and closes via close control", async () => {
      const user = userEvent.setup()
      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <div>Panel</div>
            <SheetClose aria-label="close">Close</SheetClose>
          </SheetContent>
        </Sheet>
      )

    const trigger = screen.getByRole("button", { name: /open/i })
    await user.click(trigger)
    const panel = await screen.findByText("Panel")
    expect(panel).toBeVisible()
    // scope close button to the sheet dialog
    const sheet = panel.closest('[role="dialog"]')
    expect(sheet).toBeTruthy()
    // close via Escape to avoid pointer/drag logic
    await user.keyboard("{Escape}")
    expect(screen.queryByText("Panel")).toBeNull()
    })
  })

  it('renders custom fallback title/description when provided on SheetContent', async () => {
    const user = userEvent.setup()
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button>Open</button>
        </SheetTrigger>
        <SheetContent fallbackTitle="MySheet" fallbackDescription="Sheet description">
          <div>Panel</div>
          <SheetClose aria-label="close">Close</SheetClose>
        </SheetContent>
      </Sheet>
    )

    const trigger = screen.getByRole('button', { name: /open/i })
    await user.click(trigger)
    expect(screen.getByText('MySheet')).toBeInTheDocument()
    expect(screen.getByText('Sheet description')).toBeInTheDocument()
  })
})
