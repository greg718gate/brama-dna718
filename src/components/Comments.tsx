import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";

const commentSchema = z.object({
  user_name: z.string().trim().min(1, "Imię jest wymagane").max(100),
  user_email: z.string().trim().email("Nieprawidłowy email").max(255),
  comment_text: z.string().trim().min(1, "Komentarz jest wymagany").max(1000),
});

export const Comments = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments"],
    queryFn: async () => {
      // Użyj widoku comments_public zamiast tabeli comments
      // Widok automatycznie ukrywa emaile
      const { data, error } = await supabase
        .from("comments_public")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (newComment: { user_name: string; user_email: string; comment_text: string }) => {
      const validated = commentSchema.parse(newComment);
      
      // Sprawdź czy użytkownik jest zalogowany (opcjonalne)
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("comments").insert([{
        user_name: validated.user_name,
        user_email: validated.user_email,
        comment_text: validated.comment_text,
        user_id: user?.id || null, // user_id jest opcjonalne
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      setName("");
      setEmail("");
      setComment("");
      toast({
        title: t("comments.success"),
        description: t("comments.successMessage"),
      });
    },
    onError: (error) => {
      toast({
        title: t("comments.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      user_name: name,
      user_email: email,
      comment_text: comment,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("comments.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder={t("comments.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
            <Input
              type="email"
              placeholder={t("comments.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
            <Textarea
              placeholder={t("comments.commentPlaceholder")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              maxLength={1000}
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("comments.sending") : t("comments.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{t("comments.allComments")}</h3>
        {isLoading ? (
          <p>{t("comments.loading")}</p>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold">{comment.user_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-muted-foreground">{comment.comment_text}</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">{t("comments.noComments")}</p>
        )}
      </div>
    </div>
  );
};
