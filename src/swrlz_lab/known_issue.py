"""KNOWN TEST FIXTURE: handling an empty sequence deliberately fails."""


def average(values):
    """Calculate an average. Intentionally fails with ZeroDivisionError on []."""
    return sum(values) / len(values)
