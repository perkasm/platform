import { describe, it, expect } from 'vitest'
import { render, screen } from "@testing-library/react"
import { Drawer, DrawerContent } from "./drawer"

describe("Drawer Component (render-only)", () => {
  it("renders the drawer content slot", () => {
    render(
      <Drawer open>
        <DrawerContent>
          <div>Panel</div>
        </DrawerContent>
      </Drawer>
    )

    expect(screen.getByText("Panel")).toBeInTheDocument()
  })

  it('renders custom fallback title/description when provided on DrawerContent', () => {
    render(
      <Drawer open>
        <DrawerContent fallbackTitle="MyDrawer" fallbackDescription="Drawer desc">
          <div>Panel</div>
        </DrawerContent>
      </Drawer>
    )

    expect(screen.getByText('MyDrawer')).toBeInTheDocument()
    expect(screen.getByText('Drawer desc')).toBeInTheDocument()
  })
})

