import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Imię jest wymagane").max(100),
  email: z.string().trim().email("Nieprawidłowy email").max(255),
  message: z.string().trim().min(1, "Wiadomość jest wymagana").max(1000),
});

export const ContactForm = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = contactSchema.parse({ name, email, message });

      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: validated,
      });

      if (error) throw error;

      toast({
        title: t("contact.success"),
        description: t("contact.successMessage"),
      });

      setName("");
      setEmail("");
      setMessage("");
    } catch (error: any) {
      toast({
        title: t("contact.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("contact.title")}</CardTitle>
        <CardDescription>{t("contact.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder={t("contact.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
          />
          <Input
            type="email"
            placeholder={t("contact.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
          />
          <Textarea
            placeholder={t("contact.messagePlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            maxLength={1000}
            className="min-h-[150px]"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("contact.sending") : t("contact.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
