import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Package, Users, MousePointerClick, QrCode, Megaphone, Zap, Smartphone, TriangleAlert, RefreshCw, LogOut, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seo } from "@/config/store";
import { adminSession, unlockAdmin, lockAdmin, getAdminData, saveAdminSetting, updateOrderStatus } from "@/lib/admin.functions";
import { DEFAULT_MINIMUM_ORDER, orderStatuses } from "@/lib/admin-rules";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ head: () => seo({ title: "Administração", description: "Painel privado da Petz Store." }), component: Admin });
const tabs = [
  { key: "orders", label: "Pedidos", Icon: Package }, { key: "visitors", label: "Visitantes", Icon: Users },
  { key: "clicks", label: "Mais clicados", Icon: MousePointerClick }, { key: "pix", label: "Ajustes PIX", Icon: QrCode },
  { key: "pixels", label: "Pixels de Anúncio", Icon: Megaphone }, { key: "speedmax", label: "SpeedMax", Icon: Zap },
  { key: "pushcut", label: "Pushcut", Icon: Smartphone }, { key: "errors", label: "Erros PIX", Icon: TriangleAlert },
];
const settingFields: Record<string, { key: string; label: string }[]> = {
  pix: [{ key: "key", label: "Chave PIX" }, { key: "name", label: "Nome do recebedor" }, { key: "city", label: "Cidade" }],
  pixels: [{ key: "meta", label: "ID do pixel Meta" }, { key: "google", label: "ID do Google Ads" }, { key: "tiktok", label: "ID do TikTok" }],
  speedmax: [{ key: "account", label: "Identificação da conta" }], pushcut: [{ key: "notification", label: "Nome da notificação" }],
};
const inputClass = "h-10 w-full rounded-md border bg-background px-3 text-sm";

function Admin() {
  const check = useServerFn(adminSession);
  const unlock = useServerFn(unlockAdmin);
  const lock = useServerFn(lockAdmin);
  const session = useQuery({ queryKey: ["admin-session"], queryFn: () => check(), retry: false });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!session.data?.unlocked) return <div className="mx-auto max-w-sm px-4 py-16">
    <LockKeyhole className="mb-4 h-8 w-8 text-primary" /><h1 className="text-2xl font-bold">Administração</h1>
    <form className="mt-6 space-y-4" onSubmit={async (event) => {
      event.preventDefault(); setBusy(true); setError("");
      const password = String(new FormData(event.currentTarget).get("password") || "");
      try { const result = await unlock({ data: { password } }); if (result.ok) await session.refetch(); else setError(result.error); }
      catch { setError("Não foi possível abrir o painel. Tente novamente."); } finally { setBusy(false); }
    }}>
      <label className="block text-sm font-medium">Senha<input name="password" type="password" autoComplete="current-password" required className={`${inputClass} mt-2`} /></label>
      {(error || session.isError) && <p role="alert" className="text-sm text-destructive">{error || "Acesso indisponível. Tente novamente."}</p>}
      <Button disabled={busy || session.isPending} type="submit" className="w-full">{busy ? "Verificando…" : "Entrar"}</Button>
    </form>
  </div>;
  return <Panel onLock={async () => { await lock(); await session.refetch(); }} />;
}

function Panel({ onLock }: { onLock: () => Promise<void> }) {
  const fetchData = useServerFn(getAdminData);
  const saveSetting = useServerFn(saveAdminSetting);
  const changeStatus = useServerFn(updateOrderStatus);
  const query = useQuery({ queryKey: ["admin-data"], queryFn: () => fetchData(), retry: false });
  const [tab, setTab] = useState("orders");
  const [status, setStatus] = useState("todos");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("todos");
  const [payment, setPayment] = useState("todos");
  const [min, setMin] = useState(""); const [max, setMax] = useState("");
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const settings = Object.fromEntries((query.data?.settings || []).map(row => [row.key, row.value]));
  const orders = query.data?.orders || [];
  const filtered = orders.filter(order => {
    const days = (Date.now() - new Date(order.created_at).getTime()) / 86400000;
    const matchesPeriod = period === "todos" || (period === "hoje" ? new Date(order.created_at).toLocaleDateString("pt-BR") === new Date().toLocaleDateString("pt-BR") : days <= Number(period));
    return (status === "todos" || order.status === status) && matchesPeriod && (payment === "todos" || order.payment === payment) && (!min || order.total >= Number(min)) && (!max || order.total <= Number(max)) && JSON.stringify([order.id, order.customer]).toLowerCase().includes(search.toLowerCase());
  });
  const today = orders.filter(order => new Date(order.created_at).toLocaleDateString("pt-BR") === new Date().toLocaleDateString("pt-BR"));
  async function save(key: "minimum_order" | "pix" | "pixels" | "speedmax" | "pushcut", value: number | Record<string, string>) {
    setSaving(true);
    try { await saveSetting({ data: { key, value } }); await query.refetch(); toast.success("Configuração salva."); } catch { toast.error("Não foi possível salvar."); } finally { setSaving(false); }
  }
  return <div className="bg-muted py-6"><div className="mx-auto max-w-7xl px-4">
    <div className="mb-5 flex items-center justify-between"><h1 className="text-xl font-bold">Administração · Petz Store</h1><Button variant="outline" onClick={() => void onLock()}><LogOut className="h-4 w-4" />Sair</Button></div>
    <nav aria-label="Administração" className="flex gap-1 overflow-x-auto border-b bg-background p-2">{tabs.map(({ key, label, Icon }) => <Button key={key} variant={tab === key ? "default" : "ghost"} className="shrink-0" onClick={() => setTab(key)}><Icon className="h-4 w-4" />{label}</Button>)}</nav>
    {query.isPending && <p className="py-12">Carregando painel…</p>}
    {query.isError && <div role="alert" className="py-8"><p>Não foi possível carregar os dados.</p><Button className="mt-3" onClick={() => void query.refetch()}>Tentar novamente</Button></div>}
    {query.data && tab === "orders" && <>
      <section className="mt-6 border-y bg-background p-5"><h2 className="flex items-center gap-2 text-lg font-bold"><Package className="h-5 w-5" />Pedido mínimo do site</h2>
        <form key={String(settings.minimum_order)} className="mt-4 flex flex-wrap items-center gap-3" onSubmit={event => { event.preventDefault(); void save("minimum_order", Number(new FormData(event.currentTarget).get("minimum"))); }}>
          <label className="flex items-center gap-2 text-sm">R$<input name="minimum" type="number" min="0" max="100000" step="0.01" defaultValue={Number(settings.minimum_order ?? DEFAULT_MINIMUM_ORDER)} aria-label="Pedido mínimo" className={`${inputClass} max-w-32`} /></label>
          <Button disabled={saving} type="submit">Salvar</Button><Button disabled={saving} variant="outline" type="button" onClick={() => void save("minimum_order", DEFAULT_MINIMUM_ORDER)}>Restaurar padrão</Button>
        </form>
      </section>
      <section className="mt-6 bg-background p-5"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><Package className="h-5 w-5" />Pedidos ({orders.length})</h2><Button variant="outline" onClick={() => void query.refetch()}><RefreshCw className="h-4 w-4" />Atualizar</Button></div>
        <div className="mt-4 flex flex-wrap justify-between gap-4 border-y border-primary bg-secondary p-4"><div className="text-sm"><b>HOJE</b><p>{today.length} pedidos · {today.filter(order => order.status === "pago").length} pagos</p></div><div className="text-right text-sm"><b>RECEITA DO DIA</b><p className="font-bold">{formatBRL(today.filter(order => order.status === "pago").reduce((sum, order) => sum + order.total, 0))}</p></div></div>
        <div className="mt-4 flex flex-wrap gap-2">{["todos", ...orderStatuses].map(value => <Button size="sm" key={value} variant={status === value ? "default" : "outline"} onClick={() => setStatus(value)}>{value.toUpperCase()} {value === "todos" ? orders.length : orders.filter(order => order.status === value).length}</Button>)}<input value={search} onChange={event => setSearch(event.target.value)} aria-label="Buscar pedidos" placeholder="Nome, CPF, e-mail, telefone ou ID" className={`${inputClass} md:ml-auto md:max-w-xs`} /></div>
        <div className="mt-4 grid gap-3 border-y py-4 sm:grid-cols-5"><label className="text-xs">PERÍODO<select value={period} onChange={event => setPeriod(event.target.value)} className={`${inputClass} mt-1`}><option value="todos">Todos</option><option value="hoje">Hoje</option><option value="7">7 dias</option><option value="30">30 dias</option></select></label><label className="text-xs">PAGAMENTO<select className={`${inputClass} mt-1`} value={payment} onChange={event => setPayment(event.target.value)}><option value="todos">Todos</option><option value="pix">PIX</option><option value="cartao">Cartão</option></select></label><label className="text-xs">VALOR MÍN.<input type="number" min="0" className={`${inputClass} mt-1`} value={min} onChange={event => setMin(event.target.value)} /></label><label className="text-xs">VALOR MÁX.<input type="number" min="0" className={`${inputClass} mt-1`} value={max} onChange={event => setMax(event.target.value)} /></label><Button className="self-end" variant="outline" onClick={() => { setStatus("todos"); setSearch(""); setPeriod("todos"); setPayment("todos"); setMin(""); setMax(""); }}>Limpar filtros</Button></div>
        <p className="mt-3 text-right text-sm font-semibold">{filtered.length} pedidos · {formatBRL(filtered.reduce((sum, order) => sum + order.total, 0))}</p>
        {filtered.length === 0 ? <div className="py-16 text-center text-muted-foreground"><Package className="mx-auto mb-3 h-10 w-10" /><p>Nenhum pedido encontrado.</p></div> : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Pedido</th><th>Cliente</th><th>Total</th><th>Status</th><th /></tr></thead><tbody>{filtered.map(order => <tr key={order.id} className="border-b"><td className="p-3">{order.id}<p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("pt-BR")}</p></td><td>{(order.customer as { name?: string }).name}</td><td>{formatBRL(order.total)}</td><td><select aria-label={`Status ${order.id}`} className={inputClass} value={order.status} onChange={async event => { try { await changeStatus({ data: { id: order.id, status: event.target.value as typeof orderStatuses[number] } }); await query.refetch(); } catch { toast.error("Não foi possível atualizar."); } }}>{orderStatuses.map(value => <option key={value}>{value}</option>)}</select></td><td><Button variant="ghost" onClick={() => setSelected(selected === order.id ? "" : order.id)}>Detalhes</Button></td></tr>)}</tbody></table></div>}
        {selected && <div className="mt-4 border-t py-4"><h3 className="font-bold">{selected}</h3><pre className="mt-2 whitespace-pre-wrap break-words text-xs">{JSON.stringify(orders.find(order => order.id === selected), null, 2)}</pre></div>}
      </section>
    </>}
    {query.data && (tab === "visitors" || tab === "clicks") && <section className="mt-6 bg-background p-5"><h2 className="text-lg font-bold">{tab === "visitors" ? "Visitas por página" : "Visualizações de produtos"}</h2>{(() => { const counts: Record<string, number> = {}; query.data.events.filter(event => tab === "visitors" || event.kind === "produto").forEach(event => { counts[event.path] = (counts[event.path] || 0) + 1; }); return Object.keys(counts).length ? Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([path, count]) => <div key={path} className="flex justify-between border-b py-3 text-sm"><span>{path}</span><b>{count}</b></div>) : <p className="py-12 text-center text-muted-foreground">Nenhum registro ainda.</p>; })()}</section>}
    {query.data && settingFields[tab] && <section className="mt-6 bg-background p-5"><h2 className="text-lg font-bold">{tabs.find(item => item.key === tab)?.label}</h2><form key={tab} className="mt-5 max-w-xl space-y-4" onSubmit={event => { event.preventDefault(); void save(tab as "pix" | "pixels" | "speedmax" | "pushcut", Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>); }}>{settingFields[tab].map(field => <label key={field.key} className="block text-sm font-medium">{field.label}<input name={field.key} maxLength={300} defaultValue={String((settings[tab] as Record<string, string> | undefined)?.[field.key] || "")} className={`${inputClass} mt-1`} /></label>)}<p className="text-sm text-warning-foreground">{tab === "pix" ? "Pagamentos e confirmação automática ainda não estão conectados." : "Integração ainda não conectada. Salvar estes dados não ativa o serviço."}</p><Button type="submit" disabled={saving}>Salvar</Button></form></section>}
    {query.data && tab === "errors" && <section className="mt-6 bg-background p-5"><h2 className="text-lg font-bold">Erros PIX</h2><p className="py-12 text-center text-muted-foreground">Nenhum registro disponível. O provedor de pagamento não está conectado.</p></section>}
  </div></div>;
}