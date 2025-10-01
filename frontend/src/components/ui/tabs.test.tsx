import { describe, it, expect } from 'vitest'
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"

describe('Tabs component', () => {
  describe("Tabs Component", () => {
    it("switches content via click and keyboard", async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="one">
          <TabsList>
            <TabsTrigger value="one">One</TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
          </TabsList>
          <TabsContent value="one">First</TabsContent>
          <TabsContent value="two">Second</TabsContent>
        </Tabs>
      )

      const two = screen.getByRole("tab", { name: /two/i })
      await user.click(two)
      expect(screen.getByText("Second")).toBeVisible()
    })
  })
})
