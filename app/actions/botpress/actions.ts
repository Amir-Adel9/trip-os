'use server';

import { createClient, reconnectClient } from '@/lib/botpress';
import { getSession, saveSession } from '@/lib/session';

export async function createUserAndConversation() {
  // Create a new client (automatically creates a user)
  const client = await createClient();
  
  // Get the user info from the client
  const user = client.user;
  const userKey = client.userKey;

  // Create a conversation
  const { conversation } = await client.createConversation({});

  return {
    userId: user.id,
    userKey,
    conversationId: conversation.id,
  };
}

export async function getOrCreateSession() {
  const existingSession = await getSession();
  
  if (existingSession) {
    return existingSession;
  }

  // Create new user and conversation
  const { userId, userKey, conversationId } = await createUserAndConversation();

  const newSession = {
    userId,
    userKey,
    conversationId,
  };

  await saveSession(newSession);
  return newSession;
}

export async function sendMessage(
  userKey: string,
  conversationId: string,
  text: string
) {
  const client = await reconnectClient(userKey);
  
  const { message } = await client.createMessage({
    conversationId,
    payload: {
      type: 'text',
      text,
    },
  });

  return message;
}

export async function getMessages(userKey: string, conversationId: string) {
  const client = await reconnectClient(userKey);
  
  const { messages } = await client.listMessages({
    conversationId,
  });

  return messages;
}
