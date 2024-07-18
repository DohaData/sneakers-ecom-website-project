const { Schema, model } = require("mongoose");

const cartSchema = new Schema(
    {
        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
            },
        ],
    },
    {
        timestamps: true,
    });

const Cart = model("Cart", cartSchema);

module.exports = Cart;
