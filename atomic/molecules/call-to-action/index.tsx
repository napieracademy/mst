'use client';

import { Button } from '@/atomic/atoms/button';

interface CallToActionProps {
  title: string;
  description?: string;
  buttonText: string;
  onClick?: () => void;
}

export function CallToAction({
  title,
  description,
  buttonText,
  onClick
}: CallToActionProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg">
      <div className="flex-1">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        )}
      </div>
      <Button onClick={onClick} size="sm">
        {buttonText}
      </Button>
    </div>
  );
} 