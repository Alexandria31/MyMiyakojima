"""Apply the reviewed bilingual metadata and language labels to the static pages."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parents[1]
metadata = json.loads((ROOT / "tools/seo-metadata.json").read_text(encoding="utf-8"))
image_alts = json.loads((ROOT / "tools/image-alt-text.json").read_text(encoding="utf-8"))
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
JP = re.compile(r"[\u3040-\u30ff\u3400-\u9fff]")

def set_attr(raw, name, value):
    encoded = escape(value, quote=True)
    pattern = re.compile(r"(?<![\w-])" + re.escape(name) + r"\s*=\s*([\"'])(.*?)\1", re.S | re.I)
    if pattern.search(raw):
        return pattern.sub(lambda match: f'{name}="{encoded}"', raw, count=1)
    ending = "/>" if raw.endswith("/>") else ">"
    return raw[:-len(ending)].rstrip() + f' {name}="{encoded}"' + ending

class Labels(HTMLParser):
    def __init__(self, text, title, description):
        super().__init__(convert_charrefs=True)
        self.text = text
        self.title = title
        self.description = description
        self.offsets = [0]
        for line in text.splitlines(keepends=True):
            self.offsets.append(self.offsets[-1] + len(line))
        self.stack = []
        self.edits = {}
        self.jp_count = 0
        self.pixel_count = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        row, col = self.getpos()
        position = self.offsets[row - 1] + col
        raw = self.get_starttag_text()
        item = {"tag": tag, "raw": raw, "new": raw, "position": position, "parts": [], "children": False}
        if self.stack:
            self.stack[-1]["children"] = True
        if tag == "meta":
            key = a.get("name") or a.get("property")
            if key in {"description", "og:description", "twitter:description"}:
                item["new"] = set_attr(raw, "content", self.description)
            elif key in {"og:title", "twitter:title"}:
                item["new"] = set_attr(raw, "content", self.title)
            elif key == "og:locale":
                item["new"] = set_attr(raw, "content", "ja_JP")
            elif key == "og:locale:alternate":
                item["new"] = set_attr(raw, "content", "en_US")
        classes = a.get("class", "").split()
        known_japanese = any(re.search(r"(?:^|-)(?:jp|ja)(?:$|-)", cls) for cls in classes) or bool(re.search(r"-(?:jp|ja)$", a.get("id", "")))
        if known_japanese and "lang" not in a:
            item["new"] = set_attr(item["new"], "lang", "ja")
            self.jp_count += 1
        if tag == "img" and "facebook.com/tr?" in a.get("src", ""):
            item["new"] = set_attr(item["new"], "alt", "")
            self.pixel_count += 1
        elif tag == "img" and Path(a.get("src", "")).name in image_alts and a.get("alt") != "":
            item["new"] = set_attr(item["new"], "alt", image_alts[Path(a["src"]).name])
        self.edits[position] = item
        if tag not in VOID:
            self.stack.append(item)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)
    def handle_data(self, data):
        if self.stack:
            self.stack[-1]["parts"].append(data)
    def handle_endtag(self, tag):
        index = next((i for i in range(len(self.stack) - 1, -1, -1) if self.stack[i]["tag"] == tag), None)
        if index is None:
            return
        for item in self.stack[index:]:
            content = "".join(item["parts"]).strip()
            if (not item["children"] and item["tag"] in {"p", "span", "small", "strong", "em", "h1", "h2", "h3", "h4", "a", "li", "figcaption"}
                and JP.search(content) and not re.search(r"[A-Za-z]", content) and not re.search(r"\blang\s*=", item["new"])):
                item["new"] = set_attr(item["new"], "lang", "ja")
                self.jp_count += 1
        del self.stack[index:]
    def result(self):
        result = self.text
        for position, item in sorted(self.edits.items(), reverse=True):
            if item["raw"] != item["new"]:
                result = result[:position] + item["new"] + result[position + len(item["raw"]):]
        return result

language_labels = pixels = 0
for name, (title, description) in metadata.items():
    page = ROOT / name
    with page.open(encoding="utf-8-sig", newline="") as source:
        text = source.read()
    text, title_count = re.subn(r"<title>.*?</title>", lambda match: "<title>" + escape(title) + "</title>", text, count=1, flags=re.S)
    assert title_count == 1, name
    labels = Labels(text, title, description)
    labels.feed(text)
    text = labels.result()
    if name in {"guruguru-glass.html", "creative-guruguru-glass.html"}:
        text = text.replace("https://guruguruglass.shopinfo.jp/", "https://www.guruguruglass.shop/")
        text = text.replace("Official Site<span", "Official Online Shop<span")
        text = text.replace(">公式サイト</span>", ">公式オンラインショップ</span>")
    with page.open("w", encoding="utf-8", newline="") as output:
        output.write(text)
    language_labels += labels.jp_count
    pixels += labels.pixel_count

print(f"Applied bilingual metadata to {len(metadata)} pages; added {language_labels} Japanese language labels; labeled {pixels} decorative tracking images.")
