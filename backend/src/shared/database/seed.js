import { parseArgs } from "node:util";
import * as UserService from "#/modules/users/service.js";

if (process.env.NODE_ENV !== "production") {
    await import("dotenv/config");
}

async function main() {
    const { values } = parseArgs({
        options: {
            environment: { type: "string" }
        }
    });

    // TODO(AELBERTH): add proper seeding
    try {
        switch (values.environment) {
            case "development": {
                await UserService.createUser({
                    username: "admin",
                    emailAddress: "admin@example.test",
                    password: "admin"
                });
                break;
            }

            case "production": {
                await UserService.createUser({
                    username: process.env.ADMIN_USERNAME,
                    emailAddress: process.env.ADMIN_EMAIL,
                    password: process.env.ADMIN_PASSWORD
                });
                break;
            }

            default: {
                console.log("invalid --environment option");
                process.exit(1);
            }
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Seeding --environment=${values.environment} ran successfully`);
    process.exit(0);
}

if (import.meta.main) {
    await main();
}