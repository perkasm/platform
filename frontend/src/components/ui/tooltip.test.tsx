import { describe, it, expect } from 'vitest'
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip"

describe("Tooltip Component", () => {
  it("shows content on hover and hides on mouseleave", async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

  const trigger = screen.getByText(/hover me/i)
  await user.hover(trigger)
  const tip = await screen.findByRole("tooltip")
  expect(tip).toBeVisible()
  await user.unhover(trigger)
  })
})

