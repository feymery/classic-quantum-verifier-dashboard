import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/experiment", label: "Experiment" },
  { to: "/visualization", label: "Visualization" },
  { to: "/circuit", label: "Circuit" },
  { to: "/adversarial", label: "Adversarial" },
  { to: "/traps", label: "Trampas" },
];

export function AppNavigation() {
  return (
    <nav className="mb-6 overflow-x-auto rounded-lg p-1">
      <div className="flex gap-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="min-w-32 rounded-lg px-4 py-3 text-sm font-semibold transition"
            style={({ isActive }) =>
              isActive
                ? {
                    background: "var(--color-accent)",
                    color: "var(--color-canvas)",
                    boxShadow: "var(--shadow-glow)",
                  }
                : {
                    background: "var(--color-surface)",
                    color: "var(--color-muted)",
                  }
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
