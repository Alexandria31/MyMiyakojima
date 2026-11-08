from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])


issues = []
files = list(ROOT.glob('*.html'))
for page in files:
    text = page.read_text(encoding='utf-8')
    parser = Links()
    parser.feed(text)
    for link in parser.links:
        url = urlsplit(link)
        if not url.scheme and not url.netloc and url.path:
            if not (ROOT / unquote(url.path)).exists():
                issues.append(f'{page.name}: missing {link}')
    if '\ufffd' in text:
        issues.append(f'{page.name}: Unicode replacement character')
    if text.count("fbq('init'") != 1:
        issues.append(f'{page.name}: unexpected Meta Pixel count')

print({'pages': len(files), 'issues': issues})
raise SystemExit(bool(issues))
