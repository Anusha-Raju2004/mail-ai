/* eslint-disable @typescript-eslint/no-unused-vars */

import { GoogleGenAI } from '@google/genai';

export function normalizeDateRange(val) {
  if (!val || typeof val !== 'string') return undefined;
  const s = val.toLowerCase().trim().replace(/[-\s]+/g, '_');
  if (s === 'today') return 'today';
  if (s === 'yesterday') return 'yesterday';
  if (s === 'this_week' || s === 'thisweek' || s === 'week' || s === 'past_week' || s === 'current_week') return 'this_week';
  if (s === '7days' || s === '7_days' || s === 'last_7_days' || s === '7d' || s === 'past_7_days' || s === 'last7days') return '7days';
  if (s === '30days' || s === '30_days' || s === 'last_30_days' || s === '30d' || s === 'past_30_days' || s === 'past_month' || s === 'month' || s === 'last30days') return '30days';
  if (s === 'all' || s === 'any' || s === 'any_date' || s === 'none') return 'all';
  return val;
}

function postProcessResult(res) {
  if (!res || !Array.isArray(res.actions)) return res;
  const userName = process.env.NEXT_PUBLIC_USER_NAME || 'Astra User';

  res.actions = res.actions.map((action) => {
    if (action.type === 'FILTER_EMAILS' && action.payload) {
      if (action.payload.dateRange) {
        action.payload.dateRange = normalizeDateRange(action.payload.dateRange);
      }
    }

    if (
      (action.type === 'REPLY_TO_EMAIL' || action.type === 'COMPOSE_EMAIL' || action.type === 'SEND_EMAIL') &&
      action.payload &&
      action.payload.body
    ) {
      const body = action.payload.body.trim();
      const hasSignOff = /(best regards|sincerely|regards|cheers|thanks|best),?\s*\n?/i.test(body);
      if (hasSignOff && !body.toLowerCase().includes(userName.toLowerCase())) {
        action.payload.body = `${body}\n${userName}`;
      }
    }

    return action;
  });
  return res;
}

export async function processAssistantRequest(userPrompt, context, history = []) {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (geminiKey && geminiKey.trim().length > 0) {
    try {
      const llmRes = await callGeminiAssistant(userPrompt, context, history, geminiKey.trim());
      if (llmRes && llmRes.message) return postProcessResult(llmRes);
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local action parser:', err.message);
    }
  }

  return postProcessResult(deterministicNLPParser(userPrompt, context, history));
}

async function callGeminiAssistant(prompt, context, history, apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are HELIX AI, an intelligent, empathetic, and highly capable AI email assistant for HELIX MAIL.

YOUR BEHAVIORAL DIRECTIVES:
1. ALWAYS respond naturally to conversational messages, user emotions, compliments, complaints, and general chatter.
2. If the user expresses satisfaction or compliments (e.g. "good job", "awesome", "perfect", "satisfied", "thanks"), express warm, genuine gratitude.
3. If the user expresses dissatisfaction or frustration (e.g. "not satisfied", "wrong", "bad", "fix this"), apologize sincerely and offer clear assistance to resolve it.
4. If the user requests an email action (folder navigation, opening email, compose, reply, forward, delete, star, filter), attach the corresponding UI action inside the "actions" array.
5. If the user request is purely emotional, conversational, or feedback, return an empty actions array: "actions": [].

EMAIL BODY EXTRACTION:
When executing COMPOSE_EMAIL, REPLY_TO_EMAIL, or FORWARD_EMAIL, extract the exact message text requested by the user and set it in "payload.body".

AVAILABLE UI ACTIONS:
1. COMPOSE_EMAIL: { to, subject, body, animateFill: true }
2. SEND_EMAIL: { to, subject, body, threadId }
3. TOGGLE_STAR: { emailId }
4. MARK_READ: { emailId, isRead }
5. DELETE_EMAIL: { emailId }
6. REPLY_TO_EMAIL: { emailId, to, subject, body }
7. FORWARD_EMAIL: { emailId, to, subject, body }
8. FILTER_EMAILS: { query, sender, dateRange, unreadOnly, starredOnly }
9. NAVIGATE_VIEW: { folder } ("inbox", "sent", "starred", "drafts", "trash")
10. OPEN_EMAIL: { emailId, subject }
11. OPEN_EMAIL_BY_QUERY: { query, folder }

Output MUST be JSON matching this exact structure:
{
  "message": "<your conversational response here>",
  "actions": []
}`;

  const contents = [];

  if (Array.isArray(history) && history.length > 0) {
    history.slice(-6).forEach((h) => {
      const role = h.role === 'assistant' ? 'model' : 'user';
      const text = typeof h.content === 'string' ? h.content : h.message || '';
      if (text.trim()) {
        contents.push({
          role,
          parts: [{ text }],
        });
      }
    });
  }

  contents.push({
    role: 'user',
    parts: [
      {
        text: `${systemInstruction}\n\nCurrent Email Context:\n${JSON.stringify(context)}\n\nUser Message: ${prompt}`,
      },
    ],
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
    config: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });

  if (response.text) {
    return JSON.parse(response.text);
  }

  throw new Error('Empty Gemini response');
}

function extractCustomBody(prompt) {
  const quotedMatch = prompt.match(/["']([^"']+)["']/);
  if (quotedMatch && quotedMatch[1].trim()) {
    return quotedMatch[1].trim();
  }

  const phraseMatch = prompt.match(/(?:as|saying|with message|message)\s+(.+)/i);
  if (phraseMatch && phraseMatch[1].trim()) {
    return phraseMatch[1].trim();
  }

  return null;
}

function deterministicNLPParser(prompt, context, history = []) {
  const cleanPrompt = prompt.replace(/^["']|["']$/g, '').trim();
  const lower = cleanPrompt.toLowerCase();
  const actions = [];

  const visibleEmails = context?.visibleEmailsSummary || [];
  const openEmailId = context?.openEmailId || visibleEmails[0]?.id;
  const emailToExtract = cleanPrompt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || '';
  const extractedMessageBody = extractCustomBody(cleanPrompt);

  // 1. Positive Feedback & Satisfaction
  if (/^(satisfied|good job|great|awesome|nice|thank|thanks|perf|perfect|sweet|cool|amazing|brilliant|loved it)/i.test(lower)) {
    return {
      message: "Thank you! I'm glad to hear that you're satisfied. Let me know if you need help with anything else in your mailbox!",
      actions: [],
    };
  }

  // 2. Negative Feedback & Dissatisfaction
  if (/^(not satisfied|bad|wrong|not working|error|bug|terrible|hate|fix this|disappointed|stop|no|nope)/i.test(lower)) {
    return {
      message: "I'm really sorry to hear that. Please tell me what went wrong or how you'd like me to assist you with your emails.",
      actions: [],
    };
  }

  // 3. Greetings & Social Interaction
  if (/^(hi|hello|hey|greetings|good morning|good evening|howdy)/i.test(lower)) {
    return {
      message: "Hello! How can I help you manage your mailbox today?",
      actions: [],
    };
  }

  // 4. Folder Navigation & Opening Emails / Queries
  if (lower.startsWith('open ') || lower.includes('open email') || lower.includes('view email') || lower.includes('show email')) {
    let targetQuery = cleanPrompt.replace(/^(open|view|show)\s+(the\s+)?(email\s+)?/i, '').trim();

    // Clean up trailing "folder" or "view" keywords (e.g. "sent folder" -> "sent")
    const normalizedQuery = targetQuery.replace(/\s+(folder|view)$/i, '').trim().toLowerCase();

    // Direct folder view navigation match
    if (['inbox', 'sent', 'trash', 'drafts', 'starred'].includes(normalizedQuery)) {
      actions.push({
        type: 'NAVIGATE_VIEW',
        title: 'Navigate View',
        description: `Navigating to ${normalizedQuery}`,
        payload: { folder: normalizedQuery },
      });
      return { message: `Switched view to **${normalizedQuery}**.`, actions };
    }

    // Check for folder specification within search terms (e.g. "open invoice in sent folder")
    const folderMatch = targetQuery.match(/(?:in|from)\s+(sent|inbox|trash|drafts|starred)(?:\s+folder)?/i);
    let targetFolder = null;

    if (folderMatch) {
      targetFolder = folderMatch[1].toLowerCase();
      targetQuery = targetQuery.replace(/(?:in|from)\s+(sent|inbox|trash|drafts|starred)(?:\s+folder)?/gi, '').trim();
    }

    // Attempt local visible email match
    let targetEmail = visibleEmails.find((e) => {
      const subject = (e.subject || '').toLowerCase();
      const snippet = (e.snippet || '').toLowerCase();
      return targetQuery && (subject.includes(targetQuery.toLowerCase()) || snippet.includes(targetQuery.toLowerCase()));
    });

    if (targetEmail) {
      actions.push({
        type: 'OPEN_EMAIL',
        title: 'Open Email',
        description: `Opening email: ${targetEmail.subject || 'Selected Message'}`,
        payload: { emailId: targetEmail.id, subject: targetEmail.subject },
      });
      return {
        message: `Opening **${targetEmail.subject || 'selected email'}**.`,
        actions,
      };
    }

    // Query-based lookup fallback
    actions.push({
      type: 'OPEN_EMAIL_BY_QUERY',
      title: 'Search & Open Email',
      description: `Searching for email matching "${targetQuery}"`,
      payload: { query: targetQuery, folder: targetFolder },
    });
    return {
      message: `Searching for **"${targetQuery}"**${targetFolder ? ` in ${targetFolder}` : ''}...`,
      actions,
    };
  }

  // 5. Standalone Folder Navigation (e.g. "go to inbox", "show sent")
  if (
    lower.includes('inbox') ||
    lower.includes('sent') ||
    lower.includes('draft') ||
    lower.includes('trash') ||
    lower.includes('starred')
  ) {
    let folder = 'inbox';
    if (lower.includes('sent')) folder = 'sent';
    else if (lower.includes('draft')) folder = 'drafts';
    else if (lower.includes('trash')) folder = 'trash';
    else if (lower.includes('starred')) folder = 'starred';

    actions.push({
      type: 'NAVIGATE_VIEW',
      title: 'Navigate View',
      description: `Navigating to ${folder}`,
      payload: { folder },
    });
    return { message: `Switched view to **${folder}**.`, actions };
  }

  // 6. Reply to Email
  if (lower.includes('reply')) {
    actions.push({
      type: 'REPLY_TO_EMAIL',
      title: 'Reply to Email',
      description: 'Opening reply dialog',
      payload: {
        emailId: openEmailId,
        to: emailToExtract,
        subject: 'Re: Message',
        body: extractedMessageBody || '',
      },
    });
    return { message: 'Opening reply window.', actions };
  }

  // 7. Forward Email
  if (lower.includes('forward')) {
    actions.push({
      type: 'FORWARD_EMAIL',
      title: 'Forward Email',
      description: 'Forwarding current email',
      payload: {
        emailId: openEmailId,
        to: emailToExtract,
        subject: 'Fwd: Project Update',
        body: extractedMessageBody || 'Please review the forwarded email below.',
      },
    });
    return { message: `Forwarding email to ${emailToExtract || 'recipient'}.`, actions };
  }

  // 8. Compose / Send Email
  if (
    lower.includes('compose') ||
    lower.includes('write') ||
    lower.includes('create email') ||
    lower.includes('send a mail') ||
    lower.includes('send email') ||
    lower.includes('send mail')
  ) {
    const subjectMatch = cleanPrompt.match(/about\s+(.*)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : 'Update';

    actions.push({
      type: 'COMPOSE_EMAIL',
      title: 'Compose Email',
      description: 'Opening compose window',
      payload: {
        to: emailToExtract,
        subject: subject,
        body: extractedMessageBody || `Hi,\n\nI am writing regarding ${subject}.`,
        animateFill: true,
      },
    });
    return { 
      message: `Opened compose dialog for **${emailToExtract || 'your recipient'}**.`, 
      actions 
    };
  }
  // 9. Delete / Remove Email
  if (lower.includes('delete') || lower.includes('remove') || lower.includes('trash')) {
    if (openEmailId) {
      actions.push({
        type: 'DELETE_EMAIL',
        title: 'Delete Email',
        description: 'Moving email to trash',
        payload: { emailId: openEmailId },
      });
      return { message: 'Deleted the selected email.', actions };
    }
  }

  // 10. Star / Unstar
  if (lower.includes('star') || lower.includes('favorite')) {
    if (lower.includes('find') || lower.includes('show') || lower.includes('view') || lower.includes('list')) {
      actions.push({
        type: 'FILTER_EMAILS',
        title: 'Starred Emails',
        description: 'Showing starred emails',
        payload: { starredOnly: true },
      });
      return { message: 'Displaying your starred emails.', actions };
    }
    if (openEmailId) {
      actions.push({
        type: 'TOGGLE_STAR',
        title: 'Toggle Star',
        description: 'Toggling star status',
        payload: { emailId: openEmailId },
      });
      return { message: 'Toggled star on this email.', actions };
    }
  }

  // 11. Mark Read / Unread
  if (lower.includes('read') || lower.includes('unread')) {
    if (openEmailId) {
      actions.push({
        type: 'MARK_READ',
        title: 'Mark Read Status',
        description: 'Updating email read status',
        payload: { emailId: openEmailId, isRead: !lower.includes('unread') },
      });
      return { message: 'Updated read status.', actions };
    }
  }

  return {
    message: "I'm your email assistant! You can ask me to write emails, reply, filter messages, or navigate your inbox.",
    actions: [],
  };
}