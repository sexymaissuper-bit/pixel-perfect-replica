import { createServerFn } from "@tanstack/react-start";
import { useSession, getRequestIP } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { DEFAULT_MINIMUM_ORDER, orderStatuses } from "./admin-rules";

function sessionConfig() {
  const password = process.env['ADMIN_SESSION_SECRET'];
  if (!password) throw new Error("Acesso administrativo não configurado.");
  return { password, name: "store-admin", maxAge: 60 * 60 * 8, cookie: { httpOnly: true, secure: process.env['NODE_ENV'] === 'production', sameSite: "lax" as const, path: "/" } };
}
async function requireAdmin() {
  const session = await useSession<{ unlocked?: boolean }>(sessionConfig());
  if (!session.data.unlocked) throw new Error("Acesso não autorizado.");
}

export const adminSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<{ unlocked?: boolean }>(sessionConfig());
  return { unlocked: session.data.unlocked === true };
});
export const unlockAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string().max(200) }).parse(data))
  .handler(async ({ data }) => {
    const expected = process.env['ADMIN_PASSWORD'];
    if (!expected) throw new Error("Acesso administrativo não configurado.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = getRequestIP({ xForwardedFor: true }) || "unknown";
    const key = createHash("sha256").update(ip).digest("hex");
    const { data: attempt, error } = await supabaseAdmin.from("admin_login_attempts").select("attempts,window_start").eq("key", key).maybeSingle();
    if (error) throw new Error("Não foi possível verificar o acesso.");
    const recent = attempt && Date.now() - new Date(attempt.window_start).getTime() < 15 * 60 * 1000;
    if (recent && attempt.attempts >= 5) return { ok: false, error: "Muitas tentativas. Aguarde 15 minutos." };
    const { error: writeError } = await supabaseAdmin.from("admin_login_attempts").upsert({ key, attempts: recent ? attempt.attempts + 1 : 1, window_start: recent ? attempt.window_start : new Date().toISOString() });
    if (writeError) throw new Error("Não foi possível verificar o acesso.");
    const a = createHash("sha256").update(data.password).digest();
    const b = createHash("sha256").update(expected).digest();
    if (!timingSafeEqual(a, b)) return { ok: false, error: "Senha incorreta." };
    const session = await useSession<{ unlocked?: boolean }>(sessionConfig());
    await session.update({ unlocked: true });
    await supabaseAdmin.from("admin_login_attempts").delete().eq("key", key);
    return { ok: true, error: "" };
  });
export const lockAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession(sessionConfig());
  await session.clear();
  return { ok: true };
});
export const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [settings, orders, events] = await Promise.all([
    supabaseAdmin.from("admin_settings").select("key,value"),
    supabaseAdmin.from("store_orders").select("*").order("created_at", { ascending: false }).limit(1000),
    supabaseAdmin.from("store_events").select("kind,path,created_at").order("created_at", { ascending: false }).limit(1000),
  ]);
  if (settings.error || orders.error || events.error) throw new Error("Não foi possível carregar o painel.");
  return { settings: settings.data || [], orders: orders.data || [], events: events.data || [] };
});
export const saveAdminSetting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ key: z.enum(["minimum_order", "pix", "pixels", "speedmax", "pushcut"]), value: z.union([z.number().min(0).max(100000), z.record(z.string().max(300))]) }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    if (data.key === "minimum_order" && typeof data.value !== "number") throw new Error("Valor inválido.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("admin_settings").upsert(data);
    if (error) throw new Error("Não foi possível salvar.");
    return { ok: true };
  });
export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().max(100), status: z.enum(orderStatuses) }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("store_orders").update({ status: data.status }).eq("id", data.id).select("id").single();
    if (error || !row) throw new Error("Não foi possível atualizar o pedido.");
    return { ok: true };
  });
export const getMinimumOrder = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("admin_settings").select("value").eq("key", "minimum_order").maybeSingle();
  if (error) throw new Error("Não foi possível consultar o pedido mínimo.");
  return typeof data?.value === "number" ? data.value : DEFAULT_MINIMUM_ORDER;
});
export const recordStoreVisit = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ path: z.string().regex(/^\/[a-zA-Z0-9/_\-.]*$/).max(200) }).parse(data))
  .handler(async ({ data }) => {
    if (data.path.startsWith("/admin")) return { ok: true };
    const session = await useSession<{ paths?: string[] }>({ ...sessionConfig(), name: "store-visit", maxAge: 60 * 60 });
    const paths = session.data.paths || [];
    if (paths.includes(data.path) || paths.length >= 30) return { ok: true };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("store_events").insert({ kind: data.path.startsWith("/produto/") ? "produto" : "visita", path: data.path });
    if (!error) await session.update({ paths: [...paths, data.path] });
    return { ok: !error };
  });