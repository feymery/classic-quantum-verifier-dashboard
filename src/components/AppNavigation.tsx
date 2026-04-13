import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/experiment", label: "Experiment" },
  { to: "/visualization", label: "Visualization" },
  { to: "/circuit", label: "Circuit" },
  { to: "/adversarial", label: "Adversarial" },
];

export function AppNavigation() {
  return (
    <nav className="mb-6 overflow-x-auto rounded-4xl p-1">
      <div className="flex gap-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="min-w-32 rounded-3xl px-4 py-3 text-sm font-semibold transition"
            style={({ isActive }) =>
              isActive
                ? {
                    background: "#a78bfa",
                    color: "#131217",
                    boxShadow: "0 4px 16px rgba(167,139,250,0.25)",
                  }
                : { background: "#181620", color: "#9490a8" }
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
