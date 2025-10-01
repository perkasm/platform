import { describe, it, expect } from 'vitest'
import React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu"

describe("DropdownMenu Component", () => {
  it("renders trigger and opens content with keyboard and click", async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="open menu">Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
          <DropdownMenuItem>Two</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByRole("button", { name: /open menu/i })
    await user.click(trigger)
    const item = await screen.findByText("One")
    expect(item).toBeVisible()

    // close via Escape
    await user.keyboard("{Escape}")
    expect(item).not.toBeInTheDocument()
  })
})
