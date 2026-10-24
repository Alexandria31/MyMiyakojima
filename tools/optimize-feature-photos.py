"""Create lighter web versions of the reviewed feature photos; keep the originals."""
from pathlib import Path
from html.parser import HTMLParser
import re
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
photos = {
    "toppuri-official-hero-stars.webp": ("toppuri-hero-stars-web.webp", 1600),
    "toppuri-aerial-sunset-optimized.webp": ("toppuri-aerial-sunset-web.webp", 1600),
    "caldo-de-cana-lime.jpg": ("caldo-de-cana-lime-web.webp", 1280),
    "slider2-optimized.webp": ("slider2-web.webp", 1600),
    "slider4-optimized.webp": ("slider4-web.webp", 1600),
}
replacements = {}
responsive = {}
total_before = total_after = 0
for name, (target_name, max_dimension) in photos.items():
    source = ROOT / "images" / name
    target = ROOT / "images" / target_name
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert("RGB")
        image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=82, method=6)
    before, after = source.stat().st_size, target.stat().st_size
    assert after < before, name
    total_before += before
    total_after += after
    replacements["images/" + name] = "images/" + target_name
    widths = []
    for width in [640, 960]:
        with Image.open(target) as raw:
            image = raw.copy()
            image.thumbnail((width, 10000), Image.Resampling.LANCZOS)
            variant = target.with_name(target.stem + f'-{width}.webp')
            image.save(variant, "WEBP", quality=82, method=6)
            widths.append((variant.relative_to(ROOT).as_posix(), image.width))
    with Image.open(target) as image:
        widths.append((target.relative_to(ROOT).as_posix(), image.width))
    responsive["images/" + target_name] = widths
    print(f"{name}: {before // 1000} KB -> {after // 1000} KB")
for source in list(ROOT.glob("*.html")) + list(ROOT.glob("*.css")) + list((ROOT / "js").glob("*.js")):
    with source.open(encoding="utf-8-sig", newline="") as handle:
        text = handle.read()
    original = text
    for before, after in replacements.items():
        text = text.replace(before, after)
    if source.suffix == ".html":
        class ResponsiveImages(HTMLParser):
            def __init__(self): super().__init__(); self.updates = []
            def handle_starttag(self, tag, attrs):
                a = dict(attrs)
                if tag != "img" or a.get("src") not in responsive: return
                raw = self.get_starttag_text()
                updated = re.sub(r'\s+(?:srcset|sizes)="[^"]*"', '', raw)
                srcset = ", ".join(f"{name} {width}w" for name, width in responsive[a["src"]])
                desktop = "1120px" if "toppuri-hero-image" in a.get("class", "") else "560px"
                ending = "/>" if updated.endswith("/>") else ">"
                updated = updated[:-len(ending)] + f' srcset="{srcset}" sizes="(max-width: 760px) calc(100vw - 32px), {desktop}"' + ending
                self.updates.append((raw, updated))
        parser = ResponsiveImages(); parser.feed(text)
        for before, after in parser.updates: text = text.replace(before, after, 1)
    if text != original:
        with source.open("w", encoding="utf-8", newline="") as handle:
            handle.write(text)
print(f"Feature-photo total: {total_before // 1000} KB -> {total_after // 1000} KB")
