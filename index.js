import { sql } from "@vercel/postgres";

async function ensureTables() {
  await sql`CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    clicks INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export default async function handler(req, res) {
  await ensureTables();

  const path = req.url.split("?")[0];
  const slug = path.slice(1);

  // Redirect when slug is in path
  if (req.method === "GET" && slug && slug !== "api") {
    const { rows } = await sql`SELECT * FROM links WHERE slug=${slug} LIMIT 1`;
    if (rows.length) {
      await sql`UPDATE links SET clicks=clicks+1 WHERE id=${rows[0].id}`;
      return res.writeHead(302, { Location: rows[0].url }).end();
    }
    return res.writeHead(302, { Location: "/" }).end();
  }

  // API endpoints
  if (path === "/api" && req.method === "GET") {
    const { rows } = await sql`SELECT * FROM links ORDER BY created_at DESC LIMIT 20`;
    return res.json(rows);
  }

  if (path === "/api" && req.method === "POST") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", async () => {
      try {
        const { url, slug } = JSON.parse(body);
        if (!url) return res.status(400).json({ error: "URL required" });
        const s = slug || Math.random().toString(36).slice(2, 8);
        await sql`INSERT INTO links (slug,url) VALUES (${s},${url})`;
        res.json({ slug: s });
      } catch {
        res.status(400).json({ error: "Slug taken or invalid" });
      }
    });
    return;
  }

  // Serve UI HTML
  if (req.method === "GET") {
    res.setHeader("Content-Type", "text/html");
    return res.end(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Shorty</title>
  <style>
    body { font-family:sans-serif; max-width:600px; margin:2rem auto; }
    form { display:flex; gap:8px; margin-bottom:1rem; }
    input { flex:1; padding:6px; }
    button { padding:6px 12px; }
    li { margin:4px 0; }
  </style>
</head>
<body>
  <h1>Shorty</h1>
  <form id="f">
    <input id="url" placeholder="https://example.com" required />
    <input id="slug" placeholder="slug (optional)" />
    <button>Shorten</button>
  </form>
  <p id="msg"></p>
  <ul id="list"></ul>
  <script>
    async function load() {
      const r = await fetch("/api"); const links = await r.json();
      list.innerHTML = links.map(l => 
        \`<li><a href="/\${l.slug}">\${l.slug}</a> → \${l.url} (\${l.clicks} clicks)</li>\`
      ).join("");
    }
    f.onsubmit = async e => {
      e.preventDefault();
      const url = document.getElementById("url").value;
      const slug = document.getElementById("slug").value;
      const r = await fetch("/api", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,slug})});
      const d = await r.json();
      if(r.ok){ msg.textContent = location.origin + "/" + d.slug; url.value=""; slug.value=""; load(); }
      else msg.textContent = d.error;
    };
    load();
  </script>
</body>
</html>
    `);
  }
}
