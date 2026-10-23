"""Create smaller delivery images and update local image markup without deleting originals."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
import re
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
replacements = {}
before = after = 0
for source in (ROOT / "images").iterdir():
    if not source.is_file() or source.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
        continue
    if source.stat().st_size < 1_000_000 or "logo" in source.name.lower():
        continue
    target = source.with_name(source.stem + "-optimized.webp")
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw)
        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        image.save(target, "WEBP", quality=85, method=6)
    if target.stat().st_size >= source.stat().st_size:
        target.unlink()
        continue
    replacements[source.relative_to(ROOT).as_posix()] = target.relative_to(ROOT).as_posix()
    before += source.stat().st_size
    after += target.stat().st_size

sources = list(ROOT.glob("*.html")) + list((ROOT / "js").glob("*.js")) + list(ROOT.glob("*.css"))
for source in sources:
    text = source.read_text(encoding="utf-8-sig")
    for original, optimized in replacements.items():
        text = text.replace(original, optimized)
    if source.suffix == ".html":
        class Images(HTMLParser):
            def __init__(self):
                super().__init__()
                self.updates = []
                self.first_photo = True
                self.title = re.search(r"<title>(.*?)</title>", text, re.S)
            def handle_starttag(self, tag, attrs):
                if tag != "img":
                    return
                attributes = dict(attrs)
                src = attributes.get("src", "")
                if src.startswith(("http", "data:")):
                    return
                image_path = ROOT / src.lstrip("/")
                if not image_path.is_file():
                    return
                original_tag = self.get_starttag_text()
                updated_tag = original_tag
                with Image.open(image_path) as img:
                    width, height = img.size
                if "width" not in attributes:
                    updated_tag = updated_tag.replace("<img", f'<img width="{width}" height="{height}"', 1)
                if "alt" not in attributes:
                    title = self.title.group(1).split("|")[0].strip() if self.title else "My Miyakojima"
                    alt = escape(title + " · Photo / 写真", quote=True)
                    updated_tag = updated_tag.replace("<img", f'<img alt="{alt}"', 1)
                if "logo" not in src.lower() and "favicon" not in src.lower():
                    if self.first_photo:
                        updated_tag = updated_tag.replace('loading="lazy"', 'loading="eager"')
                        self.first_photo = False
                    elif "loading" not in attributes:
                        updated_tag = updated_tag.replace("<img", '<img loading="lazy"', 1)
                if updated_tag != original_tag:
                    self.updates.append((original_tag, updated_tag))
        parser = Images()
        parser.feed(text)
        for original, updated in parser.updates:
            text = text.replace(original, updated, 1)
    with source.open("w", encoding="utf-8", newline="") as output:
        output.write(text)

print(f"Optimized {len(replacements)} images: {before / 1e6:.1f} MB -> {after / 1e6:.1f} MB. Originals retained.")
