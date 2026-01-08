import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-xl border border-border bg-card p-6 text-center space-y-4">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-muted-foreground">Nie znaleziono strony: {location.pathname}</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={() => navigate("/")}>Wróć na start</Button>
          <Button variant="secondary" onClick={() => navigate("/vault")}>
            Przejdź do Skarbca
          </Button>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
