"""Rendering for the small public test application."""

from .constants import APP_LABEL


def describe_score(name, score):
    """Keep UI formatting separate from arithmetic."""
    return f"{APP_LABEL}: {name} has {score} points"
