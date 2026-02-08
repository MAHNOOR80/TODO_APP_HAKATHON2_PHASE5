# Data Model: AI-Powered Todo Assistant

## AI Conversation Session
Represents a single conversational interaction with context and memory

- **sessionId**: string (maps to user authentication session)
- **userId**: string (authenticated user ID for authorization)
- **context**: object (current conversational context, including recent references)
- **createdAt**: timestamp
- **lastActiveAt**: timestamp
- **expiresAt**: timestamp

## User Intent
Represents the detected action the user wants to perform

- **type**: enum (CREATE_TASK | UPDATE_TASK | DELETE_TASK | SEARCH_TASKS | MARK_COMPLETE | MARK_INCOMPLETE | SET_PRIORITY | SET_DUE_DATE | SET_REMINDER | CREATE_RECURRING_TASK)
- **confidence**: number (0-1, indicating AI confidence in intent detection)
- **parameters**: object (extracted parameters relevant to the intent)

## Extracted Parameters
Specific data elements extracted from user input

- **taskTitle**: string (optional, for create/update operations)
- **taskDescription**: string (optional, for create/update operations)
- **taskId**: string (optional, for update/delete operations)
- **priority**: enum (HIGH | MEDIUM | LOW, optional)
- **dueDate**: string (ISO date format, optional)
- **category**: string (optional)
- **tags**: string[] (optional)
- **recurrencePattern**: enum (DAILY | WEEKLY | MONTHLY, optional)
- **reminderOffset**: number (minutes before due date, optional)

## AI Response
Structure for AI responses to user input

- **id**: string (unique response identifier)
- **sessionId**: string (session identifier)
- **userInput**: string (original user input)
- **detectedIntent**: User Intent object
- **actionPlan**: object (structured plan of actions to execute)
- **responseText**: string (natural language response to user)
- **requiresConfirmation**: boolean (if destructive action requires confirmation)
- **timestamp**: timestamp

## Task Operation
Represents a validated action to be performed on the task system

- **operation**: enum (CREATE | UPDATE | DELETE | SEARCH | MARK_COMPLETE | MARK_INCOMPLETE)
- **parameters**: object (validated parameters for the operation)
- **userId**: string (user authorization check)
- **status**: enum (PENDING | EXECUTED | FAILED | CONFIRMATION_REQUIRED)
- **result**: object (result of the operation if successful)