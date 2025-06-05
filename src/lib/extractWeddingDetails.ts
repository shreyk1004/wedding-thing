import { ChatMessage, WeddingDetails } from '@/types/wedding';

export function extractWeddingDetails(messages: ChatMessage[]): Partial<WeddingDetails> {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'assistant') return {};

  const content = lastMessage.content.toLowerCase();
  const details: Partial<WeddingDetails> = {};

  const nameMatch = content.match(/(?:names?|couple):?\s*([^,]+)\s*(?:and|&)\s*([^,.]+)/i);
  if (nameMatch) {
    details.partner1Name = nameMatch[1].trim();
    details.partner2Name = nameMatch[2].trim();
  }

  const dateMatch = content.match(/(?:date|when):?\s*([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i);
  if (dateMatch) {
    details.weddingDate = dateMatch[1].trim();
  }

  const cityMatch = content.match(/(?:city|location):?\s*([A-Za-z\s]+(?:city|town|village)?)/i);
  if (cityMatch) {
    details.city = cityMatch[1].trim();
  }

  const guestMatch = content.match(/(?:guests?|attendance):?\s*(\d+)/i);
  if (guestMatch) {
    details.estimatedGuestCount = parseInt(guestMatch[1], 10);
  }

  const themeMatch = content.match(/(?:theme|vibe|style):?\s*([^,.]+)/i);
  if (themeMatch) {
    details.theme = themeMatch[1].trim();
  }

  const requirements = content.match(/(?:special requirements?|needs?):?\s*([^,.]+)/gi);
  if (requirements) {
    details.specialRequirements = requirements.map(req => req.replace(/(?:special requirements?|needs?):?\s*/i, '').trim());
  }

  // New fields
  const emailMatch = content.match(/(?:email|contact email):?\s*([\w.-]+@[\w.-]+\.[a-z]{2,})/i);
  if (emailMatch) {
    details.contactEmail = emailMatch[1].trim();
  }

  const phoneMatch = content.match(/(?:phone|contact number|phone number):?\s*([\d\-\+\(\)\s]{7,})/i);
  if (phoneMatch) {
    details.phone = phoneMatch[1].trim();
  }

  const budgetMatch = content.match(/(?:budget|estimated budget|total budget):?\s*\$?([\d,\.]+)/i);
  if (budgetMatch) {
    details.budget = parseFloat(budgetMatch[1].replace(/,/g, ''));
  }

  return details;
} 