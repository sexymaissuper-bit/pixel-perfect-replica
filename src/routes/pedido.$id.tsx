import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatBRL } from "@/lib/format";
import { DemoNotice } from "@/components/store/Footer";
import { Button } from "@/components/ui/button";
import { seo } from "@/config/store";

type Order = { id: string; items: { variantId: string; name: string; variant: string; qty: number; total: number }[]; subtotal: number; total: number; createdAt: string; payment: string };

export const Route = createFileRoute("/pedido/$id")({
  head: () => seo({ title: "Detalhes do pedido", description: "Status e itens do seu pedido na Petz Store.", private: true }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  useEffect(() => {
    const all: Order[] = JSON.parse(localStorage.getItem("mlp:orders") ?? "[]");
    setOrder(all.find((o) => o.id === id) ?? null);
  }, [id]);
  if (order === undefined) return <p className="p-10 text-center text-muted-foreground">Carregando…</p>;
  if (!order) return <div className="p-10 text-center"><p className="font-semibold">Pedido não encontrado neste navegador.</p><Button asChild className="mt-4"><Link to="/">Voltar</Link></Button></div>;
  return (
    <div className="mx-auto max-w-2xl px-3 py-6">
      <h1 className="text-2xl font-extrabold">Pedido {order.id}</h1>
      <div className="mt-3"><DemoNotice>o pagamento online está em configuração. Nenhuma cobrança foi realizada até o momento.</DemoNotice></div>
      <p className="mt-4 text-sm"><b>Status:</b> Aguardando pagamento</p>
      <p className="text-sm"><b>Forma escolhida:</b> {order.payment === "pix" ? "PIX" : "Cartão de crédito"}</p>
      <ul className="mt-4 divide-y rounded-lg border">
        {order.items.map((i) => <li key={i.variantId} className="flex justify-between p-3 text-sm"><span>{i.qty}× {i.name} — {i.variant}</span><span>{formatBRL(i.total)}</span></li>)}
      </ul>
      <p className="mt-3 text-right font-bold">Total: {formatBRL(order.total)}</p>
    </div>
  );
}
