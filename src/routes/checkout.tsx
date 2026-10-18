import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { seo } from "@/config/store";
import { useShop } from "@/lib/shop-state";
import { validateOrder } from "@/lib/orders.functions";
import { formatBRL, formatCep, onlyDigits } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/store/Footer";
import { CartLines } from "@/components/store/CartDrawer";

export const Route = createFileRoute("/checkout")({
  head: () => ({ ...seo({ title: "Finalizar compra", description: "Identificação, entrega e pagamento." }), meta: [{ title: "Finalizar compra" }, { name: "description", content: "Identificação, entrega e pagamento." }, { name: "robots", content: "noindex" }] }),
  component: Checkout,
});

const steps = ["Identificação", "Entrega", "Pagamento", "Revisão"];

function Field({ label, name, ...rest }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input name={name} required className="mt-1 h-11 w-full rounded-md border bg-background px-3" {...rest} />
    </label>
  );
}

function Checkout() {
  const { lines, subtotal, count, clear, cep } = useShop();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({ cep: cep ? formatCep(cep) : "", payment: "pix" });
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  if (!count) return (
    <div className="mx-auto max-w-xl px-3 py-16 text-center">
      <h1 className="text-2xl font-extrabold">Seu carrinho está vazio</h1>
      <Button asChild className="mt-4"><Link to="/">Ver produtos</Link></Button>
    </div>
  );

  const onStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setData((d) => ({ ...d, ...f }));
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setBusy(true); setErrors([]);
    try {
      const res = await validateOrder({ data: {
        lines,
        customer: { name: data.name, email: data.email, cpf: onlyDigits(data.cpf ?? ""), phone: onlyDigits(data.phone ?? "") },
        address: { cep: onlyDigits(data.cep ?? ""), street: data.street, number: data.number, complement: data.complement || undefined, district: data.district, city: data.city, state: (data.state ?? "").toUpperCase() },
        payment: data.payment as "pix" | "cartao",
      } });
      if (!res.ok) { setErrors(res.errors); return; }
      const orders = JSON.parse(localStorage.getItem("mlp:orders") ?? "[]");
      orders.unshift({ ...res, createdAt: new Date().toISOString(), payment: data.payment, customer: data.name });
      localStorage.setItem("mlp:orders", JSON.stringify(orders.slice(0, 20)));
      clear();
      navigate({ to: "/pedido/$id", params: { id: res.id } });
    } catch {
      setErrors(["Verifique os dados informados: há campos inválidos (CPF com 11 dígitos, telefone com DDD, CEP e UF)."]);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-3 py-6">
      <h1 className="text-2xl font-extrabold">Finalizar compra</h1>
      <div className="mt-3"><DemoNotice>pagamento e frete ainda não estão integrados. Nenhuma cobrança será realizada e o pedido não será enviado.</DemoNotice></div>
      <ol className="mt-4 flex gap-2 text-xs sm:text-sm">
        {steps.map((s, i) => (
          <li key={s} className={`flex-1 rounded-md border-b-4 pb-1 text-center ${i <= step ? "border-primary font-semibold text-primary" : "border-border text-muted-foreground"}`} aria-current={i === step ? "step" : undefined}>{s}</li>
        ))}
      </ol>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border p-4">
          {step === 0 && (
            <form onSubmit={onStep} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Nome completo" name="name" defaultValue={data.name} autoComplete="name" minLength={3} /></div>
              <Field label="E-mail" name="email" type="email" defaultValue={data.email} autoComplete="email" />
              <Field label="Celular com DDD" name="phone" inputMode="tel" defaultValue={data.phone} autoComplete="tel" />
              <Field label="CPF" name="cpf" inputMode="numeric" defaultValue={data.cpf} pattern="\D*(\d\D*){11}" title="11 dígitos" />
              <div className="sm:col-span-2"><Button type="submit">Continuar</Button></div>
            </form>
          )}
          {step === 1 && (
            <form onSubmit={onStep} className="grid gap-3 sm:grid-cols-2">
              <Field label="CEP" name="cep" inputMode="numeric" defaultValue={data.cep} autoComplete="postal-code" />
              <Field label="UF" name="state" maxLength={2} defaultValue={data.state} autoComplete="address-level1" />
              <div className="sm:col-span-2"><Field label="Endereço" name="street" defaultValue={data.street} autoComplete="address-line1" /></div>
              <Field label="Número" name="number" defaultValue={data.number} />
              <label className="block text-sm"><span className="font-medium">Complemento (opcional)</span><input name="complement" defaultValue={data.complement} className="mt-1 h-11 w-full rounded-md border bg-background px-3" /></label>
              <Field label="Bairro" name="district" defaultValue={data.district} />
              <Field label="Cidade" name="city" defaultValue={data.city} autoComplete="address-level2" />
              <fieldset className="sm:col-span-2 rounded-md border p-3 text-sm">
                <legend className="px-1 font-medium">Modalidade de entrega</legend>
                <p className="text-muted-foreground">Nenhuma modalidade disponível: o provedor de frete ainda não foi configurado.</p>
              </fieldset>
              <div className="flex gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={() => setStep(0)}>Voltar</Button><Button type="submit">Continuar</Button></div>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={onStep} className="space-y-3">
              {[{ v: "pix", l: "PIX" }, { v: "cartao", l: "Cartão de crédito" }].map((o) => (
                <label key={o.v} className="flex min-h-12 items-center gap-3 rounded-md border p-3">
                  <input type="radio" name="payment" value={o.v} defaultChecked={data.payment === o.v} className="h-4 w-4 accent-primary" /> {o.l}
                </label>
              ))}
              <p className="text-sm text-muted-foreground">O provedor de pagamento não está configurado. Não será gerado QR Code PIX nem solicitado número de cartão.</p>
              <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setStep(1)}>Voltar</Button><Button type="submit">Revisar pedido</Button></div>
            </form>
          )}
          {step === 3 && (
            <div className="space-y-4 text-sm">
              <div><h2 className="font-bold">Comprador</h2><p>{data.name} · {data.email}</p></div>
              <div><h2 className="font-bold">Entrega</h2><p>{data.street}, {data.number} {data.complement} — {data.district}, {data.city}/{data.state?.toUpperCase()} · CEP {data.cep}</p></div>
              <div><h2 className="font-bold">Pagamento</h2><p>{data.payment === "pix" ? "PIX" : "Cartão de crédito"} (não integrado)</p></div>
              <CartLines compact />
              {errors.length > 0 && <ul role="alert" className="rounded-md border border-destructive p-3 text-destructive">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
              <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(2)}>Voltar</Button><Button onClick={submit} disabled={busy}>{busy ? "Validando…" : "Registrar pedido de demonstração"}</Button></div>
            </div>
          )}
        </div>
        <aside className="h-fit rounded-lg border p-4 text-sm">
          <h2 className="font-bold">Resumo</h2>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between"><dt>Produtos ({count})</dt><dd>{formatBRL(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Frete</dt><dd className="text-muted-foreground">Não configurado</dd></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total</dt><dd>{formatBRL(subtotal)}</dd></div>
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">Valores e estoque são revalidados no servidor ao registrar o pedido.</p>
        </aside>
      </div>
    </div>
  );
}
