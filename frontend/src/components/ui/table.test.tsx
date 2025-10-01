import { describe, it, expect } from 'vitest'
import { render, screen } from "@testing-library/react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table"

describe("Table Component", () => {
  it("renders header and body rows", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Col A</TableHead>
            <TableHead>Col B</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
            <TableCell>2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(screen.getByText("Col A")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })
})
