import { Research } from "@/components/ResearchVault";

export const exportToPDF = (researches: Research[], author: string) => {
  const categoryLabels: Record<string, string> = {
    quantum: "Fizyka kwantowa",
    chemistry: "Chemia",
    dna: "DNA / Genetyka",
    time: "Podróże w czasie",
    math: "Matematyka",
    physics: "Fizyka",
    other: "Inne",
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate HTML content
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Skarbiec Odkryć - ${author}</title>
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #6366f1;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #6366f1;
          margin: 0;
          font-size: 32px;
        }
        .header .author {
          font-size: 18px;
          color: #666;
          margin-top: 10px;
        }
        .watermark-notice {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 8px;
          text-align: center;
        }
        .research {
          page-break-inside: avoid;
          margin-bottom: 40px;
          border: 2px solid #e5e7eb;
          padding: 20px;
          border-radius: 8px;
          background: #f9fafb;
        }
        .research-header {
          border-bottom: 2px solid #6366f1;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .research-title {
          font-size: 24px;
          color: #1f2937;
          margin: 0 0 5px 0;
        }
        .category {
          display: inline-block;
          background: #6366f1;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .research-id {
          color: #6b7280;
          font-size: 12px;
          margin-left: 10px;
        }
        .section {
          margin: 15px 0;
        }
        .section-title {
          font-weight: bold;
          color: #4b5563;
          font-size: 14px;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .section-content {
          background: white;
          padding: 12px;
          border-left: 4px solid #6366f1;
          border-radius: 4px;
        }
        pre {
          background: #1f2937;
          color: #f3f4f6;
          padding: 15px;
          border-radius: 6px;
          overflow-x: auto;
          font-size: 11px;
          line-height: 1.4;
        }
        .watermark {
          background: #ede9fe;
          border: 2px solid #8b5cf6;
          padding: 12px;
          margin-top: 15px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 11px;
          color: #7c3aed;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .metadata {
          color: #6b7280;
          font-size: 12px;
          margin-top: 10px;
          display: flex;
          gap: 20px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔒 SKARBIEC ODKRYĆ</h1>
        <div class="author">Autor: ${author}</div>
        <div style="font-size: 12px; color: #9ca3af; margin-top: 5px;">
          Wygenerowano: ${new Date().toLocaleString("pl-PL")}
        </div>
      </div>

      <div class="watermark-notice">
        <strong>⚠️ DOKUMENT ZABEZPIECZONY</strong><br>
        Każde odkrycie zawiera unikalny watermark z datą i ID.<br>
        Nieuprawnione kopiowanie lub przywłaszczanie jest zabronione.
      </div>
  `;

  researches.forEach((research, index) => {
    html += `
      <div class="research">
        <div class="research-header">
          <h2 class="research-title">${index + 1}. ${research.title}</h2>
          <span class="category">${categoryLabels[research.category]}</span>
          <span class="research-id">ID: ${research.id}</span>
        </div>

        <div class="section">
          <div class="section-title">OPIS</div>
          <div class="section-content">${research.description.replace(/\n/g, "<br>")}</div>
        </div>

        ${research.equations ? `
          <div class="section">
            <div class="section-title">RÓWNANIA / WZORY</div>
            <pre>${research.equations}</pre>
          </div>
        ` : ""}

        ${research.verification ? `
          <div class="section">
            <div class="section-title">WERYFIKACJA</div>
            <pre>${research.verification}</pre>
          </div>
        ` : ""}

        <div class="metadata">
          <span>👤 ${research.author}</span>
          <span>📅 ${formatDate(research.timestamp)}</span>
        </div>

        <div class="watermark">
          🔐 ${research.watermark}
        </div>
      </div>
    `;
  });

  html += `
      <div class="footer">
        <p><strong>Ten dokument został wygenerowany przez Skarbiec Odkryć</strong></p>
        <p>Wszystkie odkrycia są chronione watermarkiem zawierającym autora, datę i unikalny ID</p>
        <p>© ${author} | ${new Date().getFullYear()}</p>
      </div>
    </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Skarbiec_Odkryc_${author.replace(/\s/g, "_")}_${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
