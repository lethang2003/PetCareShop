import { getClinicById } from "./clinic.controller";
import { Request, Response } from "express";
import Product from "../models/product.model";
import mongoose from "mongoose";
import clinicModel from "../models/clinic.model";

// Tạo sản phẩm (cho một phòng khám)
export const createProductByClinic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const image = req.file?.path;
    const productData = JSON.parse(req.body.productData);
    const clinic = await clinicModel.findOne({
      name: productData.clinicName,
    });
    console.log(clinic);

    console.log(productData.clinicName);

    if (!clinic) {
      res.status(404).json({
        message: "Clinic not found",
        success: false,
        error: true,
      });
      return;
    }
    const new_product = new Product({
      clinicId: clinic._id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stockQuantity: productData.stockQuantity,
      category: productData.category,
      image: image,
    });
    await new_product.save();
    res.status(201).json({
      message: "Create product successfully",
      success: true,
      error: false,
      data: new_product,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create product",
      success: false,
      error: true,
    });
  }
};

// Lấy tất cả sản phẩm của clinic
export const getProductsByClinic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // const { clinicId } = req.params;
    const products = await Product.find().populate("clinicId", "name");
    res.json({
      message: "Get products of clinic successfully",
      success: true,
      error: false,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
      success: false,
      error: true,
    });
  }
};

export const getProductsByClinicbyID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productID = req.params.id;
    console.log(productID);
    
    const products = await Product.findOne({
      _id: productID,
    }).populate("clinicId", "name");
    res.json({
      message: "Get products of clinic successfully",
      success: true,
      error: false,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
      success: false,
      error: true,
    });
  }
};

export const getProductsByCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const nameProduct = req.params.nameProduct;
    console.log(nameProduct);
    const getClinicById = await clinicModel.findOne({
      name: nameProduct,
    });
    // console.log(getClinicById?._id);

    const products = await Product.find({
      clinicId: getClinicById?._id,
    }).populate("clinicId", "name");
    console.log(products);

    res.json({
      message: "Get products of clinic successfully",
      success: true,
      error: false,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
      success: false,
      error: true,
    });
  }
};

// Lấy chi tiết 1 sản phẩm của clinic
export const getProductByIdForClinic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clinicId, productId } = req.params;
    const product = await Product.findOne({ _id: productId, clinicId });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({
      message: "Get product successfully",
      success: true,
      error: false,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get product",
      success: false,
      error: true,
    });
  }
};

// Cập nhật sản phẩm của clinic
export const updateProductByClinic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const image = req.file?.path;
    const productData = req.body;
    console.log(productData);

    const updateData = { ...productData };
    if (image) {
      updateData.image = image;
    }
    const productId = new mongoose.Types.ObjectId(req.params.productId);
    const product = await Product.findOne({
      _id: productId,
    });
    if (!product) {
      res.status(404).json({
        message: "Product not found",
        success: false,
        error: true,
      });
      return;
    }
    const cili = await clinicModel.findOne({
      name: productData.clinicName,
    });
    product.name = productData.name || product.name;
    if (cili?._id) {
      product.clinicId = new mongoose.Types.ObjectId(cili._id.toString());
    }
    product.description = productData.description || product.description;
    product.price = productData.price || product.price;
    product.stockQuantity = productData.stockQuantity || product.stockQuantity;
    product.category = productData.category || product.category;
    product.image = image || product.image;
    const saveProduct = await product.save();
    res.status(200).json({
      message: "Update product successfully",
      success: true,
      error: false,
      data: saveProduct,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update product",
      success: false,
      error: true,
    });
  }
};

// Xoá sản phẩm của clinic
export const deleteProductByClinic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    const deletedProduct = await Product.findOneAndDelete({
      _id: productId,
    });
    if (!deletedProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({
      message: "Delete product successfully",
      success: true,
      error: false,
      data: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      success: false,
      error: true,
    });
  }
};
//thay doi status
export const changeProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { active } = req.body;

    if (typeof active !== "boolean") {
      res.status(400).json({
        message: "`active` must be boolean (true or false)",
        success: false,
        error: true,
      });
      return;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { active },
      { new: true }
    );

    if (!updatedProduct) {
      res.status(404).json({
        message: "Product not found",
        success: false,
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: `Product status updated to ${active ? "active" : "inactive"}`,
      success: true,
      error: false,
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change product status",
      success: false,
      error: true,
    });
  } 
};