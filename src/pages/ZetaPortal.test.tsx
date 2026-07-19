import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ZetaPortal from "./ZetaPortal";

describe("<ZetaPortal />", () => {
  it("renders the diagnostic portal branding", () => {
    render(
      <MemoryRouter>
        <ZetaPortal />
      </MemoryRouter>
    );
    expect(screen.getByText("ZETA-CORE")).toBeInTheDocument();
  });

  it("toggles between PL and EN", () => {
    render(
      <MemoryRouter>
        <ZetaPortal />
      </MemoryRouter>
    );
    const toggle = screen.getByLabelText("Toggle language");
    const initialLabel = toggle.textContent;
    expect(initialLabel === "PL" || initialLabel === "EN").toBe(true);
    fireEvent.click(toggle);
    expect(toggle.textContent).not.toBe(initialLabel);
  });
});
