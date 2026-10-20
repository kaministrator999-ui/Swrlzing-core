"""Pure score calculations; dependencies must resolve to constants.py."""

from .constants import BONUS_POINTS


def total_score(scores, include_bonus=False):
    """Return a deterministic total without mutating the input."""
    points = sum(scores)
    return points + BONUS_POINTS if include_bonus else points
