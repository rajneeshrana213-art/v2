'use client';

import { useState } from 'react';
import { X, GraduationCap, ClipboardCheck, BookOpenCheck, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExamEvaluator } from './exam-evaluator';
import { HomeworkAssistant } from './homework-assistant';
import { LessonCompanion } from './lesson-companion';

type AcademicTab = 'exam' | 'homework' | 'companion';

interface AcademicPanelProps {
  onClose?: () => void;
  className?: string;
}

const TABS: {
  id: AcademicTab;
  label: string;
  labelHi: string;
  icon: React.ElementType;
  desc: string;
  descHi: string;
}[] = [
  {
    id: 'exam',
    label: 'Exam Evaluation',
    labelHi: 'परीक्षा मूल्यांकन',
    icon: ClipboardCheck,
    desc: 'MCQ & subjective grading',
    descHi: 'MCQ और विस्तृत उत्तर',
  },
  {
    id: 'homework',
    label: 'Homework Help',
    labelHi: 'होमवर्क सहायक',
    icon: BookOpenCheck,
    desc: 'Step-by-step explanations',
    descHi: 'चरण-दर-चरण व्याख्या',
  },
  {
    id: 'companion',
    label: 'Lesson Companion',
    labelHi: 'पाठ साथी',
    icon: Lightbulb,
    desc: 'Doubts, summary & revision',
    descHi: 'शंका, सारांश और रिवीजन',
  },
];

export function AcademicPanel({ onClose, className }: AcademicPanelProps) {
  const [activeTab, setActiveTab] = useState<AcademicTab>('exam');

  const activeTabConfig = TABS.find((t) => t.id === activeTab)!;
  const Icon = activeTabConfig.icon;

  return (
    <div className={cn('flex flex-col bg-background border-l border-border h-full', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-foreground leading-none">Academic Intelligence</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">शैक्षणिक AI सहायक</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-border shrink-0">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 text-center transition-all border-b-2',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <TabIcon className="w-4 h-4" />
              <span className="text-[10px] font-medium leading-tight">{tab.labelHi}</span>
            </button>
          );
        })}
      </div>

      {/* Active tab label */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">{activeTabConfig.labelHi}</span>
        <span className="text-[10px] text-muted-foreground">— {activeTabConfig.descHi}</span>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {activeTab === 'exam' && <ExamEvaluator />}
        {activeTab === 'homework' && <HomeworkAssistant />}
        {activeTab === 'companion' && <LessonCompanion />}
      </div>
    </div>
  );
}
