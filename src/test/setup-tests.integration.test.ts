import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const persistentMock = vi.fn();
const sampleObj = {
  read(): string {
    return "original";
  }
};

describe("test setup integration", () => {
  it("provides jest-dom matchers and records mock calls", () => {
    render(<div data-testid="node">hello</div>);

    expect(screen.getByTestId("node")).toBeInTheDocument();

    persistentMock("a");
    persistentMock("b");
    expect(persistentMock).toHaveBeenCalledTimes(2);

    vi.spyOn(sampleObj, "read").mockReturnValue("mocked");
    expect(sampleObj.read()).toBe("mocked");
  });

  it("auto-cleans DOM and restores/clears mocks between tests", () => {
    expect(screen.queryByTestId("node")).not.toBeInTheDocument();

    // Cleared by setup-tests afterEach vi.clearAllMocks().
    expect(persistentMock).toHaveBeenCalledTimes(0);

    // Restored by setup-tests afterEach vi.restoreAllMocks().
    expect(sampleObj.read()).toBe("original");
  });
});
