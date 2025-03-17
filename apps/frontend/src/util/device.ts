import FingerprintJS from "@fingerprintjs/fingerprintjs";

/**
 * Generates a device ID using the FingerprintJS library
 * @returns {Promise<string>} The generated device ID
 */
export const getDeviceId = async () => {
  // Load the FingerprintJS agent
  const fp = await FingerprintJS.load();

  // Get the visitor identifier
  const result = await fp.get();

  // Use the fingerprint's visitorId as the device ID
  return result.visitorId;
};
