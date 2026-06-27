import { Resend } from "resend";

// TODO(AELBERTH): Tolong refactor ini keluar dari client.js, karena ini melanggar
//                 Single-Responsibility Principle.
const formatEmailCode = (code) => {
    return code.slice(0, 4) + "-" + code.slice(4, 8);
};

// class SESClient {
//     constructor({ region, accessKeyId, secretAccessKey }) {
//         this.client = new SESv2Client({
//             region: region,
//             credentials: {
//                 accessKeyId: accessKeyId,
//                 secretAccessKey: secretAccessKey,
//             },
//         });
//     }

//     async sendEmail(source, dest, { subject, body }) {
//         try {
//             return await this.client.send(
//                 new SendEmailCommand({
//                     FromEmailAddress: source,
//                     Destination: { ToAddresses: [dest] },
//                     Content: {
//                         Simple: {
//                             Subject: {
//                                 Data: subject,
//                             },
//                             Body: {
//                                 Text: {
//                                     Data: body,
//                                 },
//                             },
//                         },
//                     },
//                 }),
//             );
//         } catch {}
//     }
// }

class ResendClient {
    constructor({ apiKey }) {
        this.client = new Resend(apiKey);
    }

    // TODO(AELBERTH): Untuk sementara error dibiarkan aja, nanti setelah implementasi log (e.g. email_log)
    //                 write ke dalam log semua yang gagal tapi jangan block ataupun crash.
    async sendEmail(source, dest, { subject, body }) {
        const { error } = await this.client.emails.send({
            from: source,
            to: [dest],
            subject: subject,
            text: body
        });

        if (error) {
            console.log(error);
        }
    }
}

class HostClient {
    async sendEmail(source, dest, { subject, body }) {
        console.log(`From: ${source}
To: ${dest}

Subject: ${subject}
Body: 
${body}`);
    }
}

export default class EmailClient {
    constructor({
        enabled,
        sourceAddress,
        apiKey
    } = {}) {
        this.client = enabled
            ? new ResendClient({
                apiKey: apiKey
              })
            : new HostClient({});
        this.address = sourceAddress;
    }

    async sendSignupCodeEmail(dest, code) {
        const subject = "Verify your account email address";
        const body = `Do not share this code with anyone. If you didn't request this, you can safely ignore this email.
Your email address verification code is: ${formatEmailCode(code)}
`;

        await this.client.sendEmail(this.address, dest, { subject, body });
    }

    async sendSignedInEmail(dest) {
        const subject = "New sign-in to your account";
        const body = `We detected a recent login to your account. If it wasn't you, please secure your account by resetting your password immediately.
`;

        await this.client.sendEmail(this.address, dest, { subject, body });
    }

    async sendPasswordResetCodeEmail(dest, code) {
        const subject = "Reset your account password";
        const body = `Do not share this code with anyone. If you didn't request this, you can safely ignore this email.
Your email address verification code is: ${formatEmailCode(code)}
`;

        await this.client.sendEmail(this.address, dest, { subject, body });
    }

    async sendPasswordUpdatedEmail(dest) {
        const subject = "Your account password was recently updated";
        const body = `Your account password was recently updated. If you did not make this change, please secure your account by resetting your password immediately.
`;

        await this.client.sendEmail(this.address, dest, { subject, body });
    }

    async sendAddressResetCodeEmail(dest, code) {
        const subject = "Verify your new account email address";
        const body = `Do not share this code with anyone. If you didn't request this, you can safely ignore this email.
Your email address verification code is: ${formatEmailCode(code)}
`;

        await this.client.sendEmail(this.address, dest, { subject, body });
    }

    async sendAddressUpdatedEmail(dest) {
        const subject = "Your account email address was recently updated";
        const body = `This email address is no longer tied to your account.
`;

        await this.client.sendEmail(this.address, dest, { subject, body });
    }
}

//     // NOTE: Email template di-create sekali dan akan di store pada SES, maka hit api yang sama
//     //       akan di-reject
//     await Promise.allSettled([
//         sesClient.client.send(
//             new CreateEmailTemplateCommand({
//                 TemplateName: "VerificationCode",
//                 TemplateContent: {
//                     Subject: `{{ subject }}`,
//                     Html: `
//                             <div>
//                                 <h2>Hi {{ username }},</h2>
//                                 <b>DO NOT SHARE</b> this code with anyone. If you didn't request this, you can safely ignore this email.
//                             </div>
//                         `,
//                     Text: "Your email address verification code is: {{ code }}",
//                 },
//             }),
//         ),
//         sesClient.client.send(
//             new CreateEmailTemplateCommand({
//                 TemplateName: "PasswordReset",
//                 TemplateContent: {
//                     Subject: `{{ subject }}`,
//                     Html: `
//                             <div>
//                                 <h2>Hi {{ username }},</h2>
//                                 <b>DO NOT SHARE</b> this code with anyone. If you didn't request this, you can safely ignore this email.
//                             </div>
//                         `,
//                     Text: "Your password reset code is: {{code}}",
//                 },
//             }),
//         ),
//         sesClient.client.send(
//             new CreateEmailTemplateCommand({
//                 TemplateName: "AddressUpdate",
//                 TemplateContent: {
//                     Subject: `{{ subject }}`,
//                     Html: `
//                             <div>
//                                 <h2>Hi {{ username }},</h2>
//                                 <b>DO NOT SHARE</b> this code with anyone. If you didn't request this, you can safely ignore this email.
//                             </div>
//                         `,
//                     Text: "Your address update code is: {{code}}",
//                 },
//             }),
//         ),
//     ]);

//     return sesClient;
// }
