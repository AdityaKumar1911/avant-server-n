const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }], // Array of image paths (from file upload)
  sizes: [{ type: String }], // Sizes array
  colors: [{ type: String }], // Colors array
  price: { type: Number, required: true },
  
  // productInfo as an object instead of an array
  productInfo: {
    material: { type: String, required: true },
    weight: { type: String, required: true },
    countryOfOrigin: { type: String, required: true },
    dimensions: { type: String, required: true },
    type: { type: String, required: true },
  },
  
  shippingAndReturns: { type: String }, // Shipping & return information
}, { timestamps: true }); // Optional: Adding timestamps (createdAt, updatedAt)

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
