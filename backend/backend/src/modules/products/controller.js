import * as ProductService from "./service.js";

export async function getProducts(req, res) {
    const { name } = req.validatedQuery ?? {};
    const products = await ProductService.getProducts(name);
    res.status(200).json({
        status: "success",
        data: { products },
    });
}

export async function getProduct(req, res) {
    const product = await ProductService.getProduct(req.validatedParams.id);
    res.status(200).json({
        status: "success",
        data: { product },
    });
}

export async function createProduct(req, res) {
    const product = await ProductService.createProduct(req.validatedBody);
    res.status(201).json({
        status: "success",
        data: { product },
    });
}

export async function updateProduct(req, res) {
    const product = await ProductService.updateProduct(
        req.validatedParams.id,
        req.validatedBody,
    );
    res.status(200).json({
        status: "success",
        data: { product },
    });
}

export async function editProduct(req, res) {
    const product = await ProductService.updateProduct(
        req.validatedParams.id,
        req.validatedBody,
    );
    res.status(200).json({
        status: "success",
        data: { product },
    });
}

export async function deleteProduct(req, res) {
    await ProductService.deleteProduct(req.validatedParams.id);
    res.status(200).json({
        status: "success",
        message: "Produk berhasil dihapus",
    });
}
