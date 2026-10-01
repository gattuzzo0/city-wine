"""Generate web app icons from a square source PNG. Run once after logo change."""
from __future__ import annotations

import base64
import sys
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
DEFAULT_SRC = ROOT / "src" / "assets" / "city-wine-app-icon.png"
MASKABLE_BG = "#000000"


def main() -> None:
    src_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    if not src_path.is_file():
        raise FileNotFoundError(f"Logo source not found: {src_path}")
    source = Image.open(src_path).convert("RGBA")

    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "apple-touch-icon.png": 180,
        "apple-icon.png": 180,
        "icon-192.png": 192,
        "icon-512.png": 512,
    }

    for name, size in sizes.items():
        source.resize((size, size), Image.Resampling.LANCZOS).save(
            PUBLIC / name,
            format="PNG",
            optimize=True,
        )

    maskable_size = 512
    bg = Image.new("RGBA", (maskable_size, maskable_size), MASKABLE_BG)
    inner = int(maskable_size * 0.82)
    logo = source.resize((inner, inner), Image.Resampling.LANCZOS)
    offset = (maskable_size - inner) // 2
    bg.paste(logo, (offset, offset), logo)
    bg.save(PUBLIC / "icon-512-maskable.png", format="PNG", optimize=True)

    source.save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )

    buf = BytesIO()
    source.resize((128, 128), Image.Resampling.LANCZOS).save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    (PUBLIC / "favicon.svg").write_text(
        "\n".join(
            [
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="City Wine">',
                f'  <image width="128" height="128" href="data:image/png;base64,{b64}"/>',
                "</svg>",
                "",
            ]
        ),
        encoding="utf-8",
    )

    print(f"Source: {src_path}")
    for name in [
        "favicon.ico",
        "favicon.svg",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "apple-icon.png",
        "icon-192.png",
        "icon-512.png",
        "icon-512-maskable.png",
    ]:
        path = PUBLIC / name
        print(f"  {name}: {path.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
