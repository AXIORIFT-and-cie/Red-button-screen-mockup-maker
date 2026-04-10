import { useState, useMemo } from 'react';
import { Copy, Check, Code2, FileCode } from 'lucide-react';
import { generateMakeCodeJS, generateMakeCodePython, countLitPixels } from '../utils/codeGenerator';

interface CodePanelProps {
  pixels: boolean[][];
}

type Lang = 'javascript' | 'python';

export default function CodePanel({ pixels }: CodePanelProps) {
  const [lang, setLang] = useState<Lang>('javascript');
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    if (lang === 'javascript') return generateMakeCodeJS(pixels);
    return generateMakeCodePython(pixels);
  }, [pixels, lang]);

  const litCount = useMemo(() => countLitPixels(pixels), [pixels]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-panel-bg border border-panel-border rounded-lg overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-accent" />
          <span className="text-xs text-gray-300">MakeCode Output</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-500 mr-2">
            {litCount} pixels
          </span>
          <button
            onClick={() => setLang('javascript')}
            className={`px-2 py-0.5 text-[10px] rounded border ${
              lang === 'javascript'
                ? 'border-accent text-accent bg-accent/10'
                : 'border-panel-border text-gray-500 hover:text-gray-300'
            }`}
          >
            <FileCode size={10} className="inline mr-1" />
            JS
          </button>
          <button
            onClick={() => setLang('python')}
            className={`px-2 py-0.5 text-[10px] rounded border ${
              lang === 'python'
                ? 'border-accent text-accent bg-accent/10'
                : 'border-panel-border text-gray-500 hover:text-gray-300'
            }`}
          >
            <FileCode size={10} className="inline mr-1" />
            Python
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-accent/5 border-b border-panel-border px-3 py-1.5 text-[10px] text-gray-400">
        Extension: <span className="text-accent">makecode-extensions/OLED12864_I2C</span>
        <br />
        In MakeCode, go to Extensions and paste:
        <span className="text-accent ml-1">https://github.com/makecode-extensions/OLED12864_I2C</span>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto relative">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded border border-panel-border bg-panel-bg/80 text-gray-400 hover:text-accent hover:border-accent transition-colors z-10"
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
        <pre className="code-output p-3 text-gray-300 whitespace-pre overflow-auto h-full m-0">
          {code}
        </pre>
      </div>
    </div>
  );
}
