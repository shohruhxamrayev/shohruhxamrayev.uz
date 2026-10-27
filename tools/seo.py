"""Adds/refreshes SEO tags on every page. Run from the site folder:  python3 tools/seo.py
Safe to re-run: it replaces the block between <!-- seo --> and <!-- /seo -->, and rebuilds sitemap.xml."""
import glob, json, os, re, subprocess, html
from datetime import date

SITE = "https://www.shohruhxamrayev.uz"
NAME = "Shohruh Xamrayev"
PERSON_ID = SITE + "/#person"
DEFAULT_IMG = SITE + "/og-image.jpg"
SOCIALS = ["https://www.linkedin.com/in/shohruh-xamrayev-4703a8361", "https://github.com/shohruhxamrayev",
           "https://x.com/shohruhxamrayev", "https://t.me/shohruhxamrayev"]
PERSON = {
    "@type": "Person", "@id": PERSON_ID, "name": NAME, "givenName": "Shohruh", "familyName": "Xamrayev",
    "alternateName": ["Shohruh", "Xamrayev", "Shohruh Khamrayev", "Shoxrux Xamrayev", "Shohruh Hamrayev", "Shokhrukh Khamraev", "Shohrukh Khamrayev", "Шохрух Хамраев"],
    "url": SITE + "/", "image": SITE + "/shohruh-xamrayev.jpg",
    "jobTitle": "Founder of Makon",
    "description": "Shohruh Xamrayev is the founder of Makon, a studio where you redesign a room with AI, build it in 3D and design every piece of furniture. He writes essays, keeps notes on books and builds web products.",
    "worksFor": {"@type": "Organization", "@id": SITE + "/projects/makon.html#org", "name": "Makon", "url": "https://makon-khaki.vercel.app/"},
    "knowsAbout": ["Web development", "Product design", "Artificial intelligence", "Economics", "Psychology", "Technology", "History"],
    "sameAs": SOCIALS,
}
MAKON_LIVE = "https://makon-khaki.vercel.app/"
MAKON_ORG = {"@type": "Organization", "@id": SITE + "/projects/makon.html#org", "name": "Makon",
             "description": "Room design studio: redesign a room with AI from one photo, build it as a floor plan and 3D room, design and place every piece of furniture, and get a build brief.",
             "founder": {"@id": PERSON_ID}, "url": MAKON_LIVE,
             "sameAs": ["https://github.com/shohruhxamrayev/makon", SITE + "/projects/makon.html"]}
WEBSITE = {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/", "name": NAME,
           "alternateName": "Shohruh", "inLanguage": "en", "publisher": {"@id": PERSON_ID}, "author": {"@id": PERSON_ID}}

def attr(s): return html.escape(html.unescape(s), quote=True)
def text(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

def url_for(path):
    return SITE + "/" if path == "index.html" else SITE + "/" + path

def git_date(path):
    try:
        d = subprocess.run(["git", "log", "-1", "--format=%cs", "--", path], capture_output=True, text=True).stdout.strip()
        return d or date.today().isoformat()
    except Exception:
        return date.today().isoformat()

MONTHS = {m: i for i, m in enumerate(["January","February","March","April","May","June","July","August","September","October","November","December"], 1)}
def iso(d):
    m = re.match(r"(\w+) (\d+), (\d{4})", d.strip())
    return f"{m.group(3)}-{MONTHS[m.group(1)]:02d}-{int(m.group(2)):02d}" if m and m.group(1) in MONTHS else None

# Essays: blurbs from the list page
essay_blurbs = {}
lst = open("essays.html").read()
for href, blurb in re.findall(r'<h3><a href="(essays/[^"]+)">[^<]*</a></h3>\s*<p>(.*?)</p>', lst, re.S):
    essay_blurbs[href] = text(blurb)

OVERRIDES = {
    "index.html": ("Shohruh Xamrayev — Founder of Makon",
                   "Shohruh Xamrayev is the founder of Makon. Essays, book notes, a travel journal and projects about learning, building and writing."),
    "about.html": ("About Shohruh Xamrayev — Founder of Makon",
                   "About Shohruh Xamrayev, founder of Makon: curiosity, building things on my own, and caring about the people around me."),
    "projects.html": (None, "Projects by Shohruh Xamrayev, including Makon, an AI room-redesign studio he founded, and this website."),
    "projects/makon.html": ("Makon by Shohruh Xamrayev — AI room redesign",
                            "Makon, founded and built by Shohruh Xamrayev: redesign a room with AI from one photo, build it as a floor plan and a 3D room, design every piece of furniture and get a build brief."),
    "essays.html": (None, "Essays by Shohruh Xamrayev on psychology, money, habits, the mind and character."),
    "books.html": (None, "Books Shohruh Xamrayev is reading and has read, with ratings and notes."),
    "journal.html": (None, "Shohruh Xamrayev's journal: notes and photographs from trips across Uzbekistan."),
    "studio.html": (None, "Shohruh Xamrayev's studio: favourite quotes, film and series recommendations, personal rules and tools."),
}

pages = sorted(glob.glob("*.html") + glob.glob("*/*.html"))
sitemap = []
for path in pages:
    s = open(path).read()
    if "<head>" not in s or path.startswith(("yandex_", "google")): continue
    s = re.sub(r"\n?<!-- seo -->.*?<!-- /seo -->\n?", "\n", s, flags=re.S)

    t = re.search(r"<title>(.*?)</title>", s, re.S)
    title = text(t.group(1)) if t else NAME
    dm = re.search(r'<meta name="description" content="([^"]*)">', s)
    desc = html.unescape(dm.group(1)) if dm else ""
    o = OVERRIDES.get(path)
    if o and o[0]: title = o[0]
    if o and o[1]: desc = o[1]
    if path.startswith("essays/") and not desc: desc = essay_blurbs.get(path, "")
    if not desc: desc = f"{title}."
    if "Xamrayev" not in desc and len(desc) < 140: desc = desc.rstrip(".") + f". By {NAME}."

    # title + description in place
    if t: s = s.replace(t.group(0), f"<title>{html.escape(title, quote=False)}</title>", 1)
    if dm: s = s.replace(dm.group(0), f'<meta name="description" content="{attr(desc)}">', 1)
    else: s = s.replace("</title>", f'</title>\n<meta name="description" content="{attr(desc)}">', 1)

    url = url_for(path)
    img, og_type, graph = DEFAULT_IMG, "website", []
    if path in ("index.html",):
        og_type = "profile"
        graph = [PERSON, WEBSITE, MAKON_ORG]
    elif path == "about.html":
        og_type = "profile"
        img = SITE + "/shohruh-xamrayev.jpg"
        graph = [{"@type": "ProfilePage", "@id": url + "#page", "url": url, "name": title, "mainEntity": {"@id": PERSON_ID}, "isPartOf": {"@id": SITE + "/#website"}}, PERSON, MAKON_ORG]
    elif path == "projects/makon.html":
        img = SITE + "/projects/img/makon-after.jpg"
        graph = [MAKON_ORG,
                 {"@type": "SoftwareApplication", "name": "Makon", "applicationCategory": "DesignApplication", "operatingSystem": "Web",
                  "description": OVERRIDES[path][1], "creator": {"@id": PERSON_ID}, "author": {"@id": PERSON_ID},
                  "publisher": {"@id": SITE + "/projects/makon.html#org"}, "url": MAKON_LIVE, "image": img,
                  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}},
                 {"@type": "Person", "@id": PERSON_ID, "name": NAME, "url": SITE + "/", "sameAs": SOCIALS}]
    elif path.startswith("essays/"):
        og_type = "article"
        im = re.search(r'<figure class="es-fig">\s*<img src="([^"]+)"', s)
        if im: img = im.group(1) if im.group(1).startswith("http") else SITE + "/essays/" + im.group(1)
        d = re.search(r"<time>([^<]+)</time>", s)
        art = {"@type": "BlogPosting", "headline": title.split(" — ")[0], "description": desc, "url": url, "mainEntityOfPage": url,
               "image": img, "author": {"@id": PERSON_ID}, "publisher": {"@id": PERSON_ID}, "inLanguage": "en"}
        if d and iso(d.group(1)): art["datePublished"] = iso(d.group(1))
        graph = [art, {"@type": "Person", "@id": PERSON_ID, "name": NAME, "url": SITE + "/", "sameAs": SOCIALS}]
    elif path.startswith("journal/"):
        slug = os.path.basename(path)[:-5]
        jd = open("journal-data.js").read()
        m = re.search(r'slug: "' + re.escape(slug) + r'",[\s\S]*?cover: "([^"]+)"', jd)
        if m: img = SITE + "/journal/" + m.group(1)
        og_type = "article"
    elif path == "projects/personal-website.html":
        graph = [{"@type": "CreativeWork", "name": "Personal Website", "url": SITE + "/", "creator": {"@id": PERSON_ID}},
                 {"@type": "Person", "@id": PERSON_ID, "name": NAME, "url": SITE + "/", "sameAs": SOCIALS}]

    block = [
        "<!-- seo -->",
        f'<link rel="canonical" href="{url}">',
        f'<meta name="author" content="{NAME}">',
        '<meta name="robots" content="index, follow, max-image-preview:large">',
        f'<meta property="og:site_name" content="{NAME}">',
        f'<meta property="og:type" content="{og_type}">',
        f'<meta property="og:title" content="{attr(title)}">',
        f'<meta property="og:description" content="{attr(desc)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{attr(img)}">',
        '<meta property="og:locale" content="en_US">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:site" content="@shohruhxamrayev">',
        f'<meta name="twitter:title" content="{attr(title)}">',
        f'<meta name="twitter:description" content="{attr(desc)}">',
        f'<meta name="twitter:image" content="{attr(img)}">',
        '<link rel="icon" href="/favicon.ico" sizes="any">',
        '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
        '<link rel="manifest" href="/site.webmanifest">',
        '<meta name="theme-color" content="#f8f5ee">',
    ]
    if og_type == "profile":
        block += ['<meta property="profile:first_name" content="Shohruh">', '<meta property="profile:last_name" content="Xamrayev">']
    if graph:
        block.append('<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False) + "</script>")
    block.append("<!-- /seo -->")
    s = re.sub(r'(<meta name="description" content="[^"]*">)', lambda m: m.group(1) + "\n" + "\n".join(block), s, count=1)
    s = re.sub(r"\n{3,}", "\n\n", s)
    open(path, "w").write(s)

    pri = "1.0" if path == "index.html" else "0.9" if path in ("about.html", "projects/makon.html") else "0.8" if "/" not in path else "0.6"
    sitemap.append(f"  <url><loc>{url}</loc><lastmod>{git_date(path)}</lastmod><priority>{pri}</priority></url>")

open("sitemap.xml", "w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(sitemap) + "\n</urlset>\n")
print(f"{len(sitemap)} pages updated")
