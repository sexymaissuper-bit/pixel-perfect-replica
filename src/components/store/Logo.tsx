import { Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { storeConfig } from "@/config/store";
import logo from "@/assets/store-logo-full.png.asset.json";
import { isTripleClick } from "@/lib/admin-rules";

export function Logo({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const clicks = useRef({ count: 0, time: 0 });
  return (
    <Link to="/" onClick={(event) => {
      const now = Date.now();
      clicks.current = { count: now - clicks.current.time < 650 ? clicks.current.count + 1 : 1, time: now };
      if (isTripleClick(clicks.current.count)) { event.preventDefault(); clicks.current.count = 0; navigate({ to: "/admin" }); }
    }} className="flex shrink-0 items-center" aria-label={`${storeConfig.name} — página inicial`}>
      <img src={logo.url} alt={storeConfig.name} width={1580} height={353} className={compact ? "h-auto w-full max-w-80 object-contain" : "h-auto w-72 object-contain xl:w-80"} />
    </Link>
  );
}
