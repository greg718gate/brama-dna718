import { Link } from "react-router-dom";

export default function ZetaFooter({ lang = "pl" as "pl" | "en" }) {
  const t = lang === "pl"
    ? { rights: "Wszelkie prawa zastrzeżone", legal: "Informacje prawne", faq: "FAQ i testy", integration: "Integracja", contact: "Kontakt" }
    : { rights: "All rights reserved", legal: "Legal", faq: "FAQ & Tests", integration: "Integration", contact: "Contact" };
  return (
    <footer className="mt-12 border-t border-border/40 pt-6 pb-4 text-xs text-muted-foreground">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="font-semibold text-foreground">Zeta Core Ltd</div>
          <div>London, United Kingdom · <a href="mailto:contact@zeta-core-dns.com" className="underline hover:text-foreground">contact@zeta-core-dns.com</a></div>
          <div>© {new Date().getFullYear()} Zeta Core Ltd. {t.rights}.</div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/zeta/legal" className="hover:text-foreground underline">{t.legal}</Link>
          <Link to="/zeta/integration" className="hover:text-foreground underline">{t.integration}</Link>
          <Link to="/zeta/faq" className="hover:text-foreground underline">{t.faq}</Link>
          <a href="mailto:contact@zeta-core-dns.com" className="hover:text-foreground underline">{t.contact}</a>
        </div>
      </div>
    </footer>
  );
}
