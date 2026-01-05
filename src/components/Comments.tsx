import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";
import { User } from "@supabase/supabase-js";

const commentSchema = z.object({
  user_name: z.string().trim().min(1, "Imię jest wymagane").max(100),
  comment_text: z.string().trim().min(1, "Komentarz jest wymagany").max(1000),
});

interface Comment {
  id: string;
  user_name: string;
  comment_text: string;
  created_at: string;
  user_id: string;
}

export const Comments = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [user, setUser] = useState<User | null>(null);

  // Sprawdź stan logowania
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Pobierz komentarze - teraz bezpośrednio z tabeli comments (publiczny SELECT)
  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, user_name, comment_text, created_at")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Comment[];
    },
  });

  // Dodaj komentarz - wymaga zalogowania
  const mutation = useMutation({
    mutationFn: async (newComment: { user_name: string; comment_text: string }) => {
      if (!user) {
        throw new Error("Musisz być zalogowany, aby dodać komentarz");
      }
      
      const validated = commentSchema.parse(newComment);
      
      const { error } = await supabase.from("comments").insert([{
        user_name: validated.user_name,
        comment_text: validated.comment_text,
        user_id: user.id,
      }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      setName("");
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
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder={t("comments.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
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
          ) : (
            <div className="text-center py-6 space-y-4">
              <p className="text-muted-foreground">
                Zaloguj się, aby dodać komentarz
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/auth'}
              >
                Zaloguj się
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{t("comments.allComments")}</h3>
        {isLoading ? (
          <p>{t("comments.loading")}</p>
        ) : comments && comments.length > 0 ? (
          comments.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold">{c.user_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-muted-foreground">{c.comment_text}</p>
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
