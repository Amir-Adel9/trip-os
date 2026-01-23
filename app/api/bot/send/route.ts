import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSession, sendMessage, getMessages } from '@/app/actions/botpress/actions';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // 1. Ensure Session
    const session = await getOrCreateSession();
    
    // 2. Send Message
    const userMessage = await sendMessage(session.userKey, session.conversationId, text);
    console.log('User message sent:', userMessage.id);

    // 3. Poll for Reply
    // We'll poll for up to 10 seconds, checking every 500ms
    const maxRetries = 20;
    const interval = 500;
    
    let botReply = null;

    for (let i = 0; i < maxRetries; i++) {
      // Wait for interval
      await new Promise(resolve => setTimeout(resolve, interval));

      // Check for latest messages
      const messages = await getMessages(session.userKey, session.conversationId);

      // Find the first message that is NOT the user message we just sent
      // and is created AFTER the user message.
      const reply = messages.find(m => 
        m.id !== userMessage.id && 
        new Date(m.createdAt) >= new Date(userMessage.createdAt) &&
        m.userId !== session.userId // Ensure it's from the bot
      );

      if (reply) {
        botReply = reply;
        break;
      }
    }

    if (botReply) {
      return NextResponse.json({
        reply: botReply.payload.text || '',
        metadata: botReply.payload,
      });
    } else {
      // Timeout or no reply yet
      return NextResponse.json({ 
        reply: "I'm thinking... (timeout)", 
        metadata: null 
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Error in bot/send:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
