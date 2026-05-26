import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { Button } from "../ui";

const NAV_ITEMS = [
  { to: "/motivation", label: "Motivation" },
  { to: "/fundamentals", label: "Fundamentals" },
  { to: "/1Qexperiment", label: "Experiment 1Q" },
  { to: "/adversarial", label: "Adversarial" },
  { to: "/conclusions", label: "Conclusions" },
];

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface AppNavigationProps {
  onOpenHistory: () => void;
}

export function AppNavigation({ onOpenHistory }: AppNavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass =
    "px-4 py-3 text-sm font-semibold text-center transition min-w-32";
  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? {
          color: "var(--color-accent)",
          borderBottom: "2px solid var(--color-accent)",
        }
      : { color: "var(--color-muted)" };

  const mobileNavLinkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? {
          color: "var(--color-accent)",
          borderLeft: "2px solid var(--color-accent)",
        }
      : { color: "var(--color-muted)" };

  return (
    <nav className="border-b-2 border-border">
      {/* Desktop layout */}
      <div className="flex-row items-center justify-between hidden lg:flex">
        <div className="flex flex-row gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass}
              style={navLinkStyle}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button onClick={onOpenHistory} aria-label="Open history">
            History
          </Button>
          <Button
            className="h-full"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-row items-center justify-between px-2 py-1 lg:hidden">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          className="p-2 rounded text-muted"
          style={{ color: "var(--color-muted)" }}
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>

        <div className="flex items-center gap-1">
          <Button onClick={onOpenHistory} aria-label="Open history">
            History
          </Button>
          <Button
            className="h-full"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="flex flex-col border-t md:hidden border-border"
          style={{ background: "var(--color-surface)" }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 pl-5 text-sm font-semibold transition"
              style={mobileNavLinkStyle}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
