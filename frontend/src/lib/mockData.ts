/**
 * Mock data for demo mode
 * Simulates real-time chat and code sharing without backend
 */

import { Message, Participant } from './socket';

const USER_COLORS = [
  'hsl(180 100% 50%)', // cyan
  'hsl(320 100% 60%)', // magenta
  'hsl(260 80% 65%)',  // purple
  'hsl(40 100% 60%)',  // yellow
  'hsl(140 80% 50%)',  // green
  'hsl(20 100% 60%)',  // orange
];

const SAMPLE_NAMES = [
  'CyberNinja',
  'CodeWizard',
  'NeonDreamer',
  'PixelPunk',
  'ByteBender',
  'QuantumCoder',
];

export function generateMockParticipant(id: string): Participant {
  const safeId = id || 'user1';
  const colorIndex = parseInt(safeId.slice(-1), 16) % USER_COLORS.length;
  const nameIndex = parseInt(safeId.slice(-2), 16) % SAMPLE_NAMES.length;
  
  return {
    id: safeId,
    name: SAMPLE_NAMES[nameIndex] || 'Anonymous',
    color: USER_COLORS[colorIndex] || USER_COLORS[0],
    joinedAt: Date.now() - Math.random() * 3600000,
  };
}

export const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'text',
    content: 'Hey everyone! 👋 Just joined this room',
    userId: 'user1',
    userName: 'CyberNinja',
    userColor: USER_COLORS[0],
    timestamp: Date.now() - 300000,
    reactions: { '👍': 2, '🔥': 1 },
  },
  {
    id: '2',
    type: 'text',
    content: 'Welcome! Check out this React component I just wrote',
    userId: 'user2',
    userName: 'CodeWizard',
    userColor: USER_COLORS[1],
    timestamp: Date.now() - 240000,
  },
  {
    id: '3',
    type: 'code',
    content: `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="glass p-6 rounded-lg">
      <h2 className="text-2xl font-bold">Count: {count}</h2>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="mt-4 px-4 py-2 bg-primary rounded"
      >
        Increment
      </button>
    </div>
  );
}`,
    language: 'typescript',
    userId: 'user2',
    userName: 'CodeWizard',
    userColor: USER_COLORS[1],
    timestamp: Date.now() - 230000,
    reactions: { '🚀': 3, '💯': 2 },
  },
  {
    id: '4',
    type: 'text',
    content: 'That\'s clean! Love the glassmorphism effect',
    userId: 'user3',
    userName: 'NeonDreamer',
    userColor: USER_COLORS[2],
    timestamp: Date.now() - 180000,
  },
  {
    id: '5',
    type: 'code',
    content: `// Here's a Python version with similar logic
from flask import Flask

app = Flask(__name__)
counter = 0

@app.route('/increment', methods=['POST'])
def increment():
    global counter
    counter += 1
    return {'count': counter}`,
    language: 'python',
    userId: 'user4',
    userName: 'ByteBender',
    userColor: USER_COLORS[3],
    timestamp: Date.now() - 120000,
    reactions: { '🐍': 2 },
  },
  {
    id: '6',
    type: 'text',
    content: 'Amazing! This room is perfect for sharing code snippets 🎉',
    userId: 'user1',
    userName: 'CyberNinja',
    userColor: USER_COLORS[0],
    timestamp: Date.now() - 60000,
  },
];

export const MOCK_PARTICIPANTS: Participant[] = [
  generateMockParticipant('user1'),
  generateMockParticipant('user2'),
  generateMockParticipant('user3'),
  generateMockParticipant('user4'),
];

/**
 * Simulate typing indicator
 */
export function simulateTyping(
  participants: Participant[],
  callback: (typingUsers: Participant[]) => void
) {
  const interval = setInterval(() => {
    if (participants.length > 0 && Math.random() > 0.7) {
      const randomUser = participants[Math.floor(Math.random() * participants.length)];
      if (randomUser) {
        callback([randomUser]);
        
        setTimeout(() => {
          callback([]);
        }, 2000);
      }
    }
  }, 5000);

  return () => clearInterval(interval);
}

/**
 * Simulate new messages arriving
 */
export function simulateMessages(
  callback: (message: Message) => void
) {
  const interval = setInterval(() => {
    if (MOCK_PARTICIPANTS.length > 0 && Math.random() > 0.8) {
      const randomUser = MOCK_PARTICIPANTS[Math.floor(Math.random() * MOCK_PARTICIPANTS.length)];
      if (randomUser && randomUser.name && randomUser.color) {
        const messages = [
          'This is amazing! 🚀',
          'Can someone help with this bug?',
          'Just pushed a fix to main',
          'Love this tool! 💜',
          'Anyone working on the API integration?',
        ];
        
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'text',
          content: messages[Math.floor(Math.random() * messages.length)],
          userId: randomUser.id,
          userName: randomUser.name,
          userColor: randomUser.color,
          timestamp: Date.now(),
        };
        
        callback(newMessage);
      }
    }
  }, 10000);

  return () => clearInterval(interval);
}
