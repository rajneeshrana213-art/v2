'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageCircleQuestion, FileText, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import { useI18n } from '@/lib/hooks/use-i18n';

type CompanionMode = 'doubt' | 'summary' | 'revision';

const MODE_CONFIG: Record<
  CompanionMode,
  {
    label: string;
    labelHi: string;
    icon: React.ElementType;
    placeholder: string;
    placeholderHi: string;
  }
> = {
  doubt: {
    label: 'Ask Doubt',
    labelHi: 'शंका पूछें',
    icon: MessageCircleQuestion,
    placeholder: 'Type your doubt or question...',
    placeholderHi: 'अपनी शंका या सवाल लिखें...',
  },
  summary: {
    label: 'Topic Summary',
    labelHi: 'विषय सारांश',
    icon: FileText,
    placeholder: 'Enter topic name (e.g., "Photosynthesis")',
    placeholderHi: 'विषय का नाम लिखें (जैसे "प्रकाश संश्लेषण")',
  },
  revision: {
    label: 'Revision Notes',
    labelHi: 'रिवीजन नोट्स',
    icon: Brain,
    placeholder: 'Enter topic for revision notes...',
    placeholderHi: 'रिवीजन के लिए विषय लिखें...',
  },
};

interface ResultEntry {
  mode: CompanionMode;
  query: string;
  result: string;
  timestamp: Date;
}

export function LessonCompanion() {
  const { locale } = useI18n();
  const isHindi = locale === 'hi-IN';
  const language = isHindi ? 'hi-IN' : 'en';

  const [mode, setMode] = useState<CompanionMode>('doubt');
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [results, streamingText]);

  async function handleSubmit() {
    const query = input.trim();
    if (!query || loading) return;

    setInput('');
    setLoading(true);
    setStreamingText('');

    const modelConfig = getCurrentModelConfig();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-model': modelConfig.modelString,
      'x-api-key': modelConfig.apiKey,
    };
    if (modelConfig.baseUrl) headers['x-base-url'] = modelConfig.baseUrl;
    if (modelConfig.providerType) headers['x-provider-type'] = modelConfig.providerType;

    const body: Record<string, string> = { mode, language };
    if (mode === 'doubt') {
      body.question = query;
      if (topic) body.topic = topic;
    } else {
      body.topic = query;
    }

    try {
      const res = await fetch('/api/lesson-companion', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Request failed');
      if (!res.body) throw new Error('No body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(fullText);
      }

      setResults((prev) => [{ mode, query, result: fullText, timestamp: new Date() }, ...prev]);
      setStreamingText('');
    } catch {
      setResults((prev) => [
        {
          mode,
          query,
          result: isHindi
            ? 'क्षमा करें, अनुरोध विफल हुआ। कृपया अपनी AI model settings जांचें।'
            : 'Sorry, request failed. Please check your AI model settings.',
          timestamp: new Date(),
        },
        ...prev,
      ]);
      setStreamingText('');
    } finally {
      setLoading(false);
    }
  }

  const cfg = MODE_CONFIG[mode];
  const ModeIcon = cfg.icon;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Mode selector */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted shrink-0">
        {(Object.keys(MODE_CONFIG) as CompanionMode[]).map((m) => {
          const c = MODE_CONFIG[m];
          const Icon = c.icon;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                mode === m
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHindi ? c.labelHi : c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Optional topic for doubt mode */}
      {mode === 'doubt' && (
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={isHindi ? 'विषय (वैकल्पिक)' : 'Topic (optional)'}
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 shrink-0"
        />
      )}

      {/* Results area */}
      <div className="flex-1 overflow-y-auto min-h-0 rounded-xl border border-border bg-muted/20 p-3 space-y-4">
        {/* Streaming result */}
        {loading && streamingText && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ModeIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">
                {isHindi ? cfg.labelHi : cfg.label}
              </span>
              <Loader2 className="w-3 h-3 animate-spin text-primary ml-auto" />
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{streamingText}</p>
          </div>
        )}

        {/* Saved results */}
        {results.map((entry, i) => {
          const entryCfg = MODE_CONFIG[entry.mode];
          const EntryIcon = entryCfg.icon;
          return (
            <div key={i} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start gap-2 mb-2">
                <EntryIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-primary">
                    {isHindi ? entryCfg.labelHi : entryCfg.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.query}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{entry.result}</p>
            </div>
          );
        })}

        {/* Empty state */}
        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8 gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ModeIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isHindi ? cfg.labelHi : cfg.label}
              </p>
              <p className="text-xs mt-1">{isHindi ? cfg.placeholderHi : cfg.placeholder}</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={isHindi ? cfg.placeholderHi : cfg.placeholder}
          rows={2}
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:opacity-50"
        />
        <Button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          size="icon"
          className="self-end rounded-xl h-9 w-9 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
