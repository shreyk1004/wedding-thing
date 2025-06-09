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
  const details: Partial<WeddingDetails> = {};
  
  // Process all messages to accumulate details
  for (const message of messages) {
    const content = message.content.toLowerCase();

    // Helper to update details only if the key doesn't exist yet
    const setDetail = (key: keyof WeddingDetails, value: any) => {
      if (details[key] === undefined) {
        // @ts-ignore
        details[key] = value;
      }
    };
    
    // Use regex to find key-value pairs like "Field: Value"
    const simpleMatches = content.matchAll(/([\w\s]+?):\s*([^\n\r]+)/g);
    for (const match of simpleMatches) {
      const fieldRaw = match[1].trim().toLowerCase();
      let value = match[2].trim();
      const key = FIELD_MAP[fieldRaw];
      
      if (key) {
        if (key === 'partner1name' && (details.partner1name === undefined || details.partner2name === undefined)) {
          const names = value.split(/\s*(?:and|&)\s*/i);
          if (names[0]) setDetail('partner1name', names[0].trim());
          if (names[1]) setDetail('partner2name', names[1].trim());
        } else if (key === 'estimatedguestcount') {
          setDetail('estimatedguestcount', parseInt(value.replace(/[^\d]/g, ''), 10));
        } else if (key === 'budget') {
          setDetail('budget', parseFloat(value.replace(/[^\d.,]/g, '')));
        } else if (key === 'specialrequirements') {
          if (!details.specialrequirements) details.specialrequirements = [];
          details.specialrequirements.push(value);
        } else {
          setDetail(key, value);
        }
      }
    }

    // Fallback regex for unstructured text, applied to all messages
    if (details.partner1name === undefined || details.partner2name === undefined) {
      const nameMatch = content.match(/(?:my name is|I'm|I am)\s+([a-z\s]+)\s+(?:and my partner is|and my partner's name is|my partner's name is)\s+([a-z\s]+)/i)
                       ?? content.match(/partners are\s+([a-z\s]+)\s+and\s+([a-z\s]+)/i)
                       ?? content.match(/([a-z\s]+)\s+and\s+([a-z\s]+)/i);
      if (nameMatch) {
        setDetail('partner1name', nameMatch[1].trim());
        setDetail('partner2name', nameMatch[2].trim());
      }
    }
    if (details.weddingdate === undefined) {
      const dateMatch = content.match(/(?:on|date is)\s*([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i);
      if (dateMatch) setDetail('weddingdate', dateMatch[1].trim());
    }
    if (details.city === undefined) {
      const cityMatch = content.match(/(?:in|at|city is)\s*([a-z\s]+(?:city|town|village))/i);
      if (cityMatch) setDetail('city', cityMatch[1].trim());
    }
    if (details.estimatedguestcount === undefined) {
      const guestMatch = content.match(/(\d+)\s*guests?/i);
      if (guestMatch) setDetail('estimatedguestcount', parseInt(guestMatch[1], 10));
    }
    if (details.theme === undefined) {
      const themeMatch = content.match(/(?:theme is|vibe is|style is)\s*([^,.\n]+)/i);
      if (themeMatch) setDetail('theme', themeMatch[1].trim());
    }
    if (details.contactemail === undefined) {
      const emailMatch = content.match(/[\w.-]+@[\w.-]+\.[a-z]{2,}/i);
      if (emailMatch) setDetail('contactemail', emailMatch[0].trim());
    }
    if (details.phone === undefined) {
      const phoneMatch = content.match(/[\d\-\+\(\)\s]{7,}/i);
      if (phoneMatch) setDetail('phone', phoneMatch[0].replace(/[^\d\+]/g, '').trim());
    }
    if (details.budget === undefined) {
      const budgetMatch = content.match(/(?:\$|budget of\s*\$?)?([\d,]+(?:\.\d{2})?)/i);
      if (budgetMatch) setDetail('budget', parseFloat(budgetMatch[1].replace(/,/g, '')));
    }
  }

  return details;
} 