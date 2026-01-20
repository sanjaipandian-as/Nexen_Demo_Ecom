import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// 2.1 Add to Cart
export const addToCart = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId, quantity } = req.body;

    const product = await Product.findOne({ _id: productId, is_deleted: false });
    if (!product) return res.status(404).json({ message: "Product not available" });

    // ⭐ CHECK STOCK
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} pieces available in stock` });
    }

    let cart = await Cart.findOne({ customerId });

    if (!cart) {
      cart = await Cart.create({
        customerId,
        items: [{ productId, quantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex >= 0) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      await cart.save();
    }

    return res.json({ message: "Added to cart", cart });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2.2 Get Cart
export const getCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    const cart = await Cart.findOne({ customerId }).populate("items.productId");

    if (!cart) return res.json({ items: [] });

    // Filter out items with null/deleted products
    const validItems = cart.items.filter(item => item.productId !== null);

    // If any items were removed, update the cart in database
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
      console.log(`🧹 Cleaned up ${cart.items.length - validItems.length} deleted products from cart for user ${customerId}`);
    }

    return res.json({ ...cart.toObject(), items: validItems });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2.3 Update Cart
export const updateCartItem = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const product = await Product.findById(productId);
    if (!product || product.is_deleted) {
      return res.status(404).json({ message: "Product no longer available" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} pieces available in stock` });
    }

    item.quantity = quantity;
    await cart.save();

    return res.json({ message: "Quantity updated", cart });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2.4 Remove Item
export const removeCartItem = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== productId
    );

    await cart.save();

    return res.json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
