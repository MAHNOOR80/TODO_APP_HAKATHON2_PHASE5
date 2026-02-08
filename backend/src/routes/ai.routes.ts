import express, { Request, Response, Router } from 'express';
import { aiConfig, initializeOpenAIClient } from '../config/ai.config';
import { AI_Agent } from '../ai/agent';
import { requireAuth } from '../middleware/auth.middleware';
import { aiRateLimiter, validateAIChatInput, sanitizeAIResponse } from '../middleware/ai-security.middleware';
import { chatHistoryService } from '../services/chat-history.service';

const aiAgent = new AI_Agent(initializeOpenAIClient(), aiConfig);
const router: Router = express.Router();

/**
 * POST /api/v1/ai/chat
 * Handles chat, saves history, and maintains context.
 */
router.post('/chat', requireAuth, aiRateLimiter, validateAIChatInput, async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body; // sessionId is treated as conversationId
    const userId = req.userId!;

    // 1. Get or Create Conversation (Project A logic: source 63-66)
    const conversation = await chatHistoryService.getOrCreateConversation(userId, sessionId, message);
    const conversationId = conversation.id;

    // 2. Save USER Message (Project A logic: source 67)
    await chatHistoryService.saveMessage(conversationId, 'user', message);

    // 3. Get History for Context (Project A logic: source 68-69)
    const history = await chatHistoryService.getRecentMessages(conversationId);

    // 4. Process AI Request
    const result = await aiAgent.processChat(message, userId, history);

    // 5. Save ASSISTANT Message (Project A logic: source 80-81)
    if (result.success && result.data) {
        await chatHistoryService.saveMessage(conversationId, 'assistant', result.data.responseText);
    }

    // 6. Return Response
    const sanitizedResult = sanitizeAIResponse(result);
    
    // Inject the conversationId so the frontend can update the URL/State
    res.status(200).json({
        ...sanitizedResult,
        data: {
            ...sanitizedResult.data,
            conversationId: conversationId 
        }
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An error occurred processing your request' }
    });
  }
});

/**
 * GET /api/v1/ai/conversations
 * Get list of conversations (History Sidebar).
 * Matches Project A logic: source 83
 */
router.get('/conversations', requireAuth, async (req: Request, res: Response) => {
    try {
        const history = await chatHistoryService.getUserConversations(req.userId!);
        res.status(200).json(history); // Project A returns array directly
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'HISTORY_ERROR', message: 'Failed to fetch history' }});
    }
});

/**
 * GET /api/v1/ai/conversations/:id
 * Get details of a specific conversation.
 * Matches Project A logic: source 84
 */
router.get('/conversations/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const conversation = await chatHistoryService.getConversationDetail(req.params.id, req.userId!);
        if (!conversation) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' }});
            return;
        }
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'LOAD_ERROR', message: 'Failed to load conversation' }});
    }
});

/**
 * DELETE /api/v1/ai/conversations/:id
 * Delete a conversation.
 * Matches Project A logic: source 86
 */
router.delete('/conversations/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        await chatHistoryService.deleteConversation(req.params.id, req.userId!);
        res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: 'Failed to delete' }});
    }
});

export default router;