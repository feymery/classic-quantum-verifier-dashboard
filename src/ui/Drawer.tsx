import type { ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  headerActions,
  children,
}: DrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-2xl overflow-y-auto border-l bg-canvas border-border">
        <div className="flex items-center justify-between px-6 pt-6">
          <span className="text-xl font-semibold text-foreground">{title}</span>
          {headerActions}
        </div>

        <div className="flex-1 px-6 pb-6">{children}</div>
      </div>
    </>
  );
}
