# api-design

RESTful and MCP API endpoint creation following spec-driven development and clean architecture principles

## Components

### 1. FastAPI Route Templates

#### REST Endpoints
```typescript
// Standard CRUD route structure
router.post('/resource', createResource)      // 201 Created
router.get('/resource/:id', getResource)      // 200 OK
router.get('/resource', listResources)        // 200 OK
router.put('/resource/:id', updateResource)   // 200 OK
router.patch('/resource/:id', patchResource)  // 200 OK
router.delete('/resource/:id', deleteResource) // 204 No Content
```

#### MCP Tool Endpoints
```python
# MCP tool pattern
@app.post("/tools/{tool_name}")
async def execute_tool(
    tool_name: str,
    payload: ToolInput,
    auth: AuthDependency
) -> ToolResult:
    """Execute MCP tool with proper validation and error handling"""
    pass
```

### 2. Request/Response Schemas (Pydantic / SQLModel)

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

# Request schema
class CreateTaskRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: int = Field(default=0, ge=0, le=4)

    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

# Response schema
class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: int
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# List response with pagination
class TaskListResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    page: int
    page_size: int
```

### 3. HTTP Method & Status Code Conventions

```python
# Standard conventions
POST   /resources      → 201 Created (with Location header)
GET    /resources      → 200 OK
GET    /resources/:id  → 200 OK | 404 Not Found
PUT    /resources/:id  → 200 OK | 404 Not Found
PATCH  /resources/:id  → 200 OK | 404 Not Found
DELETE /resources/:id  → 204 No Content | 404 Not Found

# Special cases
POST   /auth/login     → 200 OK (existing resource)
POST   /auth/refresh   → 200 OK (token refresh)
GET    /health         → 200 OK | 503 Service Unavailable
```

### 4. Error Handling & Validation Patterns

```python
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError

# Custom error response
class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Error handler middleware
@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="ValidationError",
            message="Request validation failed",
            details=exc.errors()
        ).dict()
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.__class__.__name__,
            message=exc.detail
        ).dict()
    )

# Domain-specific exceptions
class ResourceNotFoundError(HTTPException):
    def __init__(self, resource: str, id: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with id {id} not found"
        )

class DuplicateResourceError(HTTPException):
    def __init__(self, resource: str, field: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{resource} with {field} already exists"
        )
```

## Usage Pattern

```python
from fastapi import APIRouter, Depends, status
from typing import List

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Creates a new task with the provided details"
)
async def create_task(
    task_data: CreateTaskRequest,
    user_id: int = Depends(get_current_user_id)
) -> TaskResponse:
    """
    Create a new task.

    - **title**: Task title (required, 1-200 chars)
    - **description**: Task description (optional, max 1000 chars)
    - **priority**: Priority level (0-4, default 0)
    """
    try:
        task = await task_service.create(user_id, task_data)
        return TaskResponse.from_orm(task)
    except DuplicateError:
        raise DuplicateResourceError("Task", "title")

@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get task by ID"
)
async def get_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id)
) -> TaskResponse:
    """Retrieve a specific task by ID"""
    task = await task_service.get(task_id, user_id)
    if not task:
        raise ResourceNotFoundError("Task", task_id)
    return TaskResponse.from_orm(task)
```

## Clean Architecture Principles

1. **Separation of Concerns**: Routes → Services → Repositories
2. **Dependency Injection**: Use FastAPI's Depends for auth, DB, services
3. **Single Responsibility**: Each endpoint does one thing well
4. **Validation at Boundary**: Pydantic models validate at API edge
5. **Standardized Responses**: Consistent response structure across all endpoints
6. **Error Taxonomy**: Well-defined error types and status codes
7. **Documentation**: OpenAPI auto-generation with detailed descriptions

## Checklist

- [ ] Route follows RESTful conventions
- [ ] Request/response schemas defined with Pydantic
- [ ] Proper HTTP status codes used
- [ ] Input validation with clear error messages
- [ ] Authentication/authorization applied where needed
- [ ] Error handling covers edge cases
- [ ] OpenAPI documentation complete
- [ ] Tests cover happy path and error cases
