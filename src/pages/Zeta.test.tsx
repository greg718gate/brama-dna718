import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Zeta from "./Zeta";

describe("<Zeta /> access gate", () => {
  it("renders the diagnostic portal branding", () => {
    render(
      <MemoryRouter>
        <Zeta />
      </MemoryRouter>
    );
    // The ZETA-CORE title is present on the auth gate
    expect(screen.getByText("ZETA-CORE")).toBeInTheDocument();
  });

  it("toggles between PL and EN", () => {
    render(
      <MemoryRouter>
        <Zeta />
      </MemoryRouter>
    );
    const toggle = screen.getByLabelText("Toggle language");
    const initialLabel = toggle.textContent;
    expect(initialLabel === "PL" || initialLabel === "EN").toBe(true);
    fireEvent.click(toggle);
    // After clicking, the button label flips
    expect(toggle.textContent).not.toBe(initialLabel);
  });
});
