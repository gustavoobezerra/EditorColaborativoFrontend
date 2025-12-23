import { useState } from 'react';
import { Download, FileText, FileCode, FileJson, File } from 'lucide-react';
import exportService from '../services/exportService';

export default function ExportMenu({ title, quillInstance, className = '' }) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    if (!quillInstance) return;

    setExporting(true);
    setShowMenu(false);

    try {
      const content = quillInstance.getContents();
      const html = quillInstance.root.innerHTML;

      switch (format) {
        case 'pdf':
          await exportService.exportToPDF(title, html);
          break;
        case 'docx':
          await exportService.exportToDOCX(title, content);
          break;
        case 'markdown':
          exportService.exportToMarkdown(title, html);
          break;
        case 'txt':
          exportService.exportToTXT(title, quillInstance);
          break;
        case 'html':
          exportService.exportToHTML(title, html);
          break;
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar documento');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all disabled:opacity-50"
      >
        <Download size={18} />
        {exporting ? 'Exportando...' : 'Exportar'}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 py-2 overflow-hidden">
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText size={18} className="text-red-500" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={() => handleExport('docx')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <File size={18} className="text-blue-500" />
              <span>Exportar DOCX</span>
            </button>
            <button
              onClick={() => handleExport('markdown')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileCode size={18} className="text-purple-500" />
              <span>Exportar Markdown</span>
            </button>
            <button
              onClick={() => handleExport('txt')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText size={18} className="text-gray-500" />
              <span>Exportar TXT</span>
            </button>
            <button
              onClick={() => handleExport('html')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileJson size={18} className="text-orange-500" />
              <span>Exportar HTML</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
