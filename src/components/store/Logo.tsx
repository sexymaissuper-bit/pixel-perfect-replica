import { Link } from "@tanstack/react-router";
import { PawPrint } from "lucide-react";
import { storeConfig } from "@/config/store";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label={`${storeConfig.name} — página inicial`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <PawPrint className="h-5 w-5" aria-hidden />
      </span>
      {!compact && (
        <span className="text-lg font-extrabold leading-none tracking-tight text-primary-foreground">
          {storeConfig.name}
        </span>
      )}
    </Link>
  );
}
