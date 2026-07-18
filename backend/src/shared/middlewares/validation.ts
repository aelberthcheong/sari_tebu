import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type props  = "body" | "query" | "params";
type target = `validated${Capitalize<props>}`;

const propsToTarget: Record<props, target> = {
    body  : "validatedBody",
    query : "validatedQuery",
    params: "validatedParams",
}

/**
 * Coba validasikan request sesuai dengan skema Zod dan attach value
 * yang telah divalidasikan ke req (misalnya req.validatedBody, req.validatedQuery).
 */
export default function requireValidation(
    type: "body" | "query" | "params",
    schema: ZodType,
) {
    return function (req: Request, _res: Response, next: NextFunction) {
        const { data, error } = schema.safeParse(req[type]);
        if (error) {
            throw error;
        }

        // Tambahkan property validated pada request
        req[propsToTarget[type]] = data;
        next();
    };
}

requireValidation("body", {});
