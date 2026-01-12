import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface DonationButtonProps {
  variant?: "compact" | "full";
}

export const DonationButton = ({ variant = "compact" }: DonationButtonProps) => {
  const { language } = useLanguage();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

  const handleStripeDonation = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      toast.error(tr("Minimalna kwota to £1", "Minimum amount is £1"));
      return;
    }
    if (numAmount > 1000) {
      toast.error(tr("Maksymalna kwota to £1000", "Maximum amount is £1000"));
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-donation", {
        body: { amount: numAmount },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      console.error("Donation error:", error);
      toast.error(tr("Błąd płatności. Spróbuj PayPal.", "Payment error. Try PayPal."));
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            max="1000"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={tr("Kwota (£)", "Amount (£)")}
            className="w-24 text-center border-primary/30"
          />
          <Button
            onClick={handleStripeDonation}
            disabled={isLoading}
            variant="outline"
            className="gap-2 border-primary/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            {tr("Karta", "Card")}
          </Button>
        </div>
        
        {/* PayPal fallback */}
        <form
          action="https://www.paypal.com/cgi-bin/webscr"
          method="post"
          target="_blank"
        >
          <input type="hidden" name="cmd" value="_donations" />
          <input type="hidden" name="business" value="brama718@proton.me" />
          <input type="hidden" name="currency_code" value="GBP" />
          <input type="hidden" name="amount" value={amount || "1"} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Heart className="w-3 h-3" />
            {tr("lub PayPal", "or PayPal")}
          </Button>
        </form>
      </div>
    );
  }

  // Full variant for GATCAZeta page
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <Input
          type="number"
          min="1"
          max="1000"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={tr("Wpisz kwotę (np. 1)", "Enter amount (e.g. 1)")}
          className="w-32 px-4 py-2 text-center border-primary/30 bg-background/50"
        />
        <Button
          onClick={handleStripeDonation}
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <CreditCard className="w-4 h-4 mr-2" />
          )}
          {tr("WYŚLIJ (Karta)", "SEND (Card)")}
        </Button>
      </div>

      {/* PayPal alternative */}
      <form
        action="https://www.paypal.com/cgi-bin/webscr"
        method="post"
        target="_blank"
        className="flex items-center gap-2"
      >
        <input type="hidden" name="cmd" value="_donations" />
        <input type="hidden" name="business" value="brama718@proton.me" />
        <input type="hidden" name="currency_code" value="GBP" />
        <input type="hidden" name="amount" value={amount || "1"} />
        <Button
          type="submit"
          variant="outline"
          className="gap-2 border-primary/30"
        >
          <Heart className="w-4 h-4" />
          {tr("lub PayPal", "or PayPal")}
        </Button>
      </form>

      <small className="text-xs text-muted-foreground">
        {tr("Stripe lub PayPal – bezpieczne, bez konta", "Stripe or PayPal — secure, no account needed")}
      </small>
    </div>
  );
};
