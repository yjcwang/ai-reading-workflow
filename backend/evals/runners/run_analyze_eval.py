import argparse
import json
import sys
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DEFAULT_API_URL = "http://127.0.0.1:8000/api/analyze"
DEFAULT_DATASET = Path(__file__).resolve().parents[1] / "datasets" / "n2_eval_dataset.json"
GRAMMAR_PREFIXES = (chr(0xFF5E), chr(0x301C), "~")


def load_dataset(dataset_path: Path) -> list[dict[str, Any]]:
    """Load evaluation cases from a JSON dataset file."""
    with dataset_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("Dataset must be a JSON array.")

    return data


def post_analyze(api_url: str, text: str, level: str, target_lang: str, timeout: float) -> dict[str, Any]:
    """Call the real analyze API and return the decoded JSON response."""
    payload = json.dumps(
        {
            "text": text,
            "level": level,
            "target_lang": target_lang,
        }
    ).encode("utf-8")
    request = Request(
        api_url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def normalize_grammar_expression(expression: str) -> str:
    """Normalize presentation-only grammar markers before comparison."""
    normalized = expression.strip()
    while normalized.startswith(GRAMMAR_PREFIXES):
        normalized = normalized[1:].strip()
    return normalized


def unique_sorted(items: list[str]) -> list[str]:
    return sorted({item.strip() for item in items if item and item.strip()})


def normalize_expressions(items: list[str]) -> list[str]:
    return unique_sorted([normalize_grammar_expression(item) for item in items])


def extract_grammar_expressions(response: dict[str, Any]) -> list[str]:
    grammar_items = response.get("grammar", [])
    if not isinstance(grammar_items, list):
        return []

    expressions = []
    for item in grammar_items:
        if isinstance(item, dict) and isinstance(item.get("expression"), str):
            expressions.append(item["expression"])
    return unique_sorted(expressions)


def calculate_metrics(expected: list[str], actual: list[str]) -> dict[str, float | int]:
    expected_set = set(expected)
    actual_set = set(actual)
    matched = len(expected_set & actual_set)
    precision = matched / len(actual_set) if actual_set else 0.0
    recall = matched / len(expected_set) if expected_set else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0

    return {
        "matched": matched,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }


def evaluate_case(case: dict[str, Any], api_url: str, target_lang: str, timeout: float) -> dict[str, Any]:
    expected_raw = unique_sorted(case.get("expected_grammar", []))
    expected_normalized = normalize_expressions(expected_raw)
    response = post_analyze(
        api_url=api_url,
        text=case["text"],
        level=case.get("level", "N2"),
        target_lang=target_lang,
        timeout=timeout,
    )
    actual_raw = extract_grammar_expressions(response)
    actual_normalized = normalize_expressions(actual_raw)
    metrics = calculate_metrics(expected_normalized, actual_normalized)

    return {
        "id": case["id"],
        "expected_grammar": expected_raw,
        "actual_grammar": actual_raw,
        "expected_normalized": expected_normalized,
        "actual_normalized": actual_normalized,
        "match": expected_normalized == actual_normalized,
        "missing": sorted(set(expected_normalized) - set(actual_normalized)),
        "extra": sorted(set(actual_normalized) - set(expected_normalized)),
        **metrics,
    }


def print_result(result: dict[str, Any]) -> None:
    status = "PASS" if result["match"] else "FAIL"
    print(f"\n[{status}] {result['id']}")
    print(f"  expected grammar: {result['expected_grammar']}")
    print(f"  actual grammar:   {result['actual_grammar']}")
    print(f"  expected norm:    {result['expected_normalized']}")
    print(f"  actual norm:      {result['actual_normalized']}")
    print(f"  missing:          {result['missing']}")
    print(f"  extra:            {result['extra']}")
    print(
        "  metrics:          "
        f"matched={result['matched']}, "
        f"precision={result['precision']:.2f}, "
        f"recall={result['recall']:.2f}, "
        f"f1={result['f1']:.2f}"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the minimal analyze API grammar evaluation.")
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--api-url", default=DEFAULT_API_URL)
    parser.add_argument("--target-lang", default="en")
    parser.add_argument("--timeout", type=float, default=60.0)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    cases = load_dataset(args.dataset)
    results = []

    for case in cases:
        try:
            result = evaluate_case(case, args.api_url, args.target_lang, args.timeout)
        except (HTTPError, URLError, TimeoutError, KeyError, json.JSONDecodeError, ValueError) as exc:
            result = {
                "id": case.get("id", "<unknown>"),
                "expected_grammar": unique_sorted(case.get("expected_grammar", [])),
                "actual_grammar": [],
                "expected_normalized": normalize_expressions(case.get("expected_grammar", [])),
                "actual_normalized": [],
                "match": False,
                "missing": normalize_expressions(case.get("expected_grammar", [])),
                "extra": [],
                "matched": 0,
                "precision": 0.0,
                "recall": 0.0,
                "f1": 0.0,
            }
            print_result(result)
            print(f"  error:            {exc}")
            results.append(result)
            continue

        print_result(result)
        results.append(result)

    print("\nSummary")
    if results:
        avg_precision = sum(result["precision"] for result in results) / len(results)
        avg_recall = sum(result["recall"] for result in results) / len(results)
        avg_f1 = sum(result["f1"] for result in results) / len(results)
        print(f"Average precision: {avg_precision:.2f}")
        print(f"Average recall:    {avg_recall:.2f}")
        print(f"Average f1:        {avg_f1:.2f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
