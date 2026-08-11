'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCurrentModelConfig } from '@/lib/utils/model-config';

type Language = 'hindi' | 'hinglish' | 'english';
type Level = 'simplified' | 'advanced';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const LANG_LABELS: Record<Language, string> = {
  hindi: 'हिंदी',
  hinglish: 'Hinglish',
  english: 'English',
};

const LEVEL_LABELS: Record<Level, string> = {
  simplified: '🟢 सरल / Simple',
  advanced: '🔵 उन्नत / Advanced',
};

export function HomeworkAssistant() {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState<Language>('hindi');
  const [level, setLevel] = useState<Level>('simplified');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleAsk() {
    if (!question.trim() || loading) return;

    const userMessage = question.trim();
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const modelConfig = getCurrentModelConfig();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-model': modelConfig.modelString,
      'x-api-key': modelConfig.apiKey,
    };
    if (modelConfig.baseUrl) headers['x-base-url'] = modelConfig.baseUrl;
    if (modelConfig.providerType) headers['x-provider-type'] = modelConfig.providerType;

    try {
      const res = await fetch('/api/homework-assist', {
        method: 'POST',
        headers,
        body: JSON.stringify({ question: userMessage, subject, language, level }),
      });

      if (!res.ok) throw new Error('Request failed');
      if (!res.body) throw new Error('No response body');

      // Stream response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantText };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            language === 'english'
              ? 'Sorry, could not process your request. Please check your AI model settings.'
              : 'क्षमा करें, आपका अनुरोध पूरा नहीं हो सका। कृपया अपनी AI model settings जांचें।',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Controls */}
      <div className="flex flex-col gap-2 shrink-0">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="विषय / Subject (e.g., Math, Physics, History)"
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="flex gap-2">
          <div className="flex gap-1 p-1 rounded-lg bg-muted flex-1">
            {(Object.keys(LANG_LABELS) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  'flex-1 text-xs py-1 rounded-md font-medium transition-all',
                  language === lang
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {LANG_LABELS[lang]}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-muted">
            {(Object.keys(LEVEL_LABELS) as Level[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={cn(
                  'text-xs px-2 py-1 rounded-md font-medium transition-all',
                  level === lvl
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {LEVEL_LABELS[lvl]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto min-h-0 rounded-xl border border-border bg-muted/20 p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-muted-foreground py-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">AI Homework Assistant</p>
              <p className="text-xs mt-1">कोई भी सवाल पूछें — step-by-step जवाब मिलेगा</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full mt-2">
              {[
                'Newton के गति के नियम क्या हैं?',
                'Photosynthesis कैसे होता है?',
                'Pythagoras theorem explain करो',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuestion(example)}
                  className="text-xs px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-left transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-background border border-border rounded-tl-sm',
              )}
            >
              {msg.content || (loading && i === messages.length - 1 ? '...' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 shrink-0">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
          placeholder={
            language === 'english' ? 'Ask your homework question...' : 'अपना सवाल यहाँ लिखें...'
          }
          rows={2}
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:opacity-50"
        />
        <Button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          size="icon"
          className="self-end rounded-xl h-9 w-9 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
