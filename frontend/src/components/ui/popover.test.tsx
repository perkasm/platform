import { describe, it, expect } from 'vitest'
import * as Module from './popover'

describe('Popover component', () => {
  it('module loads', () => {
    expect(Module).toBeTruthy()
  })
})

import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"

describe("Popover Component", () => {
  it("opens content on trigger click and closes on Escape", async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger aria-label="open popover">Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )

    const trigger = screen.getByRole("button", { name: /open popover|open/i })
    await user.click(trigger)
    expect(await screen.findByText("Content")).toBeVisible()

    await user.keyboard("{Escape}")
    expect(screen.queryByText("Content")).toBeNull()
  })
})
