"""Entry point for the Todo CLI application.

This module serves as the application entry point when running `python -m src`.
It instantiates the TodoApp and starts the CLI loop.
"""

from .todo_app import TodoApp
from .cli import run_cli


def main() -> None:
    """Initialize and run the Todo CLI application."""
    app = TodoApp()
    run_cli(app)


if __name__ == "__main__":
    main()
