import { describe, it, expect } from 'vitest'
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Switch } from "./switch"

describe("Switch Component", () => {
  it("toggles via click and keyboard", async () => {
    const user = userEvent.setup()
    render(<Switch aria-label="enable" />)
    const sw = screen.getByRole("switch", { name: /enable/i })
    expect(sw).toHaveAttribute("data-state", "unchecked")
    await user.click(sw)
    expect(sw).toHaveAttribute("data-state", "checked")
    await user.keyboard(" ")
    expect(sw).toHaveAttribute("data-state", "unchecked")
  })
})

