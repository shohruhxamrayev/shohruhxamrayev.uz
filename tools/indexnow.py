#!/usr/bin/env python3
"""Tell Bing, Yandex, Seznam, Naver and other IndexNow search engines that pages changed.

Usage:
  python3 tools/indexnow.py              # submit every URL in sitemap.xml
  python3 tools/indexnow.py essays/x.html projects/makon.html   # submit just these pages

The key file (577c46a240b6a104e6e0273002101e85.txt) must stay in the site root, or submissions will be rejected.
"""
import json, re, sys, urllib.request

SITE = "https://www.shohruhxamrayev.uz"
KEY = "577c46a240b6a104e6e0273002101e85"

def urls():
    if len(sys.argv) > 1:
        return [SITE + "/" + a.lstrip("/") for a in sys.argv[1:]]
    return re.findall(r"<loc>([^<]+)</loc>", open("sitemap.xml").read())

body = {"host": "www.shohruhxamrayev.uz", "key": KEY, "keyLocation": SITE + "/" + KEY + ".txt", "urlList": urls()}
req = urllib.request.Request("https://api.indexnow.org/indexnow", data=json.dumps(body).encode(),
                             headers={"Content-Type": "application/json; charset=utf-8"})
with urllib.request.urlopen(req, timeout=30) as r:
    print(r.status, "-", len(body["urlList"]), "URLs submitted" if r.status in (200, 202) else "")
