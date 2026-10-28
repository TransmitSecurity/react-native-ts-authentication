export default {
    clientId: "REPLACE_WITH_CLIENT_ID",
    domain: "REPLACE_WITH_DOMAIN",
    secret: "REPLACE_WITH_SECRET", // Important! This is just for demo purposes. Never store your secret in the client side.
    baseUrl: "https://api.transmitsecurity.io", // eu = "api.eu.transmitsecurity.io" ca = "api.ca.transmitsecurity.io"
    // Optional: custom WebAuthn API paths, e.g. { startRegistration: "/my/start-registration", startAuthentication: "/my/start-authentication" }
    webAuthnApiPaths: null as { startRegistration: string, startAuthentication: string } | null,
}