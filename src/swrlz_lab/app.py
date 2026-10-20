"""Application entry point used for cross-file and change-impact analysis."""

from .scoring import total_score
from .formatting import describe_score


def build_summary(user, scores, include_bonus=False):
    """Calculate the score and return a friendly summary."""
    total = total_score(scores, include_bonus=include_bonus)
    return describe_score(user, total)


if __name__ == "__main__":
    print(build_summary("Dragon", [2, 3, 5], include_bonus=True))
