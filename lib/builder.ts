import { Builder, builder } from '@builder.io/react';

// Configura la tua API key
export const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || 'a916f15bbace40a6955139545cc1e4a9';

// Inizializza Builder
builder.init(BUILDER_API_KEY);

export function isEditing() {
  return Builder.isEditing;
}

export function isPreviewing() {
  return Builder.isPreviewing;
} 