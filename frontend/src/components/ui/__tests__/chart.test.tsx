import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChart,
} from "../chart";

// Mock Recharts components
vi.mock("recharts", () => ({
  ResponsiveContainer: vi.fn(({ children, ...props }) => (
    <div data-testid="responsive-container" data-props={JSON.stringify(props)}>
      {children}
    </div>
  )),
  Tooltip: vi.fn((props) => (
    <div data-testid="recharts-tooltip" data-props={JSON.stringify(props)} />
  )),
  Legend: vi.fn((props) => (
    <div data-testid="recharts-legend" data-props={JSON.stringify(props)} />
  )),
}));

// Test component that uses the useChart hook
const TestUseChartComponent = () => {
  const { config } = useChart();
  return <div data-testid="use-chart-result">{JSON.stringify(config)}</div>;
};

describe("Chart Components", () => {
  const mockConfig = {
    desktop: {
      label: "Desktop",
      color: "#2563eb",
    },
    mobile: {
      label: "Mobile",
      color: "#60a5fa",
    },
  };

  describe("ChartContainer", () => {
    it("should render without crashing", () => {
      render(
        <ChartContainer config={mockConfig}>
          <div>Test Chart</div>
        </ChartContainer>
      );
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <ChartContainer config={mockConfig} className="custom-chart">
          <div>Test Chart</div>
        </ChartContainer>
      );
      const container = screen.getByTestId("responsive-container").parentElement;
      expect(container).toHaveClass("custom-chart");
    });

    it("should apply default className", () => {
      render(
        <ChartContainer config={mockConfig}>
          <div>Test Chart</div>
        </ChartContainer>
      );
      const container = screen.getByTestId("responsive-container").parentElement;
      expect(container).toHaveClass("flex", "aspect-video", "justify-center", "text-xs");
    });

    it("should merge custom className with default", () => {
      render(
        <ChartContainer config={mockConfig} className="custom-chart">
          <div>Test Chart</div>
        </ChartContainer>
      );
      const container = screen.getByTestId("responsive-container").parentElement;
      expect(container).toHaveClass("flex", "aspect-video", "justify-center", "text-xs", "custom-chart");
    });

    it("should generate unique chart ID", () => {
      render(
        <ChartContainer config={mockConfig}>
          <div>Test Chart</div>
        </ChartContainer>
      );
      const container = screen.getByTestId("responsive-container").parentElement;
      expect(container).toBeInTheDocument();
      const chartId = container!.getAttribute("data-chart");
      expect(chartId).toMatch(/^chart-/);
    });

    it("should use provided ID", () => {
      render(
        <ChartContainer config={mockConfig} id="custom-chart">
          <div>Test Chart</div>
        </ChartContainer>
      );
      const container = screen.getByTestId("responsive-container").parentElement;
      expect(container).toHaveAttribute("data-chart", "chart-custom-chart");
    });

    it("should pass config to context", () => {
      render(
        <ChartContainer config={mockConfig}>
          <TestUseChartComponent />
        </ChartContainer>
      );
      const result = screen.getByTestId("use-chart-result");
      expect(JSON.parse(result.textContent || "{}")).toEqual(mockConfig);
    });

    it("should render children inside ResponsiveContainer", () => {
      render(
        <ChartContainer config={mockConfig}>
          <div data-testid="chart-child">Chart Content</div>
        </ChartContainer>
      );
      expect(screen.getByTestId("chart-child")).toBeInTheDocument();
    });
  });

  describe("useChart hook", () => {
    it("should throw error when used outside ChartContainer", () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<TestUseChartComponent />)).toThrow(
        "useChart must be used within a <ChartContainer />"
      );

      consoleSpy.mockRestore();
    });

    it("should return config when used inside ChartContainer", () => {
      render(
        <ChartContainer config={mockConfig}>
          <TestUseChartComponent />
        </ChartContainer>
      );
      const result = screen.getByTestId("use-chart-result");
      expect(JSON.parse(result.textContent || "{}")).toEqual(mockConfig);
    });
  });

  describe("ChartStyle", () => {
    it("should render null when no color config", () => {
      const { container } = render(<ChartStyle id="test-chart" config={{}} />);
      expect(container.firstChild).toBeNull();
    });

    it("should render style tag with color variables", () => {
      const { container } = render(<ChartStyle id="test-chart" config={mockConfig} />);
      const style = container.querySelector("style");
      expect(style).toBeInTheDocument();
      expect(style?.textContent).toContain("--color-desktop: #2563eb");
      expect(style?.textContent).toContain("--color-mobile: #60a5fa");
    });

    it("should handle theme-based colors", () => {
      const themeConfig = {
        desktop: {
          label: "Desktop",
          theme: {
            light: "#2563eb",
            dark: "#1d4ed8",
          },
        },
      };

      const { container } = render(<ChartStyle id="test-chart" config={themeConfig} />);
      const style = container.querySelector("style");
      expect(style?.textContent).toContain("--color-desktop: #2563eb");
    });

    it("should generate CSS for both light and dark themes", () => {
      const { container } = render(<ChartStyle id="test-chart" config={mockConfig} />);
      const style = container.querySelector("style");
      expect(style?.textContent).toContain("[data-chart=test-chart]");
      expect(style?.textContent).toContain(".dark [data-chart=test-chart]");
    });
  });

  describe("ChartTooltip", () => {
    it("should render Recharts Tooltip", () => {
      render(<ChartTooltip />);
      expect(screen.getByTestId("recharts-tooltip")).toBeInTheDocument();
    });

    it("should pass through props", () => {
      render(<ChartTooltip active={true} label="Test" />);
      const tooltip = screen.getByTestId("recharts-tooltip");
      const props = JSON.parse(tooltip.getAttribute("data-props") || "{}");
      expect(props.active).toBe(true);
      expect(props.label).toBe("Test");
    });
  });

  describe("ChartTooltipContent", () => {
    const mockPayload = [
      {
        name: "desktop",
        value: 100,
        dataKey: "desktop",
        color: "#2563eb",
        payload: { fill: "#2563eb" },
      },
    ];

    it("should render null when not active", () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={false} payload={mockPayload} />
        </ChartContainer>
      );
      expect(screen.queryByText("100")).not.toBeInTheDocument();
    });

    it("should render null when no payload", () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={[]} />
        </ChartContainer>
      );
      expect(screen.queryByText("Desktop")).not.toBeInTheDocument();
    });

    it("should render tooltip content", () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} />
        </ChartContainer>
      );
      // Look for the specific elements
      expect(screen.getByText("100")).toBeInTheDocument();
      // Check that we have the tooltip content container
      const tooltip = screen.getByText("100").closest(".grid");
      expect(tooltip).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={mockPayload}
            className="custom-tooltip"
          />
        </ChartContainer>
      );
      // Find the tooltip container by the value text and get the outermost div
      const tooltip = screen.getByText("100").closest("div")?.parentElement?.parentElement?.parentElement;
      expect(tooltip).toHaveClass("custom-tooltip");
    });

    it("should hide label when hideLabel is true", () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={mockPayload}
            hideLabel={true}
          />
        </ChartContainer>
      );
      // The main label should be hidden, but item names still show
      expect(screen.getByText("100")).toBeInTheDocument();
      // Check that there's no main label div with font-medium class
      const mainLabels = screen.queryAllByText("Desktop");
      expect(mainLabels.length).toBe(1); // Only the item name should be present
    });

    it("should use custom label", () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={mockPayload}
            label="Custom Label"
          />
        </ChartContainer>
      );
      expect(screen.getByText("Custom Label")).toBeInTheDocument();
    });

    it("should use labelFormatter", () => {
      const labelFormatter = vi.fn(() => "Formatted Label");
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={mockPayload}
            labelFormatter={labelFormatter}
          />
        </ChartContainer>
      );
      expect(labelFormatter).toHaveBeenCalled();
      expect(screen.getByText("Formatted Label")).toBeInTheDocument();
    });

    it("should use formatter for custom value display", () => {
      const formatter = vi.fn(() => ["Custom Value"]);
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={mockPayload}
            formatter={formatter}
          />
        </ChartContainer>
      );
      expect(formatter).toHaveBeenCalled();
      expect(screen.getByText("Custom Value")).toBeInTheDocument();
    });

    it("should render icon when available", () => {
      const configWithIcon = {
        desktop: {
          label: "Desktop",
          icon: () => <span data-testid="test-icon">📊</span>,
        },
      };

      render(
        <ChartContainer config={configWithIcon}>
          <ChartTooltipContent active={true} payload={mockPayload} />
        </ChartContainer>
      );
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("should render indicator based on type", () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} indicator="line" />
        </ChartContainer>
      );
      // Find the indicator div by looking for the div with shrink-0 class
      const indicator = document.querySelector(".shrink-0");
      expect(indicator).toHaveClass("w-1");
    });
  });

  describe("ChartLegend", () => {
    it("should render Recharts Legend", () => {
      render(<ChartLegend />);
      expect(screen.getByTestId("recharts-legend")).toBeInTheDocument();
    });

    it("should pass through props", () => {
      render(<ChartLegend verticalAlign="top" />);
      const legend = screen.getByTestId("recharts-legend");
      const props = JSON.parse(legend.getAttribute("data-props") || "{}");
      expect(props.verticalAlign).toBe("top");
    });
  });

  describe("ChartLegendContent", () => {
    const mockPayload = [
      {
        value: "desktop",
        color: "#2563eb",
      },
      {
        value: "mobile",
        color: "#60a5fa",
      },
    ];

    it("should render null when no payload", () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={[]} />
        </ChartContainer>
      );
      expect(screen.queryByText("Desktop")).not.toBeInTheDocument();
    });

    it("should render legend items", () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={mockPayload} />
        </ChartContainer>
      );
      expect(screen.getByText("Desktop")).toBeInTheDocument();
      expect(screen.getByText("Mobile")).toBeInTheDocument();
    });

    it("should apply custom className to legend container", () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={mockPayload} className="custom-legend" />
        </ChartContainer>
      );
      // Find the container with the custom class
      const legendContainer = document.querySelector(".custom-legend");
      expect(legendContainer).toBeInTheDocument();
    });

    it("should handle vertical alignment", () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={mockPayload} verticalAlign="top" />
        </ChartContainer>
      );
      // Find the container with the vertical alignment class
      const legendContainer = document.querySelector(".pb-3");
      expect(legendContainer).toBeInTheDocument();
    });

    it("should render icons when available", () => {
      const configWithIcon = {
        desktop: {
          label: "Desktop",
          icon: () => <span data-testid="legend-icon">📊</span>,
        },
        mobile: {
          label: "Mobile",
          color: "#60a5fa",
        },
      };

      render(
        <ChartContainer config={configWithIcon}>
          <ChartLegendContent payload={mockPayload} />
        </ChartContainer>
      );
      expect(screen.getByTestId("legend-icon")).toBeInTheDocument();
    });

    it("should hide icons when hideIcon is true", () => {
      const configWithIcon = {
        desktop: {
          label: "Desktop",
          icon: () => <span data-testid="legend-icon">📊</span>,
        },
      };

      render(
        <ChartContainer config={configWithIcon}>
          <ChartLegendContent payload={mockPayload} hideIcon={true} />
        </ChartContainer>
      );
      expect(screen.queryByTestId("legend-icon")).not.toBeInTheDocument();
    });

    it("should use custom nameKey", () => {
      const payloadWithCustomKey = [
        {
          value: "custom",
          color: "#2563eb",
          dataKey: "desktop",
        },
      ];

      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payloadWithCustomKey} nameKey="dataKey" />
        </ChartContainer>
      );
      expect(screen.getByText("Desktop")).toBeInTheDocument();
    });
  });
});