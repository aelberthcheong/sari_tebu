/**
 * Coba validasikan request sesuai dengan skema Joi dan attach value
 * yang telah divalidasikan ke req (misalnya req.validatedBody, req.validatedQuery).
 *
 * @param {"body" | "query" | "params"} type
 * @param {import("joi").ObjectSchema} schema
 */
export default function requireValidation(type, schema) {
    if (!["body", "query", "params"].includes(type)) {
        throw new Error(
            `Invalid validation type '${type}'. Harus berupa salah satu dari:
    - body
    - query
    - params
`,
        );
    }

    return async function (req, res, next) {
        const { value, error } = schema.validate(req[type], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) throw error;

        // Tambahkan ke property `validated-` pada request
        const key = "validated" + type.charAt(0).toUpperCase() + type.slice(1);
        req[key] = value;

        next();
    };
}
