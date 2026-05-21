const COUNTER_NAMESPACE = "thecalderathrone.com";
const COUNTER_BASE_URL = `https://api.counterapi.dev/v1/${encodeURIComponent(COUNTER_NAMESPACE)}`;
const ALLOWED_COUNTERS = new Set([
  "unique-homepage-visitors",
  "homepage-session-visits"
]);
const FALLBACK_COUNTS = {
  "unique-homepage-visitors": 38,
  "homepage-session-visits": 47
};

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8"
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers
  });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const counterName = (url.searchParams.get("name") || "").trim();
  const action = (url.searchParams.get("action") || "").trim();

  if (!ALLOWED_COUNTERS.has(counterName)) {
    return jsonResponse(400, { error: "Unsupported counter" });
  }

  if (action && action !== "up") {
    return jsonResponse(400, { error: "Unsupported action" });
  }

  const path = action === "up"
    ? `${encodeURIComponent(counterName)}/up`
    : `${encodeURIComponent(counterName)}/`;

  try {
    const response = await fetch(`${COUNTER_BASE_URL}/${path}`, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return jsonResponse(200, {
        name: counterName,
        count: FALLBACK_COUNTS[counterName],
        fallback: true
      });
    }

    const payload = await response.json();
    const count = Number(payload && payload.count);

    return jsonResponse(200, {
      name: counterName,
      count: Number.isFinite(count) && count >= 0 ? count : 0
    });
  } catch (error) {
    return jsonResponse(502, { error: "Counter unavailable" });
  }
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers
  });
}
