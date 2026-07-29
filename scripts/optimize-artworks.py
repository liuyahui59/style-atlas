from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "artworks"
VARIANTS = {
    "thumbs": {"max_dimension": 720, "quality": 70},
    "optimized": {"max_dimension": 1200, "quality": 78},
}
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}


def save_variant(source: Path, output_dir: Path, max_dimension: int, quality: int) -> int:
    output_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir / f"{source.stem}.webp"

    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        image.save(output, "WEBP", quality=quality, method=4)

    return output.stat().st_size


def main() -> None:
    sources = sorted(
        path
        for path in SOURCE_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )
    totals = {name: 0 for name in VARIANTS}

    for source in sources:
        for name, config in VARIANTS.items():
            totals[name] += save_variant(source, SOURCE_DIR / name, **config)

    summary = ", ".join(f"{name}: {size / 1024 / 1024:.1f} MB" for name, size in totals.items())
    print(f"Optimized {len(sources)} artworks ({summary})")


if __name__ == "__main__":
    main()
