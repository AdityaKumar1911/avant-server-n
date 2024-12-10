const Product = require("../models/productModel");

// Add a new product
const addProduct = async (req, res) => {
  try {
    // Get uploaded image paths
    const imagePaths = req.files.map((file) => file.path);

    // Get other product details from the request body
    const {
      name,
      description,
      sizes,
      colors,
      price,
      productInfo,
      shippingAndReturns,
    } = req.body;

    // Create a new product document
    const newProduct = new Product({
      name,
      description,
      images: imagePaths, // Store the uploaded image paths
      sizes: JSON.parse(sizes), // Convert sizes to an array
      colors: JSON.parse(colors), // Convert colors to an array
      price,
      productInfo: JSON.parse(productInfo), // Parse productInfo object
      shippingAndReturns,
    });

    // Save the new product to the database
    await newProduct.save();

    // Send response
    res.status(201).json({
      message: "Product added successfully!",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Get a product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from request params
  const updatedData = req.body; // Get updated data from the request body
  const updatedImages = req.files; // Get the uploaded images (if any)

  try {
    // If images are uploaded, update the images array
    if (updatedImages && updatedImages.length > 0) {
      updatedData.images = updatedImages.map((file) => file.filename);
    }

    // Find the product by ID and update it
    const product = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

// Get all images of a product by ID
const getProductImagesById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      images: product.images,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product images", error });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductImagesById
};
