import { describe, it, expect } from 'vitest'
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Checkbox } from "./checkbox"

describe("Checkbox Component", () => {
  it("toggles checked state via click and keyboard", async () => {
    const user = userEvent.setup()
    render(<Checkbox aria-label="accept" />)
    const cb = screen.getByRole("checkbox", { name: /accept/i })
    expect(cb).not.toBeChecked()
    await user.click(cb)
    expect(cb).toBeChecked()
    await user.keyboard(" ")
    expect(cb).not.toBeChecked()
  })
})
