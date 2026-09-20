"""Dictionary-driven reference generator for Axiomancy's adaptive curriculum.

The production Cloudflare worker mirrors this dictionary in TypeScript because
the edge runtime cannot spawn Python. This executable parity reference creates
exactly one Grade 1-12 question at a time and is useful for curriculum QA.
"""

from __future__ import annotations

import argparse
import json
import random
import uuid
from typing import Any

Generated = dict[str, Any]
Template = dict[str, Any]


def grade_range(start: int, end: int) -> list[int]:
    return list(range(start, end + 1))


def math_addition(rng: random.Random, grade: int) -> Generated:
    ceiling = 10 + grade * 10
    a, b = rng.randint(1, ceiling), rng.randint(1, ceiling)
    return {"vars": {"a": a, "b": b}, "answer": a + b,
            "hint": f"Start at {a}, then count forward {b} steps."}


def math_multiplication(rng: random.Random, grade: int) -> Generated:
    groups, each = rng.randint(2, min(12, grade + 5)), rng.randint(2, 12)
    return {"vars": {"groups": groups, "each": each}, "answer": groups * each,
            "hint": f"Multiply the {groups} equal groups by {each}."}


def math_division(rng: random.Random, grade: int) -> Generated:
    groups, answer = rng.randint(2, min(12, grade + 3)), rng.randint(2, 14)
    return {"vars": {"total": groups * answer, "groups": groups}, "answer": answer,
            "hint": f"Divide the total by {groups}; multiply to check the quotient."}


def math_algebra(rng: random.Random, _grade: int) -> Generated:
    x, a, b = rng.randint(2, 15), rng.randint(2, 9), rng.randint(1, 20)
    return {"vars": {"a": a, "b": b, "c": a * x - b}, "answer": x,
            "hint": f"Add {b} to both sides, then divide by {a}."}


def physics_force_concept(_rng: random.Random, _grade: int) -> Generated:
    return {"vars": {}, "answer": "Force", "distractors": ["Mass", "Volume", "Circuit"],
            "hint": "It is an action that can change an object's motion."}


def physics_speed(rng: random.Random, _grade: int) -> Generated:
    speed, time = rng.randint(2, 18), rng.randint(2, 12)
    return {"vars": {"distance": speed * time, "time": time}, "answer": speed,
            "unit": " m/s", "hint": "Speed equals distance divided by time."}


def physics_newton(rng: random.Random, _grade: int) -> Generated:
    mass, acceleration = rng.randint(10, 50), rng.randint(2, 10)
    return {"vars": {"m": mass, "a": acceleration}, "answer": mass * acceleration,
            "unit": " N", "hint": "Apply Newton's second law F = ma."}


def chemistry_state(_rng: random.Random, _grade: int) -> Generated:
    return {"vars": {}, "answer": "Solid", "distractors": ["Liquid", "Gas", "Plasma"],
            "hint": "Its particles stay in fixed positions instead of flowing."}


def chemistry_atoms(rng: random.Random, _grade: int) -> Generated:
    molecules = rng.randint(2, 16)
    return {"vars": {"molecules": molecules}, "answer": molecules * 3,
            "hint": "Multiply the number of molecules by 3 atoms per molecule."}


def chemistry_concentration(rng: random.Random, _grade: int) -> Generated:
    solute, multiplier = rng.randint(10, 50), rng.choice([2, 4, 5, 10])
    return {"vars": {"solute": solute, "solution": solute * multiplier},
            "answer": 100 // multiplier, "unit": "%",
            "hint": "Use C% = solute mass ÷ solution mass × 100."}


def biology_heart(_rng: random.Random, _grade: int) -> Generated:
    return {"vars": {}, "answer": "Heart", "distractors": ["Lung", "Stomach", "Brain"],
            "hint": "You can feel this organ beating in your chest."}


def biology_cells(rng: random.Random, _grade: int) -> Generated:
    rounds = rng.randint(2, 6)
    return {"vars": {"rounds": rounds}, "answer": 2 ** rounds,
            "hint": f"Start with one cell and double the total {rounds} times."}


def biology_dna(rng: random.Random, _grade: int) -> Generated:
    adenine, guanine = rng.randint(100, 500), rng.randint(100, 500)
    return {"vars": {"A": adenine, "G": guanine}, "answer": 2 * adenine + 2 * guanine,
            "hint": "Because A pairs with T and G pairs with C, double A and G before adding."}


QUESTION_BANK: dict[str, list[Template]] = {
    "Mathematics": [
        {"id": "fragment-addition", "grades": grade_range(1, 3),
         "template": "Astrea found {a} Quantum Fragments, then collected {b} more. How many fragments does she have?",
         "generator": math_addition},
        {"id": "array-multiplication", "grades": grade_range(3, 6),
         "template": "Turing arranged {groups} rows of {each} runes. How many runes are there?",
         "generator": math_multiplication},
        {"id": "reverse-division", "grades": grade_range(4, 7),
         "template": "Lada divides {total} tokens equally among {groups} vaults. How many enter each vault?",
         "generator": math_division},
        {"id": "reverse-linear", "grades": grade_range(7, 12),
         "template": "Decode the spatial anomaly by finding x: {a}x - {b} = {c}",
         "generator": math_algebra},
    ],
    "Physics": [
        {"id": "push-pull", "grades": grade_range(1, 4),
         "template": "A push or pull is called a…", "generator": physics_force_concept},
        {"id": "clean-speed", "grades": grade_range(4, 7),
         "template": "A scout travels {distance} meters in {time} seconds. What is its speed?",
         "generator": physics_speed},
        {"id": "newton-force", "grades": grade_range(6, 12),
         "template": "A Vanguard mech with mass {m} kg accelerates at {a} m/s². What is its thrust force?",
         "generator": physics_newton},
    ],
    "Chemistry": [
        {"id": "states", "grades": grade_range(1, 3),
         "template": "Which state of matter keeps its own shape?", "generator": chemistry_state},
        {"id": "molecule-count", "grades": grade_range(3, 8),
         "template": "Each water molecule contains 3 atoms. How many atoms are in {molecules} molecules?",
         "generator": chemistry_atoms},
        {"id": "mass-concentration", "grades": grade_range(8, 12),
         "template": "Dissolving {solute} g of Quantum Salt yields {solution} g of solution. What is C%?",
         "generator": chemistry_concentration},
    ],
    "Biology": [
        {"id": "heart", "grades": grade_range(1, 4),
         "template": "Which organ pumps blood around the body?", "generator": biology_heart},
        {"id": "cell-doubling", "grades": grade_range(4, 9),
         "template": "One cell completes {rounds} rounds of mitosis. How many cells result?",
         "generator": biology_cells},
        {"id": "dna-nucleotides", "grades": grade_range(9, 12),
         "template": "A DNA segment has A = {A} and G = {G}. Find N = 2A + 2G.",
         "generator": biology_dna},
    ],
}


def make_options(generated: Generated, rng: random.Random) -> list[str]:
    answer, unit = generated["answer"], generated.get("unit", "")
    if isinstance(answer, str):
        options = [answer, *generated.get("distractors", [])]
    else:
        spread = max(1, round(abs(answer) * 0.12))
        values = [answer, answer + spread, max(0, answer - spread), answer + spread * 2]
        options = [f"{value}{unit}" for value in dict.fromkeys(values)]
    while len(options) < 4:
        options.append(f"Not {len(options) + 1}")
    rng.shuffle(options)
    return options[:4]


def fetch_axiomancy_question(subject: str, grade: int, seed: str | None = None) -> dict[str, Any]:
    """Filter a subject dictionary and return exactly one curriculum-matched question."""
    rng = random.Random(seed)
    valid_templates = [item for item in QUESTION_BANK.get(subject, []) if grade in item["grades"]]
    if not valid_templates:
        return {"error": f"No data available for {subject} at Grade {grade}.", "fallback": True}
    chosen = rng.choice(valid_templates)
    generated = chosen["generator"](rng, grade)
    unit = generated.get("unit", "")
    answer = f"{generated['answer']}{unit}"
    return {
        "id": f"python-{chosen['id']}-{uuid.uuid4().hex[:12]}",
        "subject": subject,
        "grade_level": grade,
        "question_text": chosen["template"].format(**generated["vars"]),
        "correct_answer": answer,
        "options": make_options(generated, rng),
        "hint": generated["hint"],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate one Axiomancy curriculum question.")
    parser.add_argument("subject", choices=QUESTION_BANK.keys(), nargs="?", default="Mathematics")
    parser.add_argument("grade", type=int, choices=range(1, 13), nargs="?", default=7)
    parser.add_argument("--seed", default=None)
    args = parser.parse_args()
    print(json.dumps(fetch_axiomancy_question(args.subject, args.grade, args.seed), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
