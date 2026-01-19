import Address from "../models/Address.js";

// ⭐ Add Address
export const addAddress = async (req, res) => {
  try {
    const customerId = req.user._id;

    const newAddress = await Address.create({
      customerId,
      ...req.body
    });

    res.json({
      message: "Address added successfully",
      address: newAddress
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ⭐ Get all addresses of customer
export const getAddresses = async (req, res) => {
  try {
    const customerId = req.user._id;

    const addresses = await Address.find({ customerId });

    res.json(addresses);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ⭐ Update Address
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const customerId = req.user._id;

    const updated = await Address.findOneAndUpdate(
      { _id: addressId, customerId },
      req.body,
      { new: true }
    );

    res.json({
      message: "Address updated",
      address: updated
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ⭐ Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const customerId = req.user._id;

    await Address.findOneAndDelete({ _id: addressId, customerId });

    res.json({ message: "Address deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ⭐ Set Default Address
export const setDefaultAddress = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { addressId } = req.params;

    // Remove default from all
    await Address.updateMany(
      { customerId },
      { $set: { isDefault: false } }
    );

    // Set new default
    const address = await Address.findByIdAndUpdate(
      addressId,
      { isDefault: true },
      { new: true }
    );

    res.json({
      message: "Default address set",
      address
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
