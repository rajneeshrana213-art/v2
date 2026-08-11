/**
 * AI Lesson Companion API
 *
 * Three modes:
 * - doubt: Ask any doubt about a topic
 * - summary: Generate a concise topic summary
 * - revision: Generate smart revision notes
 */

import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createLogger } from '@/lib/logger';
import { apiError } from '@/lib/server/api-response';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';

const log = createLogger('LessonCompanion');

export interface LessonCompanionRequest {
  mode: 'doubt' | 'summary' | 'revision';
  topic?: string;
  question?: string;
  content?: string;
  language?: 'hi-IN' | 'en';
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LessonCompanionRequest;
    const { mode, topic, question, content, language = 'en' } = body;

    if (!mode) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'mode is required');
    }

    const { model: languageModel } = resolveModelFromHeaders(req);
    const isHindi = language === 'hi-IN';

    let systemPrompt = '';
    let userPrompt = '';

    if (mode === 'doubt') {
      if (!question?.trim()) {
        return apiError('MISSING_REQUIRED_FIELD', 400, 'question is required for doubt mode');
      }

      systemPrompt = isHindi
        ? `आप एक धैर्यवान और ज्ञानी शिक्षक हैं जो हमेशा छात्रों के शंकाओं को स्पष्ट करने के लिए तैयार हैं।
हिंदी में उत्तर दें। स्पष्ट, सरल और उत्साहजनक भाषा का उपयोग करें।
हमेशा:
1. संदेह को स्वीकार करें
2. सरल उदाहरण से समझाएं
3. संबंधित अवधारणाओं से जोड़ें
4. आगे पढ़ने के लिए प्रोत्साहित करें`
        : `You are a patient and knowledgeable teacher always ready to clear student doubts.
Answer clearly, simply, and encouragingly in English.
Always:
1. Acknowledge the doubt
2. Explain with a simple example
3. Connect to related concepts
4. Encourage further exploration`;

      userPrompt = isHindi
        ? `${topic ? `विषय: ${topic}\n` : ''}मेरा सवाल: ${question}`
        : `${topic ? `Topic: ${topic}\n` : ''}My doubt: ${question}`;
    } else if (mode === 'summary') {
      if (!topic?.trim() && !content?.trim()) {
        return apiError(
          'MISSING_REQUIRED_FIELD',
          400,
          'topic or content is required for summary mode',
        );
      }

      systemPrompt = isHindi
        ? `आप एक विशेषज्ञ शिक्षक हैं जो जटिल विषयों को सरल सारांश में बदलते हैं।
हिंदी में उत्तर दें। निम्न प्रारूप में सारांश बनाएं:

## 📌 विषय का परिचय (2-3 वाक्य)
## 🔑 मुख्य अवधारणाएं (bullet points)
## 💡 महत्वपूर्ण तथ्य (bullet points)
## 🔗 अन्य विषयों से संबंध
## ✅ याद रखने योग्य बातें`
        : `You are an expert teacher who condenses complex topics into clear summaries.
Answer in English. Use this format:

## 📌 Introduction (2-3 sentences)
## 🔑 Key Concepts (bullet points)
## 💡 Important Facts (bullet points)
## 🔗 Connections to Other Topics
## ✅ Things to Remember`;

      userPrompt = isHindi
        ? `${topic ? `विषय: ${topic}\n` : ''}${content ? `सामग्री:\n${content}` : ''}\n\nकृपया इस विषय का संक्षिप्त और स्पष्ट सारांश बनाएं।`
        : `${topic ? `Topic: ${topic}\n` : ''}${content ? `Content:\n${content}` : ''}\n\nPlease create a concise and clear summary of this topic.`;
    } else if (mode === 'revision') {
      if (!topic?.trim() && !content?.trim()) {
        return apiError(
          'MISSING_REQUIRED_FIELD',
          400,
          'topic or content is required for revision mode',
        );
      }

      systemPrompt = isHindi
        ? `आप एक परीक्षा-तैयारी विशेषज्ञ हैं। स्मार्ट रिवीजन नोट्स बनाएं जो परीक्षा से पहले पढ़ने के लिए आदर्श हों।
हिंदी में उत्तर दें। निम्न प्रारूप का पालन करें:

## ⚡ त्वरित समीक्षा (Flash Points)
(5-7 सबसे महत्वपूर्ण बिंदु)

## 📝 परिभाषाएं और सूत्र
(महत्वपूर्ण परिभाषाएं और फॉर्मूले)

## ❓ संभावित परीक्षा प्रश्न
(3-5 प्रश्न जो परीक्षा में पूछे जा सकते हैं)

## 🧠 मेमोरी ट्रिक्स
(याद रखने के आसान तरीके)

## ⚠️ सामान्य गलतियां
(परीक्षा में अक्सर होने वाली गलतियां)`
        : `You are an exam preparation expert. Create smart revision notes ideal for reading before an exam.
Answer in English. Follow this format:

## ⚡ Quick Review (Flash Points)
(5-7 most important points)

## 📝 Definitions & Formulas
(Key definitions and formulas)

## ❓ Likely Exam Questions
(3-5 questions that may appear in exam)

## 🧠 Memory Tricks
(Easy ways to remember key concepts)

## ⚠️ Common Mistakes
(Errors students commonly make in exams)`;

      userPrompt = isHindi
        ? `${topic ? `विषय: ${topic}\n` : ''}${content ? `सामग्री:\n${content}` : ''}\n\nकृपया स्मार्ट रिवीजन नोट्स बनाएं।`
        : `${topic ? `Topic: ${topic}\n` : ''}${content ? `Content:\n${content}` : ''}\n\nPlease create smart revision notes.`;
    } else {
      return apiError('INVALID_REQUEST', 400, 'Invalid mode. Use: doubt, summary, or revision');
    }

    const result = streamText({
      model: languageModel,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    log.error('Error:', error);
    return apiError('INTERNAL_ERROR', 500, 'Failed to process lesson companion request');
  }
}
