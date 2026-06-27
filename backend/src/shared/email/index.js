import EmailClient from "./client.js";

export default new EmailClient({
    enabled: Number(process.env.USE_EMAIL_PROVIDER),
    sourceAddress: process.env.EMAIL_ADDRESS_SOURCE,
    apiKey: process.env.EMAIL_PROVIDER_API_KEY
});
