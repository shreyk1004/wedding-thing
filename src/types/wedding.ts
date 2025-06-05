import { z } from 'zod';

export const weddingDetailsSchema = z.object({
  partner1Name: z.string().min(1, "First partner's name is required"),
  partner2Name: z.string().min(1, "Second partner's name is required"),
  weddingDate: z.string().min(1, "Wedding date is required"),
  city: z.string().min(1, "City is required"),
  theme: z.string().min(1, "Theme/vibe is required"),
  estimatedGuestCount: z.number().min(1, "Guest count is required"),
  specialRequirements: z.array(z.string()).default([]),
  contactEmail: z.string().email("A valid email is required"),
  phone: z.string().min(7, "A valid phone number is required"),
  budget: z.number().min(0, "Budget is required"),
});

export type WeddingDetails = z.infer<typeof weddingDetailsSchema>;

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatState = {
  messages: ChatMessage[];
  weddingDetails: Partial<WeddingDetails>;
  isComplete: boolean;
}; 