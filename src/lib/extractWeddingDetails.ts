import { ChatMessage, WeddingDetails } from '@/types/wedding';

const FIELD_MAP: Record<string, keyof WeddingDetails> = {
  'wedding date': 'weddingdate',
  'date': 'weddingdate',
  'partners': 'partner1name', // will split later
  'names': 'partner1name', // will split later
  'couple': 'partner1name',
  'location': 'city',
  'city': 'city',
  'theme': 'theme',
  'vibe': 'theme',
  'style': 'theme',
  'guests': 'estimatedguestcount',
  'estimated guests': 'estimatedguestcount',
  'guest count': 'estimatedguestcount',
  'estimated number of guests': 'estimatedguestcount',
  'special requirements': 'specialrequirements',
  'requirements': 'specialrequirements',
  'contact email': 'contactemail',
  'email': 'contactemail',
  'phone': 'phone',
  'phone number': 'phone',
  'contact number': 'phone',
  'estimated budget': 'budget',
  'budget': 'budget',
  'total budget': 'budget',
};

export function extractWeddingDetails(messages: ChatMessage[]): Partial<WeddingDetails> {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'assistant') return {};

  const content = lastMessage.content;
  const details: Partial<WeddingDetails> = {};

  // 1. Process each Markdown-style summary line individually
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const mdMatch = line.match(/^[-*]\s*\*\*(.+?):\*\*\s*(.+)$/i);
    if (mdMatch) {
      const fieldRaw = mdMatch[1].trim().toLowerCase();
      let value = mdMatch[2].trim();
      const key = FIELD_MAP[fieldRaw];
      if (key) {
        if (key === 'partner1name') {
          // Try to split names if possible
          const names = value.split(/\s*(?:and|&)\s*/i);
          details.partner1name = names[0]?.trim();
          if (names[1]) details.partner2name = names[1].trim();
        } else if (key === 'estimatedguestcount') {
          details.estimatedguestcount = parseInt(value.replace(/[^\d]/g, ''), 10);
        } else if (key === 'budget') {
          details.budget = parseFloat(value.replace(/[^\d.]/g, ''));
        } else if (key === 'specialrequirements') {
          details.specialrequirements = [value];
        } else {
          details[key] = value;
        }
      }
    }
  }

  // 2. Fallback to previous regexes for any missing fields
  const lowerContent = content.toLowerCase();
  if (!details.partner1name || !details.partner2name) {
    const nameMatch = lowerContent.match(/(?:names?|partners?|couple):?\s*([^,]+)\s*(?:and|&)\s*([^,.]+)/i);
    if (nameMatch) {
      details.partner1name = nameMatch[1].trim();
      details.partner2name = nameMatch[2].trim();
    }
  }
  if (!details.weddingdate) {
    const dateMatch = lowerContent.match(/(?:date|when):?\s*([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i);
    if (dateMatch) {
      details.weddingdate = dateMatch[1].trim();
    }
  }
  if (!details.city) {
    const cityMatch = lowerContent.match(/(?:city|location):?\s*([a-z\s]+(?:city|town|village)?)/i);
    if (cityMatch) {
      details.city = cityMatch[1].trim();
    }
  }
  if (!details.estimatedguestcount) {
    const guestMatch = lowerContent.match(/(?:guests?|attendance|estimated at):?\s*(\d+)/i);
    if (guestMatch) {
      details.estimatedguestcount = parseInt(guestMatch[1], 10);
    }
  }
  if (!details.theme) {
    const themeMatch = lowerContent.match(/(?:theme|vibe|style):?\s*([^,.]+)/i);
    if (themeMatch) {
      details.theme = themeMatch[1].trim();
    }
  }
  if (!details.specialrequirements) {
    const requirements = lowerContent.match(/(?:special requirements?|needs?):?\s*([^,.]+)/gi);
    if (requirements) {
      details.specialrequirements = requirements.map(req => req.replace(/(?:special requirements?|needs?):?\s*/i, '').trim());
    }
  }
  if (!details.contactemail) {
    const emailMatch = lowerContent.match(/(?:email|contact email|e-mail)[^\w\d]*([\w.-]+@[\w.-]+\.[a-z]{2,})/i);
    if (emailMatch) {
      details.contactemail = emailMatch[1].trim();
    }
  }
  if (!details.phone) {
    const phoneMatch = lowerContent.match(/(?:phone|phone number|contact number|contact phone)[^\d\+\(\)]*([\d\-\+\(\)\s]{7,})/i);
    if (phoneMatch) {
      details.phone = phoneMatch[1].replace(/[^\d\+]/g, '').trim();
    }
  }
  if (!details.budget) {
    const budgetMatch = lowerContent.match(/(?:budget|estimated budget|total budget)[^\d\$]*\$?([\d,\.]+)/i);
    if (budgetMatch) {
      details.budget = parseFloat(budgetMatch[1].replace(/,/g, ''));
    }
  }

  return details;
} 