"""Offline tests; unrelated to owner-approved GitHub write operations."""
import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from swrlz_lab.app import build_summary
from swrlz_lab.known_issue import average
from swrlz_lab.scoring import total_score


class TestExampleLab(unittest.TestCase):
    def test_score_and_bonus(self):
        self.assertEqual(total_score([2, 3, 5]), 10)
        self.assertEqual(total_score([2, 3, 5], include_bonus=True), 14)

    def test_end_to_end_context(self):
        self.assertEqual(build_summary("Dragon", [2, 3]), "Swyrlz Testbed: Dragon has 5 points")

    def test_known_bug_documented_not_hidden(self):
        self.assertEqual(average([2, 4]), 3)
        with self.assertRaises(ZeroDivisionError):
            average([])


if __name__ == "__main__":
    unittest.main()
