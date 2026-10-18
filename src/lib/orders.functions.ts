/**
 * Validação de pedido no SERVIDOR: recalcula preços e estoque a partir do catálogo,
 * ignorando quaisquer valores enviados pelo navegador. Não processa pagamento.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getVariant, effectivePrice } from "./catalog";

const input = z.object({
  lines: z.array(z.object({ variantId: z.string().max(64), qty: z.number().int().min(1).max(99) })).min(1).max(100),
  customer: z.object({
    name: z.string().trim().min(3).max(120),
    email: z.string().trim().email().max(200),
    cpf: z.string().regex(/^\d{11}$/),
    phone: z.string().regex(/^\d{10,11}$/),
  }),
  address: z.object({
    cep: z.string().regex(/^\d{8}$/),
    street: z.string().trim().min(2).max(200),
    number: z.string().trim().min(1).max(20),
    complement: z.string().max(100).optional(),
    district: z.string().trim().min(2).max(100),
    city: z.string().trim().min(2).max(100),
    state: z.string().regex(/^[A-Z]{2}$/),
  }),
  payment: z.enum(["pix", "cartao"]),
});

export const validateOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const errors: string[] = [];
    const items = data.lines.map((l) => {
      const found = getVariant(l.variantId);
      if (!found) {
        errors.push(`Item indisponível: ${l.variantId}`);
        return null;
      }
      if (found.variant.stock < l.qty) errors.push(`Estoque insuficiente: ${found.product.name} (${found.variant.label})`);
      const unit = effectivePrice(found.variant);
      return { variantId: l.variantId, name: found.product.name, variant: found.variant.label, qty: l.qty, unit, total: unit * l.qty };
    }).filter((x): x is NonNullable<typeof x> => !!x);
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    return {
      ok: errors.length === 0,
      errors,
      items,
      subtotal,
      shipping: null as number | null, // sem provedor de frete configurado
      total: subtotal,
      id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
      status: "aguardando_pagamento_demo" as const,
      paymentConfigured: false,
    };
  });
