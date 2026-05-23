'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Instagram, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareCardProps {
  projectId: string;
  imageUrl: string;
  title: string;
}

export function ShareCard({ projectId, imageUrl, title }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${projectId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSharePinterest = () => {
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(title)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`Check out my wall art design: ${title}\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Wall Art Design: ${title}`);
    const body = encodeURIComponent(`Check out my wall art design!\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="gap-2">
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-card shadow-lg w-72">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Share Design</h3>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
          ✕
        </button>
      </div>

      {/* Share Link */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="flex-1 px-3 py-1.5 rounded-md border border-input bg-background text-xs"
        />
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>

      {/* Social Share Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSharePinterest}
          className="flex-1 p-2 rounded-md border border-border hover:bg-accent text-center"
          aria-label="Share on Pinterest"
        >
          <span className="text-lg">📌</span>
          <p className="text-[10px] mt-0.5">Pinterest</p>
        </button>
        <button
          onClick={handleShareWhatsApp}
          className="flex-1 p-2 rounded-md border border-border hover:bg-accent text-center"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="h-4 w-4 mx-auto text-green-600" />
          <p className="text-[10px] mt-0.5">WhatsApp</p>
        </button>
        <button
          onClick={handleShareEmail}
          className="flex-1 p-2 rounded-md border border-border hover:bg-accent text-center"
          aria-label="Share via Email"
        >
          <Mail className="h-4 w-4 mx-auto text-blue-600" />
          <p className="text-[10px] mt-0.5">Email</p>
        </button>
      </div>
    </div>
  );
}
