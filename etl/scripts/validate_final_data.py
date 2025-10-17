"""Validate final JSON data files after ETL processing.

This script performs simple validation checks on all JSON files in the
data/2_final directory to ensure they are valid JSON, non-empty, and properly
structured after the ETL pipeline has run.

Usage:
    python -m scripts.validate_final_data

    Or from the etl directory:
    python scripts/validate_final_data.py

Exit codes:
    0: All validations passed
    1: One or more validations failed
"""

import json
import logging
import sys
from pathlib import Path
from typing import Dict, List, Optional

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ValidationResult:
    """Store validation results for a single file."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.passed = True
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.file_size: Optional[int] = None
        self.item_count: Optional[int] = None

    def add_error(self, message: str):
        """Add an error message and mark validation as failed."""
        self.errors.append(message)
        self.passed = False

    def add_warning(self, message: str):
        """Add a warning message without failing validation."""
        self.warnings.append(message)


def validate_json_file(file_path: Path) -> ValidationResult:
    """Perform validation on a single JSON file.

    Args:
        file_path: Path to the JSON file

    Returns:
        ValidationResult object with validation status and details
    """
    result = ValidationResult(str(file_path.relative_to(Path("../data/2_final"))))

    # Check 1: File exists and is non-zero
    if not file_path.exists():
        result.add_error(f"File does not exist: {file_path}")
        return result

    if not file_path.is_file():
        result.add_error(f"Path is not a file: {file_path}")
        return result

    file_size = file_path.stat().st_size
    result.file_size = file_size

    if file_size == 0:
        result.add_error("File is empty (0 bytes)")
        return result

    # Check 2: File is valid JSON
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        result.add_error(f"Invalid JSON: {str(e)}")
        return result
    except UnicodeDecodeError as e:
        result.add_error(f"Encoding error (expected UTF-8): {str(e)}")
        return result
    except Exception as e:
        result.add_error(f"Unexpected error reading JSON: {str(e)}")
        return result

    # Check 3: JSON is not empty
    if data is None:
        result.add_error("JSON file is empty")
        return result

    # Count items for lists and objects
    if isinstance(data, list):
        result.item_count = len(data)
        if result.item_count == 0:
            result.add_warning("JSON array is empty")
    elif isinstance(data, dict):
        result.item_count = len(data)
        if result.item_count == 0:
            result.add_warning("JSON object is empty")

    return result


def format_size(size_bytes: int) -> str:
    """Format file size in human-readable format.

    Args:
        size_bytes: Size in bytes

    Returns:
        Formatted string (e.g., "1.2 KB", "3.4 MB")
    """
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"


def main() -> int:
    """Run validation on all JSON files in the final data directory.

    Returns:
        Exit code (0 for success, 1 for failure)
    """
    logger.info("Starting final data validation...")

    final_dir = Path("../data/2_final")

    if not final_dir.exists():
        logger.error(f"Final data directory not found: {final_dir}")
        return 1

    # Find all JSON files (including in subdirectories)
    json_files = sorted(final_dir.rglob("*.json"))

    if not json_files:
        logger.error(f"No JSON files found in {final_dir}")
        return 1

    logger.info(f"Found {len(json_files)} JSON files to validate")

    results: Dict[str, ValidationResult] = {}
    total_errors = 0
    total_warnings = 0

    # Validate each JSON file
    for file_path in json_files:
        rel_path = str(file_path.relative_to(final_dir))
        logger.info(f"Validating {rel_path}...")

        result = validate_json_file(file_path)
        results[rel_path] = result

        if not result.passed:
            total_errors += len(result.errors)

        total_warnings += len(result.warnings)

    # Print summary
    print("\n" + "=" * 80)
    print("FINAL DATA VALIDATION REPORT")
    print("=" * 80 + "\n")

    passed_count = sum(1 for r in results.values() if r.passed)
    failed_count = len(results) - passed_count

    # Group results by directory for better readability
    root_files = {k: v for k, v in results.items() if "/" not in k}
    biographies = {k: v for k, v in results.items() if k.startswith("biographies/")}
    films = {k: v for k, v in results.items() if k.startswith("films/")}

    def print_results(results_dict: Dict[str, ValidationResult], header: str = None):
        """Print results for a group of files."""
        if not results_dict:
            return

        if header:
            print(f"\n{header}")
            print("-" * 80)

        for file_name, result in results_dict.items():
            status = "✓" if result.passed else "✗"
            color = "\033[92m" if result.passed else "\033[91m"
            reset = "\033[0m"

            size_str = format_size(result.file_size) if result.file_size else "N/A"
            item_str = (
                f"{result.item_count} items" if result.item_count is not None else ""
            )

            print(f"{color}{status}{reset} {file_name:<50} {item_str:<15} {size_str}")

            # Print errors
            for error in result.errors:
                print(f"    {color}ERROR:{reset} {error}")

            # Print warnings (only for non-biography/film files to reduce noise)
            if not (
                file_name.startswith("biographies/") or file_name.startswith("films/")
            ):
                for warning in result.warnings:
                    print(f"    \033[93mWARNING:\033[0m {warning}")

    # Print results grouped by type
    print_results(root_files, "Root JSON Files")

    if biographies:
        bio_passed = sum(1 for r in biographies.values() if r.passed)
        bio_failed = len(biographies) - bio_passed
        print(
            f"\nBiographies: {bio_passed} passed, {bio_failed} failed (of {len(biographies)} total)"
        )
        # Only show failed biographies to reduce output
        failed_bios = {k: v for k, v in biographies.items() if not v.passed}
        if failed_bios:
            print_results(failed_bios)

    if films:
        films_passed = sum(1 for r in films.values() if r.passed)
        films_failed = len(films) - films_passed
        print(
            f"\nFilms: {films_passed} passed, {films_failed} failed (of {len(films)} total)"
        )
        # Only show failed films to reduce output
        failed_films = {k: v for k, v in films.items() if not v.passed}
        if failed_films:
            print_results(failed_films)

    # Print summary statistics
    print("\n" + "-" * 80)
    print(f"Total files checked: {len(results)}")
    print(f"Passed: {passed_count}")
    print(f"Failed: {failed_count}")
    print(f"Total errors: {total_errors}")
    print(f"Total warnings: {total_warnings}")
    print("-" * 80 + "\n")

    if failed_count > 0:
        logger.error(f"Validation FAILED: {failed_count} file(s) with errors")
        return 1

    logger.info("Validation PASSED: All files are valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
