'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TryOnCanvas } from '@/components/canvas/TryOnCanvas';
import { Button } from '@/components/ui/button';
import { connectSocket, joinCollabRoom, CollabCursor } from '@/lib/socket';
import { Users, Copy, Check, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function CollabPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [participants, setParticipants] = useState<string[]>([]);
  const [cursors, setCursors] = useState<Map<string, CollabCursor>>(new Map());
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; text: string; userName: string }>>([]);

  useEffect(() => {
    const socket = connectSocket();

    // Join the collaboration room
    joinCollabRoom(roomId, 'current-user', 'You');

    // Listen for events
    socket.on('collab:user-joined', (data: { userId: string; userName: string }) => {
      setParticipants((prev) => [...prev, data.userName]);
    });

    socket.on('collab:user-left', () => {
      // Handle user leaving
    });

    socket.on('collab:cursor-update', (data: CollabCursor) => {
      setCursors((prev) => new Map(prev).set(data.userId, data));
    });

    socket.on('collab:new-comment', (data: { id: string; text: string; userName: string }) => {
      setComments((prev) => [...prev, data]);
    });

    return () => {
      socket.off('collab:user-joined');
      socket.off('collab:user-left');
      socket.off('collab:cursor-update');
      socket.off('collab:new-comment');
    };
  }, [roomId]);

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Collab Header */}
      <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/try-on">
            <Button variant="ghost" size="sm">← Back</Button>
          </Link>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Collaborative Session</span>
          </div>
          <div className="flex -space-x-2">
            {participants.map((name, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center"
                title={name}
              >
                <span className="text-[10px] font-medium">{name[0]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied!' : 'Invite Link'}
          </Button>
        </div>
      </header>

      {/* Main Canvas with Cursor Overlays */}
      <div className="flex-1 relative">
        <TryOnCanvas />

        {/* Remote Cursors */}
        {Array.from(cursors.values()).map((cursor) => (
          <div
            key={cursor.userId}
            className="absolute pointer-events-none z-50 transition-all duration-75"
            style={{ left: cursor.x, top: cursor.y }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill={cursor.color}>
              <path d="M0 0L16 6L8 8L6 16L0 0Z" />
            </svg>
            <span
              className="absolute left-4 top-4 text-[10px] px-1.5 py-0.5 rounded text-white whitespace-nowrap"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.userName}
            </span>
          </div>
        ))}

        {/* Comments Panel */}
        {comments.length > 0 && (
          <div className="absolute bottom-4 left-4 w-64 bg-card border border-border rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
            <h4 className="text-xs font-medium flex items-center gap-1 mb-2">
              <MessageSquare className="h-3 w-3" />
              Comments
            </h4>
            {comments.map((comment) => (
              <div key={comment.id} className="text-xs mb-1.5">
                <span className="font-medium">{comment.userName}:</span>{' '}
                <span className="text-muted-foreground">{comment.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
