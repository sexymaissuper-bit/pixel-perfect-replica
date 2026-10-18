import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { seo } from "@/config/store";
import { DemoNotice } from "@/components/store/Footer";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/conta")({
  head: () => seo({ title: "Minha conta", description: "Cadastro, login, endereços e pedidos." }),
  component: Account,
});

function Account() {
  const [orders, setOrders] = useState<{ id: string; total: number; createdAt: string }[]>([]);
  useEffect(() => setOrders(JSON.parse(localStorage.getItem("mlp:orders") ?? "[]")), []);
  return (
    <div className="mx-auto max-w-3xl px-3 py-6">
      <h1 className="text-2xl font-extrabold">Minha conta</h1>
      <div className="mt-3"><DemoNotice>cadastro, login e recuperação de senha ainda não estão conectados a um sistema de autenticação. Nenhuma senha é aceita ou armazenada.</DemoNotice></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {["Cadastro e login", "Perfil", "Endereços", "Recuperação de senha"].map((t) => (
          <div key={t} className="rounded-lg border p-4"><h2 className="font-bold">{t}</h2><p className="mt-1 text-sm text-muted-foreground">Disponível após configurar a autenticação.</p></div>
        ))}
      </div>
      <h2 className="mt-8 text-lg font-bold">Pedidos de demonstração neste navegador</h2>
      {orders.length ? (
        <ul className="mt-2 divide-y rounded-lg border">
          {orders.map((o) => <li key={o.id}><Link to="/pedido/$id" params={{ id: o.id }} className="flex justify-between p-3 text-sm hover:bg-muted"><span>{o.id} · {new Date(o.createdAt).toLocaleDateString("pt-BR")}</span><span>{formatBRL(o.total)}</span></Link></li>)}
        </ul>
      ) : <p className="mt-2 text-sm text-muted-foreground">Nenhum pedido.</p>}
      <p className="mt-6 text-sm"><Link to="/favoritos" className="font-semibold text-primary hover:underline">Ver favoritos</Link></p>
    </div>
  );
}
