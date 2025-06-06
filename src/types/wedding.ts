import { z } from 'zod';

export const weddingDetailsSchema = z.object({
  partner1name: z.string().min(1, "Partner 1 name is required"),
  partner2name: z.string().min(1, "Partner 2 name is required"),
  weddingdate: z.string().min(1, "Wedding date is required"),
  city: z.string().min(1, "City is required"),
  theme: z.string().optional(),
  estimatedguestcount: z.number().min(1, "Guest count must be at least 1"),
  specialrequirements: z.array(z.string()).optional(),
  contactemail: z.string().email("A valid email is required"),
  phone: z.string().optional(),
  budget: z.number().optional(),
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