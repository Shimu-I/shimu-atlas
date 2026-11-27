import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "../components/layout/AppShell";
import { Dashboard } from "../pages/Dashboard";
import { Stub } from "../pages/Stub";
import { ThemeProvider } from "../lib/theme";
import { NAV } from "../lib/nav";

function renderApp(path = "/", onSignOut = vi.fn()) {
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AppShell username="shimu" onSignOut={onSignOut} />}>
            <Route index element={<Dashboard />} />
            {NAV.filter((n) => n.to !== "/").map((n) => <Route key={n.to} path={n.to.slice(1)} element={<Stub />} />)}
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
  return onSignOut;
}

beforeEach(() => { document.documentElement.dataset.theme = "light"; });

describe("navigation", () => {
  it("exposes every section from the spec, including Analytics", () => {
    renderApp();
    const nav = screen.getAllByRole("navigation", { name: "Main" })[0];
    for (const label of ["Home", "My Library", "Reading", "My Notes", "Knowledge Explorer", "AI Assistant",
      "Career Intelligence", "Learning Recommendations", "Projects", "Analytics", "Settings"]) {
      expect(within(nav).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("navigates and marks the current page", async () => {
    renderApp();
    const nav = screen.getAllByRole("navigation", { name: "Main" })[0];
    await userEvent.click(within(nav).getByRole("link", { name: "Analytics" }));
    expect(screen.getByRole("heading", { level: 1, name: "Analytics" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Analytics" })).toHaveAttribute("aria-current", "page");
  });

  it("has a skip link and a breadcrumb on inner pages", () => {
    renderApp("/analytics");
    expect(screen.getByText("Skip to content")).toHaveAttribute("href", "#main");
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });
});

describe("command palette", () => {
  it("opens with Ctrl+K, filters and navigates with the keyboard", async () => {
    renderApp();
    await userEvent.keyboard("{Control>}k{/Control}");
    const box = screen.getByRole("combobox");
    expect(box).toHaveFocus();
    await userEvent.type(box, "analy");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("heading", { level: 1, name: "Analytics" })).toBeInTheDocument();
  });

  it("shows a message when nothing matches", async () => {
    renderApp();
    await userEvent.keyboard("{Control>}k{/Control}");
    await userEvent.type(screen.getByRole("combobox"), "zzzz");
    expect(screen.getByText("No matching commands.")).toBeInTheDocument();
  });

  it("can sign out", async () => {
    const onSignOut = renderApp();
    await userEvent.keyboard("{Control>}k{/Control}");
    await userEvent.type(screen.getByRole("combobox"), "sign out");
    await userEvent.keyboard("{Enter}");
    expect(onSignOut).toHaveBeenCalled();
  });
});

describe("theme", () => {
  it("toggles and persists the theme", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("atlas-theme")).toBe("dark");
  });
});

describe("honest empty states", () => {
  it("dashboard shows no invented numbers or books", () => {
    renderApp();
    expect(screen.getByText("No book in progress")).toBeInTheDocument();
    expect(screen.getByText("No notes yet")).toBeInTheDocument();
    expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
  });

  it("analytics page says nothing is back-filled", () => {
    renderApp("/analytics");
    expect(screen.getByText(/nothing is back-filled or invented/i)).toBeInTheDocument();
  });
});
