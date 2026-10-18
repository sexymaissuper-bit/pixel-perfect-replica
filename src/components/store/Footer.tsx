import { Link } from "@tanstack/react-router";
import { storeConfig } from "@/config/store";
import { institutionalPages } from "@/data/institutional";
import { departments } from "@/data/departments";
import { ContactLinks } from "./ContactLinks";

export function Footer() {
  const { contact, company } = storeConfig;
  return (
    <footer className="mt-12 border-t bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h2 className="font-bold">Departamentos</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {departments.map((d) => (
              <li key={d.slug}><Link to="/departamento/$slug" params={{ slug: d.slug }} className="hover:underline">{d.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold">Institucional</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {institutionalPages.map((p) => (
              <li key={p.slug}><Link to="/institucional/$slug" params={{ slug: p.slug }} className="hover:underline">{p.title}</Link></li>
            ))}
          </ul>
        </div>
        <div className="text-sm">
          <h2 className="font-bold">Atendimento</h2>
          <ul className="mt-3 space-y-2">
            <ContactLinks />
            {contact.hours && <li>{contact.hours}</li>}
            {!contact.email && !contact.phone && <li className="text-muted-foreground">Canais de atendimento serão informados em breve.</li>}
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {storeConfig.name} · {company.legalName}</p>
        <p>CNPJ {company.cnpj} · IE {company.stateRegistration}</p>
        <p>{company.address}</p>
      </div>
    </footer>
  );
}

export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div role="note" className="rounded-lg border border-accent bg-warning-bg p-3 text-sm text-warning-foreground">
      <strong>Aviso: </strong>{children}
    </div>
  );
}
