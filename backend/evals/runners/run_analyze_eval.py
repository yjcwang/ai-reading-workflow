import argparse
import json
import os
import sys
from time import perf_counter
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DEFAULT_API_URL = "http://127.0.0.1:8000/api/analyze"
DEFAULT_DATASET = Path(__file__).resolve().parents[1] / "datasets" / "n2_eval_dataset.json"
BACKEND_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND_DIR))

_cwd = Path.cwd()
try:
    os.chdir(BACKEND_DIR)
    from app.config import settings  # noqa: E402
finally:
    os.chdir(_cwd)


GRAMMAR_PREFIXES = (chr(0xFF5E), chr(0x301C), "~")


def load_dataset(dataset_path: Path) -> list[dict[str, Any]]:
    """Load evaluation cases from a JSON dataset file."""
    with dataset_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("Dataset must be a JSON array.")

    return data


def get_analyzer_model() -> str:
    provider = settings.LLM_PROVIDER_ANALYZER
    if provider == "gemini":
        return settings.GEMINI_MODEL
    if provider == "openai":
        return settings.OPENAI_MODEL
    if provider == "ollama":
        return settings.OLLAMA_MODEL
    if provider == "deepseek":
        return settings.DEEPSEEK_MODEL
    return "mock"


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


def normalize_grammar(items: list[str]) -> list[str]:
    return unique_sorted([normalize_grammar_expression(item) for item in items])


def extract_expressions(response: dict[str, Any], key: str) -> list[str]:
    items = response.get(key, [])
    if not isinstance(items, list):
        return []

    values = []
    for item in items:
        if isinstance(item, dict) and isinstance(item.get("expression"), str):
            values.append(item["expression"])
    return unique_sorted(values)


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


def eval_list(expected: list[str], actual: list[str]) -> dict[str, Any]:
    expected = unique_sorted(expected)
    actual = unique_sorted(actual)
    metrics = calculate_metrics(expected, actual)
    return {
        "expected": expected,
        "actual_norm": actual,
        "missing": sorted(set(expected) - set(actual)),
        "extra": sorted(set(actual) - set(expected)),
        **metrics,
    }


def evaluate_case(case: dict[str, Any], api_url: str, target_lang: str, timeout: float) -> dict[str, Any]:
    response = post_analyze(
        api_url=api_url,
        text=case["text"],
        level=case.get("level", "N2"),
        target_lang=target_lang,
        timeout=timeout,
    )

    return {
        "id": case["id"],
        "grammar": eval_list(
            case.get("expected_grammar", []),
            normalize_grammar(extract_expressions(response, "grammar")),
        ),
        "vocab": eval_list(
            case.get("expected_vocab", []),
            extract_expressions(response, "vocab"),
        ),
    }


def print_section(name: str, data: dict[str, Any]) -> None:
    print(f"  {name}")
    print(f"    expected:    {data['expected']}")
    print(f"    actual norm: {data['actual_norm']}")
    print(f"    missing:     {data['missing']}")
    print(f"    extra:       {data['extra']}")
    print(
        "    metrics:     "
        f"matched={data['matched']}, "
        f"precision={data['precision']:.2f}, "
        f"recall={data['recall']:.2f}, "
        f"f1={data['f1']:.2f}"
    )


def print_result(result: dict[str, Any]) -> None:
    print(f"\n[CASE] {result['id']}")
    print(f"  latency: {result['latency_seconds']:.2f}s")
    print_section("Grammar", result["grammar"])
    print_section("Vocab", result["vocab"])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the minimal analyze API extraction evaluation.")
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
        start = perf_counter()
        try:
            result = evaluate_case(case, args.api_url, args.target_lang, args.timeout)
        except (HTTPError, URLError, TimeoutError, KeyError, json.JSONDecodeError, ValueError) as exc:
            result = {
                "id": case.get("id", "<unknown>"),
                "latency_seconds": perf_counter() - start,
                "grammar": eval_list(case.get("expected_grammar", []), []),
                "vocab": eval_list(case.get("expected_vocab", []), []),
            }
            print_result(result)
            print(f"  error:            {exc}")
            results.append(result)
            continue

        result["latency_seconds"] = perf_counter() - start
        print_result(result)
        results.append(result)

    print("\nSummary")
    print(f"Analyzer provider: {settings.LLM_PROVIDER_ANALYZER}")
    print(f"Analyzer model:    {get_analyzer_model()}")
    if results:
        avg_latency = sum(result["latency_seconds"] for result in results) / len(results)
        print(f"Average latency:   {avg_latency:.2f}s")
        for key, label in [("grammar", "Grammar"), ("vocab", "Vocab")]:
            avg_precision = sum(result[key]["precision"] for result in results) / len(results)
            avg_recall = sum(result[key]["recall"] for result in results) / len(results)
            avg_f1 = sum(result[key]["f1"] for result in results) / len(results)
            print(f"{label} average precision: {avg_precision:.2f}")
            print(f"{label} average recall:    {avg_recall:.2f}")
            print(f"{label} average f1:        {avg_f1:.2f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
