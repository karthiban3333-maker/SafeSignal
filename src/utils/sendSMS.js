export async function sendEmergencySMS(mobileNumbers, message) {
  if (!mobileNumbers || mobileNumbers.length === 0) return null;

  // Filter valid 10-digit Indian mobile numbers
  const validNumbers = mobileNumbers
    .map(n => n.replace(/\D/g, ''))
    .filter(n => n.length === 10);

  if (validNumbers.length === 0) return null;

  const apiKey = import.meta.env.VITE_FAST2SMS_KEY;
  if (!apiKey) {
    console.warn("VITE_FAST2SMS_KEY not configured. SMS notification skipped in development mode.");
    return { return: false, message: "API key not configured" };
  }

  try {
    // Using a CORS proxy because Fast2SMS blocks direct frontend browser requests
    const response = await fetch("https://corsproxy.io/?https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: "q",
        message: message,
        language: "english",
        flash: 0,
        numbers: validNumbers.join(",")
      })
    });
    return await response.json();
  } catch (err) {
    console.error("SMS send error:", err);
    return null;
  }
}
