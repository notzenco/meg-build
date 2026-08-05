import { createPrivateKey, sign } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const required = [
  "APP_STORE_CONNECT_API_KEY",
  "APP_STORE_CONNECT_API_KEY_ID",
  "APP_STORE_CONNECT_ISSUER_ID",
  "IOS_BUNDLE_ID",
  "IOS_WIDGET_BUNDLE_ID",
  "OUTPUT_DIR",
];

for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing release configuration: ${name}`);
}

const encode = (value) => Buffer.from(value).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const header = encode(JSON.stringify({
  alg: "ES256",
  kid: process.env.APP_STORE_CONNECT_API_KEY_ID,
  typ: "JWT",
}));
const payload = encode(JSON.stringify({
  iss: process.env.APP_STORE_CONNECT_ISSUER_ID,
  iat: now - 30,
  exp: now + 600,
  aud: "appstoreconnect-v1",
}));
const unsignedToken = `${header}.${payload}`;
const signature = sign("sha256", Buffer.from(unsignedToken), {
  key: createPrivateKey(process.env.APP_STORE_CONNECT_API_KEY),
  dsaEncoding: "ieee-p1363",
});
const token = `${unsignedToken}.${signature.toString("base64url")}`;

async function request(path, options = {}) {
  const response = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body.errors?.[0]?.title ?? `HTTP ${response.status}`;
    throw new Error(`Apple API request failed for ${path}: ${detail}`);
  }
  return response.status === 204 ? null : response.json();
}

async function bundleId(identifier) {
  const query = new URLSearchParams({ "filter[identifier]": identifier, limit: "1" });
  const response = await request(`/v1/bundleIds?${query}`);
  const match = response.data?.find((item) => item.attributes?.identifier === identifier);
  if (!match) throw new Error(`Apple bundle ID is not registered: ${identifier}`);
  return match.id;
}

async function ensureICloud(bundleIdResourceId) {
  const response = await request(`/v1/bundleIds/${bundleIdResourceId}/bundleIdCapabilities`);
  if (response.data?.some((item) => item.attributes?.capabilityType === "ICLOUD")) return;

  await request("/v1/bundleIdCapabilities", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "bundleIdCapabilities",
        attributes: { capabilityType: "ICLOUD" },
        relationships: {
          bundleId: { data: { type: "bundleIds", id: bundleIdResourceId } },
        },
      },
    }),
  });
}

async function distributionCertificateId() {
  const query = new URLSearchParams({
    "filter[certificateType]": "DISTRIBUTION",
    limit: "200",
  });
  const response = await request(`/v1/certificates?${query}`);
  const active = (response.data ?? [])
    .filter((item) => new Date(item.attributes?.expirationDate).getTime() > Date.now())
    .sort((a, b) => new Date(b.attributes.expirationDate) - new Date(a.attributes.expirationDate));
  if (!active[0]) throw new Error("No active Apple Distribution certificate was found.");
  return active[0].id;
}

async function profileContent(name, bundleIdResourceId, certificateId) {
  const query = new URLSearchParams({
    "filter[name]": name,
    "filter[profileState]": "ACTIVE",
    limit: "1",
  });
  const existing = await request(`/v1/profiles?${query}`);
  if (existing.data?.[0]?.attributes?.profileContent) {
    return existing.data[0].attributes.profileContent;
  }

  const created = await request("/v1/profiles", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "profiles",
        attributes: { name, profileType: "IOS_APP_STORE" },
        relationships: {
          bundleId: { data: { type: "bundleIds", id: bundleIdResourceId } },
          certificates: { data: [{ type: "certificates", id: certificateId }] },
        },
      },
    }),
  });
  return created.data.attributes.profileContent;
}

const mainBundleId = await bundleId(process.env.IOS_BUNDLE_ID);
const widgetBundleId = await bundleId(process.env.IOS_WIDGET_BUNDLE_ID);
await ensureICloud(mainBundleId);
const certificateId = await distributionCertificateId();
const mainProfile = await profileContent("Meg App Store CI", mainBundleId, certificateId);
const widgetProfile = await profileContent(
  "Meg Widgets App Store CI",
  widgetBundleId,
  certificateId,
);

await mkdir(process.env.OUTPUT_DIR, { recursive: true });
await writeFile(join(process.env.OUTPUT_DIR, "meg.mobileprovision"), Buffer.from(mainProfile, "base64"));
await writeFile(
  join(process.env.OUTPUT_DIR, "meg-widget.mobileprovision"),
  Buffer.from(widgetProfile, "base64"),
);
console.log("Prepared fresh Apple distribution profiles for the app and widget.");
