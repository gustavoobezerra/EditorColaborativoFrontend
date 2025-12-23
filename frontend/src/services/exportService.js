import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import TurndownService from 'turndown';

/**
 * ExportService - Exporta documentos para múltiplos formatos
 *
 * Suporta: PDF, DOCX, Markdown, TXT, HTML
 */

/**
 * Exportar para PDF
 */
export async function exportToPDF(title, contentHtml) {
  try {
    // Criar elemento temporário com o conteúdo
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.padding = '20mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.innerHTML = `
      <h1 style="margin-bottom: 20px;">${title}</h1>
      ${contentHtml}
    `;
    document.body.appendChild(tempDiv);

    // Converter para canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    // Remover elemento temporário
    document.body.removeChild(tempDiv);

    // Criar PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Adicionar primeira página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Adicionar páginas adicionais se necessário
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download
    pdf.save(`${title}.pdf`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Exportar para DOCX
 */
export async function exportToDOCX(title, quillDelta) {
  try {
    const children = [];

    // Adicionar título
    children.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1
      })
    );

    // Converter Quill Delta para DOCX
    if (quillDelta && quillDelta.ops) {
      let currentParagraph = [];

      quillDelta.ops.forEach((op) => {
        if (typeof op.insert === 'string') {
          const lines = op.insert.split('\n');

          lines.forEach((line, index) => {
            if (line) {
              const textRun = new TextRun({
                text: line,
                bold: op.attributes?.bold || false,
                italics: op.attributes?.italic || false,
                underline: op.attributes?.underline ? {} : undefined
              });
              currentParagraph.push(textRun);
            }

            // Nova linha cria novo parágrafo
            if (index < lines.length - 1 || line === '') {
              if (currentParagraph.length > 0 || line === '') {
                children.push(new Paragraph({ children: currentParagraph }));
                currentParagraph = [];
              }
            }
          });
        }
      });

      // Adicionar último parágrafo se existir
      if (currentParagraph.length > 0) {
        children.push(new Paragraph({ children: currentParagraph }));
      }
    }

    // Criar documento
    const doc = new Document({
      sections: [{
        children: children
      }]
    });

    // Gerar blob e download
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.docx`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar DOCX:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Exportar para Markdown
 */
export function exportToMarkdown(title, contentHtml) {
  try {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });

    const markdown = turndownService.turndown(contentHtml);
    const content = `# ${title}\n\n${markdown}`;

    // Download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.md`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar Markdown:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Exportar para TXT
 */
export function exportToTXT(title, quillInstance) {
  try {
    const text = quillInstance.getText();
    const content = `${title}\n${'='.repeat(title.length)}\n\n${text}`;

    // Download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar TXT:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Exportar para HTML
 */
export function exportToHTML(title, contentHtml) {
  try {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { margin-bottom: 20px; }
    img { max-width: 100%; height: auto; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${contentHtml}
</body>
</html>`;

    // Download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.html`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar HTML:', error);
    return { success: false, error: error.message };
  }
}

export default {
  exportToPDF,
  exportToDOCX,
  exportToMarkdown,
  exportToTXT,
  exportToHTML
};
