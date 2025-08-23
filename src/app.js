// src/app.js

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TABLE_NAME = 'urls';

// Use JS fetch to interact with Supabase REST
function generateShort(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

async function saveUrl(longUrl) {
  const short = generateShort();
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ long: longUrl, short }),
  });
  const data = await resp.json();
  if (data && data[0]) {
    return data;
  }
  throw new Error('Failed to shorten URL');
}

document.getElementById('shortener-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const urlInput = document.getElementById('long-url');
  const longUrl = urlInput.value.trim();
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = 'Working...';

  try {
    const { short } = await saveUrl(longUrl);
    // Short URLs as: https://YOUR_DOMAIN/{short}
    const shortUrl = `${window.location.origin}/${short}`;
    resultDiv.innerHTML = `Short URL: <a href="${shortUrl}" target="_blank">${shortUrl}</a>`;
  } catch (err) {
    resultDiv.textContent = 'Error: ' + err.message;
  }
});
