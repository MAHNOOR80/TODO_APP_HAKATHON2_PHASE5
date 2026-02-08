# database-modeling

Design and evolve database schemas using SQLModel and Neon PostgreSQL with migrations

## Components

### 1. SQLModel Entity Definitions

#### Base Model Pattern
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
from enum import Enum

class TimestampMixin(SQLModel):
    """Mixin for created_at/updated_at timestamps"""
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class BaseEntity(SQLModel, TimestampMixin):
    """Base class for all entities"""
    id: Optional[int] = Field(default=None, primary_key=True)

    class Config:
        arbitrary_types_allowed = True
```

#### Entity Definition Example
```python
from sqlmodel import SQLModel, Field, Relationship, Column, String, Index
from typing import Optional, List

class User(BaseEntity, table=True):
    """User entity with authentication"""
    __tablename__ = "users"

    email: str = Field(
        sa_column=Column(String(255), unique=True, nullable=False, index=True)
    )
    username: str = Field(
        sa_column=Column(String(100), unique=True, nullable=False, index=True)
    )
    password_hash: str = Field(max_length=255)
    is_active: bool = Field(default=True)

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="user", cascade_delete=True)

    __table_args__ = (
        Index('idx_user_email_active', 'email', 'is_active'),
    )

class Task(BaseEntity, table=True):
    """Task entity with user scoping"""
    __tablename__ = "tasks"

    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: int = Field(default=0, ge=0, le=4)
    due_date: Optional[datetime] = Field(default=None)

    # Foreign key for user-scoped data
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)

    # Relationships
    user: User = Relationship(back_populates="tasks")
    tags: List["TaskTag"] = Relationship(back_populates="task", cascade_delete=True)

    __table_args__ = (
        Index('idx_task_user_completed', 'user_id', 'completed'),
        Index('idx_task_user_priority', 'user_id', 'priority'),
        Index('idx_task_due_date', 'due_date'),
    )

class Tag(BaseEntity, table=True):
    """Tag entity"""
    __tablename__ = "tags"

    name: str = Field(sa_column=Column(String(50), unique=True, nullable=False))
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)

    # Relationships
    user: User = Relationship()
    tasks: List["TaskTag"] = Relationship(back_populates="tag", cascade_delete=True)

    __table_args__ = (
        Index('idx_tag_user_name', 'user_id', 'name', unique=True),
    )

class TaskTag(SQLModel, table=True):
    """Many-to-many relationship between tasks and tags"""
    __tablename__ = "task_tags"

    task_id: int = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)

    # Relationships
    task: Task = Relationship(back_populates="tags")
    tag: Tag = Relationship(back_populates="tasks")

    __table_args__ = (
        Index('idx_task_tags_task', 'task_id'),
        Index('idx_task_tags_tag', 'tag_id'),
    )
```

### 2. User-Scoped Data Isolation Patterns

#### Repository Pattern with User Scoping
```python
from sqlmodel import Session, select
from typing import Optional, List

class BaseRepository:
    """Base repository with user-scoped queries"""

    def __init__(self, session: Session):
        self.session = session

    def _apply_user_scope(self, stmt, user_id: int, model):
        """Apply user_id filter to statement"""
        return stmt.where(model.user_id == user_id)

class TaskRepository(BaseRepository):
    """Task repository with automatic user scoping"""

    async def create(self, task: Task, user_id: int) -> Task:
        """Create task scoped to user"""
        task.user_id = user_id
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def get(self, task_id: int, user_id: int) -> Optional[Task]:
        """Get task only if owned by user"""
        stmt = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list(
        self,
        user_id: int,
        completed: Optional[bool] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Task]:
        """List tasks scoped to user with filters"""
        stmt = select(Task).where(Task.user_id == user_id)

        if completed is not None:
            stmt = stmt.where(Task.completed == completed)

        stmt = stmt.order_by(Task.created_at.desc()).limit(limit).offset(offset)

        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def delete(self, task_id: int, user_id: int) -> bool:
        """Delete task only if owned by user"""
        task = await self.get(task_id, user_id)
        if not task:
            return False

        await self.session.delete(task)
        await self.session.commit()
        return True
```

#### Service Layer with User Context
```python
from typing import Optional, List

class TaskService:
    """Service layer enforcing user-scoped access"""

    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def create_task(self, user_id: int, task_data: dict) -> Task:
        """Create task - user_id injected from auth"""
        task = Task(**task_data)
        return await self.repository.create(task, user_id)

    async def get_user_tasks(
        self,
        user_id: int,
        filters: Optional[dict] = None
    ) -> List[Task]:
        """Get tasks - automatically scoped to user"""
        return await self.repository.list(user_id, **(filters or {}))
```

### 3. Indexing & Performance Strategies

#### Index Design Patterns
```python
# Single-column indexes for foreign keys
user_id: int = Field(foreign_key="users.id", index=True)

# Composite indexes for common query patterns
__table_args__ = (
    # User + status queries (WHERE user_id = ? AND completed = ?)
    Index('idx_task_user_completed', 'user_id', 'completed'),

    # User + priority sorting (WHERE user_id = ? ORDER BY priority)
    Index('idx_task_user_priority', 'user_id', 'priority'),

    # Date range queries (WHERE due_date BETWEEN ? AND ?)
    Index('idx_task_due_date', 'due_date'),

    # Unique constraints
    Index('idx_tag_user_name', 'user_id', 'name', unique=True),

    # Partial indexes (PostgreSQL)
    Index('idx_active_tasks', 'user_id', 'due_date',
          postgresql_where=text('completed = false')),
)
```

#### Query Optimization Patterns
```python
from sqlmodel import select, func
from sqlalchemy.orm import selectinload

# Eager loading to prevent N+1 queries
async def get_tasks_with_tags(user_id: int) -> List[Task]:
    stmt = (
        select(Task)
        .where(Task.user_id == user_id)
        .options(selectinload(Task.tags))
    )
    result = await session.execute(stmt)
    return result.scalars().all()

# Efficient counting
async def count_user_tasks(user_id: int) -> int:
    stmt = select(func.count(Task.id)).where(Task.user_id == user_id)
    result = await session.execute(stmt)
    return result.scalar_one()

# Batch operations
async def bulk_update_status(task_ids: List[int], user_id: int, completed: bool):
    stmt = (
        update(Task)
        .where(Task.id.in_(task_ids), Task.user_id == user_id)
        .values(completed=completed, updated_at=datetime.utcnow())
    )
    await session.execute(stmt)
    await session.commit()
```

### 4. Migration & Schema Evolution Templates

#### Alembic Migration Setup
```python
# alembic/env.py
from sqlmodel import SQLModel
from app.models import *  # Import all models

target_metadata = SQLModel.metadata

def run_migrations_online():
    """Run migrations in 'online' mode"""
    connectable = create_engine(settings.database_url)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()
```

#### Migration Template: Add Column
```python
"""add_task_priority

Revision ID: abc123
Revises: def456
Create Date: 2025-01-15 10:30:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'abc123'
down_revision = 'def456'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add column with default
    op.add_column('tasks',
        sa.Column('priority', sa.Integer(), nullable=False, server_default='0')
    )

    # Add index
    op.create_index(
        'idx_task_user_priority',
        'tasks',
        ['user_id', 'priority']
    )

def downgrade() -> None:
    # Remove index first
    op.drop_index('idx_task_user_priority', table_name='tasks')

    # Remove column
    op.drop_column('tasks', 'priority')
```

#### Migration Template: Add Table
```python
"""create_tags_table

Revision ID: xyz789
Revises: abc123
Create Date: 2025-01-16 14:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'xyz789'
down_revision = 'abc123'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )

    # Create indexes
    op.create_index('idx_tag_user_name', 'tags', ['user_id', 'name'], unique=True)

    # Create junction table
    op.create_table(
        'task_tags',
        sa.Column('task_id', sa.Integer(), primary_key=True),
        sa.Column('tag_id', sa.Integer(), primary_key=True),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
    )

    op.create_index('idx_task_tags_task', 'task_tags', ['task_id'])
    op.create_index('idx_task_tags_tag', 'task_tags', ['tag_id'])

def downgrade() -> None:
    op.drop_table('task_tags')
    op.drop_table('tags')
```

#### Data Migration Pattern
```python
"""migrate_task_priorities

Revision ID: mig001
Revises: xyz789
Create Date: 2025-01-17 09:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column

revision = 'mig001'
down_revision = 'xyz789'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Define table structure for data migration
    tasks = table('tasks',
        column('id', sa.Integer),
        column('old_priority', sa.String),
        column('priority', sa.Integer)
    )

    # Migrate data: convert string priorities to integers
    op.execute(
        tasks.update()
        .where(tasks.c.old_priority == 'high')
        .values(priority=3)
    )
    op.execute(
        tasks.update()
        .where(tasks.c.old_priority == 'medium')
        .values(priority=2)
    )
    op.execute(
        tasks.update()
        .where(tasks.c.old_priority == 'low')
        .values(priority=1)
    )

    # Drop old column
    op.drop_column('tasks', 'old_priority')

def downgrade() -> None:
    # Add old column back
    op.add_column('tasks',
        sa.Column('old_priority', sa.String(20))
    )

    # Reverse migration
    tasks = table('tasks',
        column('id', sa.Integer),
        column('old_priority', sa.String),
        column('priority', sa.Integer)
    )

    op.execute(
        tasks.update()
        .where(tasks.c.priority >= 3)
        .values(old_priority='high')
    )
    # ... etc
```

## Neon PostgreSQL Specific Patterns

### Connection Pooling
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://user:pass@neon.tech/dbname?sslmode=require"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,   # Recycle connections after 1 hour
)

async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)
```

### Branching for Development
```bash
# Neon allows database branching
# Use branch-specific connection strings for dev/test

# Production
DATABASE_URL=postgresql://prod@neon.tech/main

# Development branch
DATABASE_URL=postgresql://dev@neon.tech/dev-branch

# Preview branch (for PRs)
DATABASE_URL=postgresql://preview@neon.tech/pr-123
```

## Best Practices Checklist

- [ ] All entities extend BaseEntity with timestamps
- [ ] User-scoped entities have `user_id` foreign key with index
- [ ] Relationships defined with proper cascade behavior
- [ ] Composite indexes created for common query patterns
- [ ] Unique constraints enforced at database level
- [ ] Migration files include both upgrade and downgrade
- [ ] Data migrations preserve existing data
- [ ] Connection pooling configured appropriately
- [ ] SSL mode required for Neon connections
- [ ] Repository pattern enforces user-scoped access
- [ ] Service layer validates business rules before DB operations

## Anti-Patterns to Avoid

❌ Missing user_id in queries (data leakage risk)
❌ N+1 queries without eager loading
❌ Creating indexes without query analysis
❌ Hardcoding connection strings
❌ Exposing raw SQLModel entities in API responses
❌ Missing cascade delete on dependent entities
❌ Skipping migration down() implementation
❌ Using synchronous database operations in async code
