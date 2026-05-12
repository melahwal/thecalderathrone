const COUNTER_NAMESPACE = "thecalderathrone";
const COUNTER_BASE_URL = `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}`;

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const rawName = typeof params.name === "string" ? params.name.trim() : "";
  const rawAction = typeof params.action === "string" ? params.action.trim() : "";

  if (!rawName) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({ error: "Missing counter name." })
    };
  }

  if (rawAction && rawAction !== "up") {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({ error: "Unsupported counter action." })
    };
  }

  const counterPath = rawAction
    ? `${encodeURIComponent(rawName)}/${encodeURIComponent(rawAction)}/`
    : `${encodeURIComponent(rawName)}/`;

  try {
    const response = await fetch(`${COUNTER_BASE_URL}/${counterPath}`, {
      headers: {
        Accept: "application/json"
      }
    });
    const body = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({ error: "Counter proxy request failed." })
    };
  }
};
