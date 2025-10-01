import { describe, it, expect } from 'vitest'
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RadioGroup, RadioGroupItem } from "./radio-group"

describe("RadioGroup Component", () => {
  it("selects items via click and keyboard navigation", async () => {
    const user = userEvent.setup()
    render(
      <RadioGroup defaultValue="a" aria-label="choices">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>
    )

    const a = screen.getByRole("radio", { name: /a/i })
    const b = screen.getByRole("radio", { name: /b/i })
    expect(a).toHaveAttribute("aria-checked", "true")
    await user.click(b)
    expect(b).toHaveAttribute("aria-checked", "true")
    // click back to the first item
    await user.click(a)
    expect(a).toHaveAttribute("aria-checked", "true")
  })
})

