import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/fundamentals", label: "Fundamentals" },
  { to: "/1Qexperiment", label: "Experiment 1Q" },
  { to: "/traps", label: "Traps" },
  { to: "/conclusions", label: "Conclusions" },
];

export function AppNavigation() {
  return (
    <nav className="border-b-[0.3px] border-border">
      <div className="flex flex-row gap-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="px-4 py-3 text-sm font-semibold text-center transition min-w-32"
            style={({ isActive }) =>
              isActive
                ? {
                    color: "var(--color-accent)",
                    borderBottom: "2px solid var(--color-accent)",
                  }
                : {
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
