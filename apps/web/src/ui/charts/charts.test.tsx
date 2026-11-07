import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Heatmap } from "./heatmap";
import { Histogram } from "./histogram";
import { LineChart } from "./line-chart";
import { RankedBars } from "./ranked-bars";
import { Scatter } from "./scatter";
import { StackedBars } from "./stacked-bars";

afterEach(cleanup);

async function drawn(name: string) {
  const chart = await screen.findByRole("img", { name });
  await waitFor(() => expect(chart.querySelector("svg")).toBeTruthy());
  return chart;
}

describe("the chart wrappers", { tags: ["021-US1"] }, () => {
  it("draws ranked bars with the summary as the accessible name", async () => {
    render(
      <RankedBars
        summary="Participation: 12 members, 8 active"
        data={[
          { label: "Members", value: 12 },
          { label: "Active", value: 8 },
        ]}
      />
    );
    const chart = await drawn("Participation: 12 members, 8 active");
    expect(chart.querySelectorAll("svg").length).toBe(1);
  });

  it("draws a histogram from bins", async () => {
    render(
      <Histogram
        summary="Votes per voter"
        bins={[
          { from: 0, to: 5, count: 3 },
          { from: 5, to: 10, count: 7 },
        ]}
      />
    );
    expect((await drawn("Votes per voter")).querySelector("svg")).toBeTruthy();
  });

  it("draws stacked bars with a legend of the series", async () => {
    render(
      <StackedBars
        summary="Choices"
        series={["Interested", "Maybe"]}
        data={[{ label: "Overall", values: { Interested: 5, Maybe: 2 } }]}
      />
    );
    await drawn("Choices");
    expect(screen.getByText("Interested")).toBeTruthy();
    expect(screen.getByText("Maybe")).toBeTruthy();
  });

  it("draws a heatmap with its own scale legend", async () => {
    render(
      <Heatmap
        summary="Use of rooms"
        valueLabel="Sessions"
        cells={[
          { x: "09:00", y: "Hall", value: 0 },
          { x: "10:00", y: "Hall", value: 4 },
        ]}
      />
    );
    await drawn("Use of rooms");
    expect(screen.getByText("Sessions: 0 to 4")).toBeTruthy();
  });

  it("draws lines", async () => {
    render(
      <LineChart
        summary="Proposals per day"
        series={[
          {
            name: "Proposals",
            points: [
              { x: 1, y: 2 },
              { x: 2, y: 5 },
            ],
          },
        ]}
      />
    );
    expect(
      (await drawn("Proposals per day")).querySelector("svg")
    ).toBeTruthy();
  });
});

describe("the scatter", { tags: ["021-US1"] }, () => {
  const points = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ x: i, y: i * 2 + (i % 3) }));

  it("states rho for enough points", async () => {
    render(
      <Scatter
        summary="Late proposals"
        xLabel="Day"
        yLabel="Voters"
        points={points(20)}
      />
    );
    await drawn("Late proposals");
    expect(screen.getByText("ρ = 1.00 (n = 20)")).toBeTruthy();
    expect(screen.queryByText(/too few/i)).toBeNull();
  });

  it("says when n is too small to read a trend", async () => {
    render(<Scatter summary="Few" xLabel="x" yLabel="y" points={points(8)} />);
    await drawn("Few");
    expect(
      screen.getByText(/n = 8: too few points to read a trend/)
    ).toBeTruthy();
  });
});
