import { storeConfig } from "@/config/store";

export function ContactLinks() {
  const { email, phone } = storeConfig.contact;
  return (
    <>
      {email && (
        <li>
          <a href={`mailto:${email}`} className="break-all hover:underline">
            {email}
          </a>
        </li>
      )}
      {phone && (
        <li>
          <a href={`tel:+55${phone.replace(/\D/g, "")}`} className="hover:underline">
            {phone}
          </a>
        </li>
      )}
    </>
  );
}
