export function getApiBaseUrl(): string {
  const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL ?? "http";
  const host = process.env.NEXT_PUBLIC_API_HOST ?? "localhost";
  const port = process.env.NEXT_PUBLIC_API_PORT;

  // ポートが標準なら省略する
  const showPort =
    (protocol === "http" && port && port !== "80") ||
    (protocol === "https" && port && port !== "443");
  console.log(`${protocol}://${host}${showPort ? `:${port}` : ""}`);
  return `${protocol}://${host}${showPort ? `:${port}` : ""}`;
}
