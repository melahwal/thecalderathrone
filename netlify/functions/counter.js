const COUNTER_NAMESPACE = "thecalderathrone.com";
const COUNTER_BASE_URL = `https://api.counterapi.dev/v1/${encodeURIComponent(COUNTER_NAMESPACE)}`;
const ALLOWED_COUNTERS = new Set([
  "unique-homepage-visitors",
  "homepage-session-visits"
]);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const params = event.queryStringParameters || {};
  const counterName = typeof params.name === "string" ? params.name.trim() : "";
  const action = typeof params.action === "string" ? params.action.trim() : "";

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
    const text = await response.text();

    if (!response.ok) {
      return jsonResponse(response.status, { error: "Counter request failed" });
    }

    const payload = JSON.parse(text);
    const count = Number(payload && payload.count);

    return jsonResponse(200, {
      name: counterName,
      count: Number.isFinite(count) && count >= 0 ? count : 0
    });
  } catch (error) {
    return jsonResponse(502, { error: "Counter unavailable" });
  }
};

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(payload)
  };
}
