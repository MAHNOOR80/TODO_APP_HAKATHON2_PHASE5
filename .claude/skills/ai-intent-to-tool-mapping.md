# ai-intent-to-tool-mapping

Convert natural language intents into structured MCP tool calls using OpenAI Agents SDK

## Components

### 1. Intent Classification Rules

#### Intent Taxonomy
```typescript
enum TaskIntent {
  CREATE_TASK = 'create_task',
  LIST_TASKS = 'list_tasks',
  UPDATE_TASK = 'update_task',
  DELETE_TASK = 'delete_task',
  COMPLETE_TASK = 'complete_task',
  SEARCH_TASKS = 'search_tasks',
  ADD_TAG = 'add_tag',
  FILTER_TASKS = 'filter_tasks',
  GET_TASK_DETAILS = 'get_task_details',
  UNKNOWN = 'unknown'
}

interface IntentPattern {
  intent: TaskIntent;
  patterns: RegExp[];
  keywords: string[];
  requiredParams: string[];
  optionalParams: string[];
}
```

#### Classification Rules
```typescript
const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: TaskIntent.CREATE_TASK,
    patterns: [
      /^(add|create|new|make)\s+(a\s+)?(task|todo|item)/i,
      /^(remind me to|i need to|todo:)\s+/i,
      /^(task|todo):\s+/i,
    ],
    keywords: ['add', 'create', 'new', 'make', 'todo', 'remind'],
    requiredParams: ['title'],
    optionalParams: ['description', 'priority', 'dueDate', 'tags']
  },
  {
    intent: TaskIntent.LIST_TASKS,
    patterns: [
      /^(show|list|get|display|view)\s+(all\s+)?(my\s+)?(tasks|todos|items)/i,
      /^what('s|\s+are)\s+(my\s+)?(tasks|todos)/i,
      /^(tasks|todos)(\s+list)?$/i,
    ],
    keywords: ['show', 'list', 'display', 'view', 'what', 'tasks'],
    requiredParams: [],
    optionalParams: ['status', 'priority', 'tags', 'limit']
  },
  {
    intent: TaskIntent.COMPLETE_TASK,
    patterns: [
      /^(complete|done|finish|mark\s+as\s+done)\s+/i,
      /^(check|tick)\s+(off\s+)?task/i,
    ],
    keywords: ['complete', 'done', 'finish', 'mark', 'check'],
    requiredParams: ['taskId'],
    optionalParams: []
  },
  {
    intent: TaskIntent.DELETE_TASK,
    patterns: [
      /^(delete|remove|cancel)\s+(task|todo|item)/i,
      /^(get rid of|trash)\s+/i,
    ],
    keywords: ['delete', 'remove', 'cancel', 'trash'],
    requiredParams: ['taskId'],
    optionalParams: []
  },
  {
    intent: TaskIntent.UPDATE_TASK,
    patterns: [
      /^(update|edit|change|modify)\s+(task|todo)/i,
      /^(rename|set|change)\s+/i,
    ],
    keywords: ['update', 'edit', 'change', 'modify', 'rename', 'set'],
    requiredParams: ['taskId'],
    optionalParams: ['title', 'description', 'priority', 'dueDate']
  },
  {
    intent: TaskIntent.SEARCH_TASKS,
    patterns: [
      /^(search|find|look for)\s+(tasks?|todos?)/i,
      /^(where is|find me)\s+/i,
    ],
    keywords: ['search', 'find', 'look', 'where'],
    requiredParams: ['query'],
    optionalParams: ['tags', 'status']
  },
  {
    intent: TaskIntent.FILTER_TASKS,
    patterns: [
      /^(filter|show\s+only|just)\s+(high|medium|low)\s+priority/i,
      /^(completed|pending|active)\s+tasks/i,
      /^tasks?\s+(with|tagged)/i,
    ],
    keywords: ['filter', 'priority', 'tagged', 'completed', 'pending'],
    requiredParams: [],
    optionalParams: ['status', 'priority', 'tags']
  },
];

// Intent classifier
function classifyIntent(input: string): TaskIntent {
  const normalized = input.toLowerCase().trim();

  // Exact pattern matching
  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return intent;
      }
    }
  }

  // Keyword scoring
  let maxScore = 0;
  let bestIntent = TaskIntent.UNKNOWN;

  for (const { intent, keywords } of INTENT_PATTERNS) {
    const score = keywords.filter(kw => normalized.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  }

  return maxScore > 0 ? bestIntent : TaskIntent.UNKNOWN;
}
```

### 2. Parameter Extraction Logic

#### Entity Extraction
```typescript
interface ExtractedParams {
  [key: string]: any;
}

class ParameterExtractor {
  // Extract task ID from various formats
  extractTaskId(input: string): number | null {
    // Match "#123", "task 123", "id 123", "123"
    const patterns = [
      /#(\d+)/,
      /task\s+(\d+)/i,
      /id\s*[:=]?\s*(\d+)/i,
      /\b(\d+)\b/  // Fallback: any number
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return null;
  }

  // Extract priority from text
  extractPriority(input: string): number | null {
    const priorityMap: Record<string, number> = {
      'critical': 4,
      'urgent': 4,
      'high': 3,
      'medium': 2,
      'normal': 2,
      'low': 1,
      'minor': 1,
    };

    const normalized = input.toLowerCase();
    for (const [keyword, value] of Object.entries(priorityMap)) {
      if (normalized.includes(keyword)) {
        return value;
      }
    }

    // Check for numeric priority (0-4)
    const match = input.match(/priority\s*[:=]?\s*([0-4])/i);
    return match ? parseInt(match[1], 10) : null;
  }

  // Extract due date from natural language
  extractDueDate(input: string): Date | null {
    const today = new Date();
    const normalized = input.toLowerCase();

    // Relative dates
    if (normalized.includes('today')) {
      return today;
    }
    if (normalized.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    if (normalized.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }

    // Specific day of week
    const dayMatch = normalized.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
    if (dayMatch) {
      return this.getNextDayOfWeek(dayMatch[1]);
    }

    // ISO format or common date formats
    const datePatterns = [
      /\b(\d{4}-\d{2}-\d{2})\b/,  // YYYY-MM-DD
      /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/,  // MM/DD/YYYY
    ];

    for (const pattern of datePatterns) {
      const match = input.match(pattern);
      if (match) {
        return new Date(match[0]);
      }
    }

    return null;
  }

  // Extract tags from #hashtags or @mentions
  extractTags(input: string): string[] {
    const hashTags = input.match(/#(\w+)/g)?.map(tag => tag.slice(1)) || [];
    const atTags = input.match(/@(\w+)/g)?.map(tag => tag.slice(1)) || [];
    return [...new Set([...hashTags, ...atTags])];
  }

  // Extract title (main content after intent)
  extractTitle(input: string, intent: TaskIntent): string | null {
    const normalized = input.trim();

    // Remove intent prefix
    const prefixes = [
      /^(add|create|new|make)\s+(a\s+)?(task|todo|item):?\s*/i,
      /^(remind me to|i need to|todo):?\s*/i,
      /^(task|todo):?\s*/i,
    ];

    let cleaned = normalized;
    for (const prefix of prefixes) {
      cleaned = cleaned.replace(prefix, '');
    }

    // Remove trailing tags and metadata
    cleaned = cleaned.replace(/\s+(#\w+|@\w+|priority\s*[:=]?\s*\w+|due\s*[:=]?\s*\S+)\s*$/gi, '').trim();

    return cleaned.length > 0 ? cleaned : null;
  }

  // Comprehensive extraction for given intent
  extract(input: string, intent: TaskIntent): ExtractedParams {
    const params: ExtractedParams = {};

    switch (intent) {
      case TaskIntent.CREATE_TASK:
        params.title = this.extractTitle(input, intent);
        params.priority = this.extractPriority(input);
        params.dueDate = this.extractDueDate(input);
        params.tags = this.extractTags(input);
        break;

      case TaskIntent.UPDATE_TASK:
      case TaskIntent.COMPLETE_TASK:
      case TaskIntent.DELETE_TASK:
      case TaskIntent.GET_TASK_DETAILS:
        params.taskId = this.extractTaskId(input);
        if (intent === TaskIntent.UPDATE_TASK) {
          params.title = this.extractTitle(input, intent);
          params.priority = this.extractPriority(input);
          params.dueDate = this.extractDueDate(input);
        }
        break;

      case TaskIntent.SEARCH_TASKS:
        // Remove "search" prefix to get query
        params.query = input.replace(/^(search|find|look for)\s+(tasks?|todos?)?\s*/i, '').trim();
        params.tags = this.extractTags(input);
        break;

      case TaskIntent.FILTER_TASKS:
      case TaskIntent.LIST_TASKS:
        params.priority = this.extractPriority(input);
        params.tags = this.extractTags(input);
        // Extract status
        if (/completed|done/i.test(input)) params.status = 'completed';
        if (/pending|active|incomplete/i.test(input)) params.status = 'pending';
        break;
    }

    // Remove null/undefined values
    return Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && (Array.isArray(v) ? v.length > 0 : true))
    );
  }

  private getNextDayOfWeek(day: string): Date {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(day.toLowerCase());
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
    const result = new Date(today);
    result.setDate(result.getDate() + daysUntilTarget);
    return result;
  }
}
```

### 3. MCP Tool Invocation Templates

#### Tool Definition
```typescript
interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

const TASK_TOOLS: MCPTool[] = [
  {
    name: 'create_task',
    description: 'Create a new task with title, optional description, priority, due date, and tags',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Optional task description' },
        priority: { type: 'number', minimum: 0, maximum: 4, description: 'Priority (0-4)' },
        dueDate: { type: 'string', format: 'date-time', description: 'Due date in ISO format' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Task tags' }
      },
      required: ['title']
    }
  },
  {
    name: 'list_tasks',
    description: 'List tasks with optional filtering by status, priority, and tags',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['all', 'completed', 'pending'] },
        priority: { type: 'number', minimum: 0, maximum: 4 },
        tags: { type: 'array', items: { type: 'string' } },
        limit: { type: 'number', default: 50 }
      },
      required: []
    }
  },
  {
    name: 'update_task',
    description: 'Update an existing task by ID',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'number', description: 'Task ID' },
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'number', minimum: 0, maximum: 4 },
        dueDate: { type: 'string', format: 'date-time' },
        completed: { type: 'boolean' }
      },
      required: ['taskId']
    }
  },
  {
    name: 'delete_task',
    description: 'Delete a task by ID',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'number', description: 'Task ID to delete' }
      },
      required: ['taskId']
    }
  },
];
```

#### OpenAI Agents SDK Integration
```typescript
import { Agent } from '@openai/agents-sdk';

class TaskAgent {
  private agent: Agent;
  private extractor: ParameterExtractor;

  constructor(apiKey: string) {
    this.extractor = new ParameterExtractor();

    this.agent = new Agent({
      name: 'TaskManager',
      instructions: `You are a task management assistant. Convert user requests into tool calls.

        When users describe tasks naturally, extract:
        - Task title from the main content
        - Priority from keywords (critical/urgent=4, high=3, medium=2, low=1)
        - Due dates from phrases like "today", "tomorrow", "next Monday"
        - Tags from #hashtags

        Always confirm ambiguous requests before taking action.`,
      tools: TASK_TOOLS,
      model: 'gpt-4-turbo',
    });
  }

  async processUserInput(userId: number, input: string): Promise<any> {
    // Step 1: Classify intent
    const intent = classifyIntent(input);

    if (intent === TaskIntent.UNKNOWN) {
      return {
        type: 'clarification_needed',
        message: "I'm not sure what you want to do. Could you rephrase that?",
        suggestions: [
          'Create a new task',
          'List my tasks',
          'Mark a task as done',
          'Delete a task'
        ]
      };
    }

    // Step 2: Extract parameters
    const params = this.extractor.extract(input, intent);

    // Step 3: Validate required parameters
    const intentPattern = INTENT_PATTERNS.find(p => p.intent === intent);
    const missingParams = intentPattern?.requiredParams.filter(p => !(p in params)) || [];

    if (missingParams.length > 0) {
      return {
        type: 'missing_parameters',
        intent,
        missing: missingParams,
        message: `To ${intent.replace('_', ' ')}, I need: ${missingParams.join(', ')}`,
        extractedParams: params
      };
    }

    // Step 4: Map to MCP tool
    const toolCall = this.mapIntentToTool(intent, params, userId);

    // Step 5: Execute via OpenAI Agent
    return await this.agent.run({
      messages: [{ role: 'user', content: input }],
      toolChoice: { type: 'function', function: { name: toolCall.name } },
      toolArguments: toolCall.arguments
    });
  }

  private mapIntentToTool(
    intent: TaskIntent,
    params: ExtractedParams,
    userId: number
  ): { name: string; arguments: any } {
    // Add user context to all tool calls
    const baseParams = { userId, ...params };

    switch (intent) {
      case TaskIntent.CREATE_TASK:
        return {
          name: 'create_task',
          arguments: {
            ...baseParams,
            // Convert Date to ISO string
            dueDate: params.dueDate?.toISOString(),
          }
        };

      case TaskIntent.LIST_TASKS:
        return {
          name: 'list_tasks',
          arguments: {
            ...baseParams,
            status: params.status || 'all',
            limit: params.limit || 50
          }
        };

      case TaskIntent.UPDATE_TASK:
        return {
          name: 'update_task',
          arguments: {
            ...baseParams,
            dueDate: params.dueDate?.toISOString(),
          }
        };

      case TaskIntent.COMPLETE_TASK:
        return {
          name: 'update_task',
          arguments: {
            ...baseParams,
            completed: true
          }
        };

      case TaskIntent.DELETE_TASK:
        return {
          name: 'delete_task',
          arguments: baseParams
        };

      default:
        throw new Error(`Unsupported intent: ${intent}`);
    }
  }
}
```

### 4. Tool Chaining & Fallback Handling

#### Multi-Step Workflows
```typescript
interface WorkflowStep {
  tool: string;
  params: any;
  onSuccess?: (result: any) => WorkflowStep | null;
  onError?: (error: any) => WorkflowStep | null;
}

class WorkflowExecutor {
  async executeChain(steps: WorkflowStep[], context: any): Promise<any> {
    let currentStep = 0;
    let results: any[] = [];

    while (currentStep < steps.length) {
      const step = steps[currentStep];

      try {
        // Execute tool
        const result = await this.executeTool(step.tool, step.params, context);
        results.push(result);

        // Check for next step
        if (step.onSuccess) {
          const nextStep = step.onSuccess(result);
          if (nextStep) {
            steps.push(nextStep);
          }
        }

        currentStep++;
      } catch (error) {
        // Handle error
        if (step.onError) {
          const fallbackStep = step.onError(error);
          if (fallbackStep) {
            steps[currentStep] = fallbackStep;
            continue;
          }
        }
        throw error;
      }
    }

    return results;
  }

  private async executeTool(name: string, params: any, context: any): Promise<any> {
    // Call actual MCP tool implementation
    // This would integrate with your backend API
    const response = await fetch(`/api/tools/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.token}`
      },
      body: JSON.stringify({ ...params, userId: context.userId })
    });

    if (!response.ok) {
      throw new Error(`Tool ${name} failed: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Example: Create task with tags (requires creating tags first)
const createTaskWithNewTags = async (input: string, userId: number) => {
  const extractor = new ParameterExtractor();
  const params = extractor.extract(input, TaskIntent.CREATE_TASK);

  const workflow: WorkflowStep[] = [];

  // Step 1: Create missing tags
  if (params.tags && params.tags.length > 0) {
    workflow.push({
      tool: 'create_tags',
      params: { tags: params.tags, userId },
      onSuccess: (tagResult) => ({
        tool: 'create_task',
        params: {
          ...params,
          tagIds: tagResult.map((t: any) => t.id),
          userId
        },
        onError: () => ({
          // Fallback: create without tags
          tool: 'create_task',
          params: { ...params, tags: [], userId }
        })
      })
    });
  } else {
    // Step 1: Just create task
    workflow.push({
      tool: 'create_task',
      params: { ...params, userId }
    });
  }

  const executor = new WorkflowExecutor();
  return await executor.executeChain(workflow, { userId, token: 'user-token' });
};
```

#### Fallback Strategies
```typescript
class IntentHandler {
  async handleWithFallback(input: string, userId: number): Promise<any> {
    try {
      // Primary: AI-based intent classification
      const intent = classifyIntent(input);
      const params = new ParameterExtractor().extract(input, intent);
      return await this.executeTool(intent, params, userId);

    } catch (error) {
      console.error('Primary handler failed:', error);

      // Fallback 1: Keyword-based simple matching
      try {
        return await this.keywordFallback(input, userId);
      } catch (fallbackError) {
        console.error('Keyword fallback failed:', fallbackError);

        // Fallback 2: Ask for clarification
        return {
          type: 'error',
          message: 'I encountered an error processing your request. Could you try rephrasing?',
          original: input,
          suggestions: this.generateSuggestions(input)
        };
      }
    }
  }

  private async keywordFallback(input: string, userId: number): Promise<any> {
    const lower = input.toLowerCase();

    if (lower.includes('add') || lower.includes('create')) {
      return { action: 'show_create_form' };
    }
    if (lower.includes('list') || lower.includes('show')) {
      return { action: 'show_task_list' };
    }
    // ... more simple patterns

    throw new Error('No fallback match');
  }

  private generateSuggestions(input: string): string[] {
    // Generate helpful suggestions based on partial matches
    const suggestions: string[] = [];

    if (/task/i.test(input)) {
      suggestions.push('Create a new task: "Add task: [title]"');
      suggestions.push('List tasks: "Show my tasks"');
    }

    return suggestions.length > 0 ? suggestions : [
      'Create a task',
      'List my tasks',
      'Mark task as done'
    ];
  }

  private async executeTool(intent: TaskIntent, params: any, userId: number): Promise<any> {
    // Implementation
    return {};
  }
}
```

## Usage Examples

```typescript
// Example 1: Simple task creation
const input1 = "Add task: Review PR #high #urgent";
const result1 = await agent.processUserInput(userId, input1);
// → create_task({ title: "Review PR", priority: 3, tags: ["high", "urgent"] })

// Example 2: Task with due date
const input2 = "Remind me to buy groceries tomorrow";
const result2 = await agent.processUserInput(userId, input2);
// → create_task({ title: "buy groceries", dueDate: "2025-12-31T00:00:00Z" })

// Example 3: Complete task
const input3 = "Mark task #42 as done";
const result3 = await agent.processUserInput(userId, input3);
// → update_task({ taskId: 42, completed: true })

// Example 4: Filter tasks
const input4 = "Show high priority pending tasks";
const result4 = await agent.processUserInput(userId, input4);
// → list_tasks({ priority: 3, status: "pending" })

// Example 5: Ambiguous input (triggers clarification)
const input5 = "Something about tasks";
const result5 = await agent.processUserInput(userId, input5);
// → { type: 'clarification_needed', message: "...", suggestions: [...] }
```

## Best Practices

✅ Always validate extracted parameters before tool invocation
✅ Provide clear error messages with actionable suggestions
✅ Use intent confidence scores to trigger clarifications
✅ Log all intent classifications for improving patterns
✅ Implement graceful degradation with multiple fallback levels
✅ Cache frequent patterns to reduce OpenAI API calls
✅ Test edge cases: ambiguous, incomplete, malformed inputs
✅ Preserve user context across multi-turn conversations

## Anti-Patterns to Avoid

❌ Assuming intent without confidence threshold
❌ Executing destructive actions (delete) without confirmation
❌ Ignoring user context (timezone, preferences)
❌ Hardcoding intent patterns (use configuration)
❌ Missing validation on extracted parameters
❌ No fallback for failed tool calls
❌ Exposing raw errors to users
❌ Not handling concurrent/conflicting tool calls
