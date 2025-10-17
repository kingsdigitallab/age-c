"""Validate raw CSV data files before ETL processing.

This script performs comprehensive validation checks on all CSV files in the
data/0_raw directory to ensure they are valid, non-empty, and properly formatted
before running the ETL pipeline.

Usage:
    python -m scripts.validate_raw_data

    Or from the etl directory:
    python scripts/validate_raw_data.py

Exit codes:
    0: All validations passed
    1: One or more validations failed
"""

import logging
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import pandas as pd

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Define expected files and their required columns
REQUIRED_FILES = {
    # Core data files
    "film.csv": [
        "film_id",
        "nat_title",
        "release_date",
        "release_type",
        "film_type",
        "director",
    ],
    "person.csv": ["person_name", "birth_year", "gender"],
    "character.csv": ["character_id", "film_id", "person_id", "ch_age", "ch_gender"],
    # Relationship files
    "film_award.csv": ["film_id", "award", "category", "result", "year"],
    "person_award.csv": ["film_id", "name", "award", "category", "result", "year"],
    "person_role.csv": ["film_id", "person_name", "person_role"],
    "film_genre.csv": ["film_id", "film_genre"],
    "film_marketing.csv": ["film_id"],
    "film_nat.csv": ["film_id", "film_country"],
    "person_nat.csv": ["person_name", "person_nat"],
    "film_tag.csv": ["film_id", "tag_name"],
    # Code lookup files
    "codes/role_class.csv": ["Code", "Description"],
    "codes/award_name.csv": ["Code", "Description"],
    "codes/age.csv": ["Code", "Description"],
    "codes/gender.csv": ["Code", "Description"],
    "codes/prod_share.csv": ["Code", "Description"],
    "codes/ability.csv": ["Code", "Description"],
    "codes/assisted_mobility.csv": ["Code", "Description"],
    "codes/award_category.csv": ["Code", "Description"],
    "codes/film_type.csv": ["Code", "Description"],
    "codes/genre.csv": ["Code", "Description"],
    "codes/professional_status.csv": ["Code", "Description"],
    "codes/sexuality.csv": ["Code", "Description"],
    "codes/origin.csv": ["Code", "Description"],
    "codes/class.csv": ["Code", "Description"],
    "codes/release_type.csv": ["Code", "Description"],
    "codes/country.csv": ["Code", "Description"],
}


class ValidationResult:
    """Store validation results for a single file."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.passed = True
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.row_count: Optional[int] = None
        self.file_size: Optional[int] = None

    def add_error(self, message: str):
        """Add an error message and mark validation as failed."""
        self.errors.append(message)
        self.passed = False

    def add_warning(self, message: str):
        """Add a warning message without failing validation."""
        self.warnings.append(message)


def validate_file_exists(file_path: Path) -> Optional[str]:
    """Check if file exists and is readable.

    Args:
        file_path: Path to the file to check

    Returns:
        Error message if validation fails, None otherwise
    """
    if not file_path.exists():
        return f"File does not exist: {file_path}"

    if not file_path.is_file():
        return f"Path is not a file: {file_path}"

    if not file_path.stat().st_size > 0:
        return f"File is empty (0 bytes): {file_path}"

    return None


def validate_csv_structure(
    file_path: Path, separator: str = ","
) -> Tuple[Optional[pd.DataFrame], Optional[str]]:
    """Validate CSV file can be parsed and has basic structure.

    Args:
        file_path: Path to the CSV file
        separator: CSV delimiter (default: comma)

    Returns:
        Tuple of (DataFrame if successful, error message if failed)
    """
    try:
        # For code files, keep_default_na=False prevents "NA" from being interpreted as NaN
        # (e.g., Namibia's country code "NA" should not be treated as missing data)
        keep_default_na = "codes/" not in str(file_path)

        # Try reading with default separator
        df = pd.read_csv(
            file_path,
            sep=separator,
            on_bad_lines="skip",
            keep_default_na=keep_default_na,
        )

        if df.empty:
            return None, "CSV file has no data rows"

        if len(df.columns) == 0:
            return None, "CSV file has no columns"

        return df, None

    except pd.errors.EmptyDataError:
        return None, "CSV file is empty or has no data"
    except pd.errors.ParserError as e:
        return None, f"CSV parsing error: {str(e)}"
    except UnicodeDecodeError as e:
        return None, f"Encoding error (expected UTF-8): {str(e)}"
    except Exception as e:
        return None, f"Unexpected error reading CSV: {str(e)}"


def validate_required_columns(
    df: pd.DataFrame, required_columns: List[str], file_path: str
) -> List[str]:
    """Check if all required columns are present in the DataFrame.

    Args:
        df: DataFrame to check
        required_columns: List of required column names
        file_path: Path to the file (for error messages)

    Returns:
        List of error messages (empty if all columns present)
    """
    errors = []
    actual_columns = set(df.columns)

    for col in required_columns:
        if col not in actual_columns:
            errors.append(f"Missing required column '{col}' in {file_path}")

    return errors


def validate_file(file_path: Path, required_columns: List[str]) -> ValidationResult:
    """Perform comprehensive validation on a single CSV file.

    Args:
        file_path: Path to the CSV file
        required_columns: List of required column names

    Returns:
        ValidationResult object with validation status and details
    """
    result = ValidationResult(str(file_path.relative_to(Path("../data/0_raw"))))

    # Check 1: File exists and is non-zero
    error = validate_file_exists(file_path)
    if error:
        result.add_error(error)
        return result

    # Store file size
    result.file_size = file_path.stat().st_size

    # Check 2: File is valid CSV with proper structure
    # Special handling for semicolon-delimited files
    separator = ";" if "film_award" in str(file_path) else ","
    df, error = validate_csv_structure(file_path, separator=separator)

    if error:
        result.add_error(error)
        return result

    # Store row count
    result.row_count = len(df)

    # Check 3: Has at least one data row
    if result.row_count == 0:
        result.add_error("File has header but no data rows")
        return result

    # Check 4: Required columns are present
    column_errors = validate_required_columns(df, required_columns, str(file_path))
    for error in column_errors:
        result.add_error(error)

    # Additional checks for specific file types
    if "codes/" in str(file_path):
        # Code files should have no empty Code values
        if "Code" in df.columns and df["Code"].isna().any():
            result.add_warning("Code file contains empty Code values")

    # Check for completely empty DataFrames (all NaN)
    if df.isna().all().all():
        result.add_error("File contains only empty/NaN values")

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
    """Run validation on all required CSV files.

    Returns:
        Exit code (0 for success, 1 for failure)
    """
    logger.info("Starting CSV data validation...")

    raw_dir = Path("../data/0_raw")

    if not raw_dir.exists():
        logger.error(f"Raw data directory not found: {raw_dir}")
        return 1

    results: Dict[str, ValidationResult] = {}
    total_errors = 0
    total_warnings = 0

    # Validate each required file
    for file_name, required_columns in REQUIRED_FILES.items():
        file_path = raw_dir / file_name
        logger.info(f"Validating {file_name}...")

        result = validate_file(file_path, required_columns)
        results[file_name] = result

        if not result.passed:
            total_errors += len(result.errors)

        total_warnings += len(result.warnings)

    # Print summary
    print("\n" + "=" * 80)
    print("CSV VALIDATION REPORT")
    print("=" * 80 + "\n")

    passed_count = sum(1 for r in results.values() if r.passed)
    failed_count = len(results) - passed_count

    # Print results for each file
    for file_name, result in results.items():
        status = "✓" if result.passed else "✗"
        color = "\033[92m" if result.passed else "\033[91m"
        reset = "\033[0m"

        size_str = format_size(result.file_size) if result.file_size else "N/A"
        row_str = f"{result.row_count} rows" if result.row_count is not None else "N/A"

        print(f"{color}{status}{reset} {file_name:<40} {row_str:<12} {size_str}")

        # Print errors
        for error in result.errors:
            print(f"    {color}ERROR:{reset} {error}")

        # Print warnings
        for warning in result.warnings:
            print(f"    \033[93mWARNING:\033[0m {warning}")

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
