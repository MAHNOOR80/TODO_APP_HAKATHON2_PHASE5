import { getPrismaClient } from '../config/database.config';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

const prisma = getPrismaClient();

export const chatHistoryService = {
  /**
   * Get or create a conversation.
   * If no ID is provided, creates a new one using the message as the title.
   */
  async getOrCreateConversation(userId: string, conversationId?: string, firstMessage?: string) {
    if (conversationId) {
      const existing = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      // Security check: ensure the conversation belongs to the user
      if (existing && existing.userId === userId) {
        return existing;
      }
    }

    // Create new conversation
    const title = firstMessage 
      ? (firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '')) 
      : "New Chat";

    return prisma.conversation.create({
      data: {
        userId,
        title,
      },
    });
  },

  /**
   * Save a message to the database.
   */
  async saveMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
    return prisma.chatMessage.create({
      data: {
        conversationId,
        role,
        content,
      },
    });
  },

  /**
   * Get recent messages for context window (formatted for OpenAI).
   */
  async getRecentMessages(conversationId: string, limit: number = 10): Promise<ChatCompletionMessageParam[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' }, // Get newest first
      take: limit,
    });

    // Reverse to chronological order (oldest -> newest) for OpenAI
    return messages.reverse().map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
  },

  /**
   * Get all conversations for the sidebar.
   */
  async getUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        createdAt: true,
      }
    });
  },

  /**
   * Get full conversation details with messages.
   */
  async getConversationDetail(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    return conversation;
  },

  /**
   * Delete a conversation.
   */
  async deleteConversation(conversationId: string, userId: string) {
    return prisma.conversation.deleteMany({
      where: { id: conversationId, userId } // deleteMany used for safety check on userId
    });
  }
};