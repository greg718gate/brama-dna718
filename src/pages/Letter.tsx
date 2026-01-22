import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const letterText = `Professor John Lennox
Green Templeton College
Woodstock Road
Oxford OX2 6HG
United Kingdom


[Your Full Name]
[Your Postal Address]
Aberdeen, Scotland
[Your Email] (optional)
[Your Phone] (optional)

[Date]


Dear Professor Lennox,

I am writing from Aberdeen, Scotland, to respectfully share a project that I believe may be relevant to your long-standing work at the interface of science, reason, and Christian theology.

The project is titled "SCIENCE.GOD/UNIFIED" and is presented as an interactive, computational framework that compares scientific language and biblical language as two modes of description that can be mapped into a common "meaning layer". The aim is not to replace scientific method with theology, nor to force theology into scientific terminology, but to test whether a disciplined translation framework can reduce unnecessary conflict created by category errors.

The core "UNIFIED" section (the main thesis) is available here:
https://brama-dna718.com/unified

The complete source code is publicly available here:
https://github.com/greg718gate/brama-dna718

To avoid sending excessive material, I am enclosing a single one-page technical attachment. It contains (i) the minimal table "Science says / Religion hears / Meaning", (ii) a short mathematical anchor (Riemann zeta and the Golden Ratio) used in the project's internal verification examples, and (iii) a QR code (added at the bottom of the page) linking directly to the UNIFIED section.

I understand you receive many requests. If this is not of interest, no reply is necessary. If it is, I would be grateful for any brief indication of whether the approach is coherent enough to warrant further academic review, or whether it contains an identifiable conceptual error.

Thank you for your time and consideration.

Yours sincerely,

[Your Full Name]
Aberdeen, Scotland`;

const attachmentText = `SCIENCE.GOD/UNIFIED — Technical Attachment (1 page)

Purpose (minimal):
A compact mapping framework that aligns scientific terminology with theological language via a third column ("Meaning"), in order to reduce mistranslation-driven conflict between scientific and scriptural discourse.

1) Minimal mapping table (example set)

Science says:      "Quantum field"
Religion hears:    "Magic"
Meaning:           A substrate-like description of reality (a structured, law-governed field; not a claim of superstition).

Science says:      "Evolution"
Religion hears:    "Random chaos"
Meaning:           A constrained process in time with lawful dynamics; complexity can emerge without implying purposelessness.

Science says:      "DNA code"
Religion hears:    "Biological machine"
Meaning:           An informational structure with syntax-like regularities; invites questions about interpretation and origin of meaning.

Science says:      "Big Bang"
Religion hears:    "Mythical creation"
Meaning:           A boundary condition / origin model for spacetime; not identical to a literal narrative, but potentially compatible with creation as ontology.


2) Mathematical anchors (minimal)
Riemann zeta function:
ζ(s) = Σ_{n=1..∞} (1 / n^s)

Golden Ratio:
φ = (1 + √5) / 2 ≈ 1.6180339887


3) Where to view the core thesis (UNIFIED):
https://brama-dna718.com/unified


4) Source code (verification and transparency):
https://github.com/greg718gate/brama-dna718


[Place QR code here at the bottom of the page linking to: https://brama-dna718.com/unified]`;

const Letter = () => {
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedAttachment, setCopiedAttachment] = useState(false);

  const copyToClipboard = async (text: string, type: "letter" | "attachment") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "letter") {
        setCopiedLetter(true);
        setTimeout(() => setCopiedLetter(false), 2000);
      } else {
        setCopiedAttachment(true);
        setTimeout(() => setCopiedAttachment(false), 2000);
      }
      toast.success(type === "letter" ? "List skopiowany!" : "Załącznik skopiowany!");
    } catch (err) {
      toast.error("Nie udało się skopiować");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/unified">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">List do Prof. Johna Lennoxa</h1>
        </div>

        {/* Letter */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">📄 Formal Letter (EN)</h2>
            <Button 
              onClick={() => copyToClipboard(letterText, "letter")}
              variant={copiedLetter ? "default" : "outline"}
              className="gap-2"
            >
              {copiedLetter ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedLetter ? "Skopiowano!" : "Kopiuj list"}
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-mono overflow-x-auto">
            {letterText}
          </pre>
        </Card>

        {/* Attachment */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">📎 Technical Attachment (EN)</h2>
            <Button 
              onClick={() => copyToClipboard(attachmentText, "attachment")}
              variant={copiedAttachment ? "default" : "outline"}
              className="gap-2"
            >
              {copiedAttachment ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedAttachment ? "Skopiowano!" : "Kopiuj załącznik"}
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-mono overflow-x-auto">
            {attachmentText}
          </pre>
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">📬 Instrukcja wysyłki:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1. Skopiuj list → wklej do Worda → uzupełnij [Your Full Name] itd.</li>
            <li>2. Skopiuj załącznik → wklej na drugą stronę → dodaj QR kod na dole</li>
            <li>3. Wydrukuj 2 strony A4</li>
            <li>4. Wyślij: Royal Mail "Signed For 1st Class"</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Letter;
