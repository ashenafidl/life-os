import { Bonjour } from "bonjour-service";

declare global {
  // Prevents publishing twice if this module gets re-evaluated during
  // dev-mode hot reloads without a full process restart.
  var __bonjourPublished: boolean | undefined;
}

if (!globalThis.__bonjourPublished) {
  const bonjour = new Bonjour();
  const port = Number(process.env.PORT) || 3131;

  bonjour.publish({
    name: "SMS Sync Server",
    type: `${process.env.NODE_ENV === "development" ? "dev-" : ""}sms-sync`, // advertised as _sms-sync._tcp.local
    port,
    disableIPv6: true,
  });

  globalThis.__bonjourPublished = true;

  // Clean up the mDNS record on shutdown so it doesn't linger on the
  // network after the process exits.
  const shutdown = () => {
    bonjour.unpublishAll(() => bonjour.destroy());
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  // oxlint-disable-next-line no-console
  console.log(
    `[mdns] Advertising as _${process.env.NODE_ENV === "development" ? "dev-" : ""}sms-sync._tcp.local on port ${port}`,
  );
}
