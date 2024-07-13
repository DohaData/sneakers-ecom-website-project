const { Schema, model } = require("mongoose");

const addressSchema = new Schema(
    {
        houseNumber: {
            type: String,
            required: true,
        },
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        zip: {
            type: Number,
            required: true,
        },
        additionalInfo: {
            type: String,
        },
    },
    {
        timestamps: true,
    });