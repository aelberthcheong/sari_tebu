import ClientError from "../../shared/exceptions/client_error.js";
import ProductRepository from "./repository.js";

export async function getProducts(req, res) {
    const products = await ProductRepository.getAll();
    res.status(200).json({
        status: "success",
        data: { products },
    });
}

export async function getProduct(req, res) {
    const product = await ProductRepository.getById(req.params.id);
    if (!product) throw ClientError.notFound();

    res.status(200).json({
        status: "success",
        data: { product },
    });
}

export async function createProduct(req, res) {
    const product = await ProductRepository.createProduct(req.body);
    res.status(201).json({
        status: "success",
        data: { product },
    });
}

export async function updateProduct(req, res) {
    const product = await ProductRepository.updateProduct(
        req.params.id,
        req.body,
    );
    if (!product) throw ClientError.notFound();

    res.status(200).json({
        status: "success",
        data: { product },
    });
}

export async function deleteProduct(req, res) {
    const ok = await ProductRepository.deleteProduct(req.params.id);
    if (!ok) throw ClientError.notFound();

    res.status(200).json({
        status: "success",
    });
}
