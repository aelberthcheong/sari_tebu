export const ValidationType = Object.freeze({
    PAYLOAD: "body",
    BODY: "body",
    QUERY: "query",
    PARAMS: "params",
});

/**
 * @param {string} type
 * @param {import("joi").ObjectSchema} schema
 */
export default function requireValidation(
    type = ValidationType.PAYLOAD,
    schema,
) {
    //@ts-ignore
    return function (req, res, next) {
        const { value, error } = schema.validate(req[type], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) throw error;

        const key = "validated" + type.charAt(0).toUpperCase() + type.slice(1);
        req[key] = value;

        next();
    };
}
