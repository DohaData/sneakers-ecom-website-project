const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        cart: {
            type: Schema.Types.ObjectId,
            ref: "Cart",
            required: true,
        },
        status: {
            type: String,
            enum: ["SUBMITTED", "SHIPPING", "DONE"],
            required: true,
            default: "SUBMITTED",
        },
        shippingAddress: {
            type: Schema.Types.ObjectId,
            ref: "Address",
            required: true,
        },
        estimatedDelivery: {
            type: Date,
            required: true,
        }, 
    },
    {
        timestamps: true,
    });

const Order = model("Order", orderSchema);

module.exports = Order;
