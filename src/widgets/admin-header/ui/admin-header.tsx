import { LogoutButton } from "@/features/auth-logout";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 h-14 shrink-0 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="h-full px-6 flex items-center justify-end gap-3">
        <LogoutButton />
      </div>
    </header>
  );
}
