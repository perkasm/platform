import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Calendar } from "../calendar";

// Mock the button variants
vi.mock("@/components/ui/button", () => ({
  buttonVariants: vi.fn((props: { variant?: string; size?: string; className?: string }) => {
    const { variant = "default", size = "default", className } = props || {};
    const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium";
    const variantClasses: Record<string, string> = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    };
    const sizeClasses: Record<string, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      icon: "h-10 w-10",
    };
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default} ${className || ""}`.trim();
  }),
}));

import { DayPickerProps } from "react-day-picker";

// Mock react-day-picker
vi.mock("react-day-picker", () => ({
  DayPicker: vi.fn(({ children, components, ...props }: DayPickerProps & { children?: React.ReactNode }) => {
    const IconLeft = components?.IconLeft || (() => null);
    const IconRight = components?.IconRight || (() => null);

    return (
      <div data-testid="day-picker" data-props={JSON.stringify(props)}>
        {children || "DayPicker Content"}
        <div data-testid="navigation">
          <IconLeft data-testid="chevron-left" />
          <IconRight data-testid="chevron-right" />
        </div>
      </div>
    );
  }),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ChevronLeft: ({ className }: { className?: string }) => (
    <svg data-testid="chevron-left" className={className} />
  ),
  ChevronRight: ({ className }: { className?: string }) => (
    <svg data-testid="chevron-right" className={className} />
  ),
}));

describe("Calendar Component", () => {
  it("should render without crashing", () => {
    render(<Calendar />);
    expect(screen.getByTestId("day-picker")).toBeInTheDocument();
  });

  it("should apply default showOutsideDays prop", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");
    expect(props.showOutsideDays).toBe(true);
  });

  it("should allow overriding showOutsideDays prop", () => {
    render(<Calendar showOutsideDays={false} />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");
    expect(props.showOutsideDays).toBe(false);
  });

  it("should apply custom className", () => {
    render(<Calendar className="custom-calendar" />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");
    expect(props.className).toContain("p-3");
    expect(props.className).toContain("custom-calendar");
  });

  it("should apply default className when no custom className provided", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");
    expect(props.className).toBe("p-3");
  });

  it("should merge custom classNames with default classNames", () => {
    const customClassNames = {
      months: "custom-months",
      day: "custom-day",
    };

    render(<Calendar classNames={customClassNames} />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    // Check that custom classNames override defaults
    expect(props.classNames.months).toBe("custom-months");
    expect(props.classNames.day).toBe("custom-day");
  });

  it("should render custom navigation icons", () => {
    render(<Calendar />);
    expect(screen.getByTestId("chevron-left")).toBeInTheDocument();
    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
  });

  it("should apply correct className to navigation icons", () => {
    render(<Calendar />);
    expect(screen.getByTestId("chevron-left")).toHaveClass("h-4", "w-4");
    expect(screen.getByTestId("chevron-right")).toHaveClass("h-4", "w-4");
  });

  it("should pass through other DayPicker props", () => {
    const mockDate = new Date("2023-01-01");
    render(<Calendar selected={mockDate} mode="single" />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    // Date objects get serialized to ISO strings in React props
    expect(props.selected).toBe(mockDate.toISOString());
    expect(props.mode).toBe("single");
  });

  it("should have all required classNames defined", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    const expectedClassNames = [
      "months",
      "month",
      "caption",
      "caption_label",
      "nav",
      "nav_button",
      "nav_button_previous",
      "nav_button_next",
      "table",
      "head_row",
      "head_cell",
      "row",
      "cell",
      "day",
      "day_range_end",
      "day_selected",
      "day_today",
      "day_outside",
      "day_disabled",
      "day_range_middle",
      "day_hidden",
    ];

    expectedClassNames.forEach((className) => {
      expect(props.classNames).toHaveProperty(className);
      expect(typeof props.classNames[className]).toBe("string");
    });
  });

  it("should have proper button variant classes in nav_button", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    expect(props.classNames.nav_button).toContain("h-7");
    expect(props.classNames.nav_button).toContain("w-7");
    expect(props.classNames.nav_button).toContain("bg-transparent");
    expect(props.classNames.nav_button).toContain("p-0");
    expect(props.classNames.nav_button).toContain("opacity-50");
  });

  it("should have proper day button classes", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    expect(props.classNames.day).toContain("h-9");
    expect(props.classNames.day).toContain("w-9");
    expect(props.classNames.day).toContain("p-0");
    expect(props.classNames.day).toContain("font-normal");
  });

  it("should have proper selected day styling", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    expect(props.classNames.day_selected).toContain("bg-primary");
    expect(props.classNames.day_selected).toContain("text-primary-foreground");
  });

  it("should have proper today styling", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    expect(props.classNames.day_today).toContain("bg-accent");
    expect(props.classNames.day_today).toContain("text-accent-foreground");
  });

  it("should have proper disabled day styling", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    expect(props.classNames.day_disabled).toContain("text-muted-foreground");
    expect(props.classNames.day_disabled).toContain("opacity-50");
  });

  it("should have proper outside day styling", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    expect(props.classNames.day_outside).toContain("text-muted-foreground");
    expect(props.classNames.day_outside).toContain("opacity-50");
  });

  it("should have proper range styling", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    expect(props.classNames.day_range_middle).toContain("aria-selected:bg-accent");
    expect(props.classNames.day_range_middle).toContain("aria-selected:text-accent-foreground");
  });

  it("should have proper table and cell styling", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    expect(props.classNames.table).toContain("w-full");
    expect(props.classNames.table).toContain("border-collapse");
    expect(props.classNames.cell).toContain("h-9");
    expect(props.classNames.cell).toContain("w-9");
    expect(props.classNames.cell).toContain("text-center");
  });

  it("should have proper caption and navigation styling", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    expect(props.classNames.caption).toContain("flex");
    expect(props.classNames.caption).toContain("justify-center");
    expect(props.classNames.nav).toContain("space-x-1");
    expect(props.classNames.nav).toContain("flex");
    expect(props.classNames.nav).toContain("items-center");
  });

  it("should have proper month layout styling", () => {
    render(<Calendar />);
    const dayPicker = screen.getByTestId("day-picker");
    const props = JSON.parse(dayPicker.getAttribute("data-props") || "{}");

    expect(props.classNames.months).toContain("flex");
    expect(props.classNames.months).toContain("flex-col");
    expect(props.classNames.months).toContain("sm:flex-row");
    expect(props.classNames.month).toContain("space-y-4");
  });
});