import { describe, it, expect } from 'vitest'
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { fireEvent } from "@testing-library/react"
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "./context-menu"

describe("ContextMenu Component", () => {
  it("opens on trigger contextmenu event and closes on Escape", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <button>Target</button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Item A</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    )

    const target = screen.getByRole("button", { name: /target/i })
  fireEvent.contextMenu(target)
    expect(await screen.findByText("Item A")).toBeVisible()

    await user.keyboard("{Escape}")
    expect(screen.queryByText("Item A")).toBeNull()
  })
})
