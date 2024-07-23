const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Product = require("../models/Product.model");
const User = require("../models/User.model");

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sneakers-ecom-website-project";

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    seedData();
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Seed data function
async function seedData() {
  try {
    // Create a sample user
    const users = [
      {
        email: "john@example.com",
        password: await bcrypt.hash("password123", 10),
        isSignedUp: true,
        isAdmin: true,
      },
      {
        email: "jane@example.com",
        password: await bcrypt.hash("password456", 10),
        isSignedUp: true,
        isAdmin: false,
      },
      {
        email: "guest@example.com",
        isSignedUp: false,
      },
      // Add more users here
    ];

    await User.insertMany(users);

    const products = [
      {
        name: "Nike Air Max 90",
        price: 120.0,
        description: "Iconic silhouette with visible Air cushioning.",
        stock: 15,
        imageUrl:
          "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dwbca264dd/images/hi-res/001516889_101.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Air Max 90",
        brand: "Nike",
        color: "White",
      },
      {
        name: "Adidas Superstar",
        price: 85.0,
        description: "Classic shell-toe design.",
        stock: 20,
        imageUrl: "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw5eeb7017/images/hi-res/001465308_101.png?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [7, 8, 9, 10],
        model: "Superstar",
        brand: "Adidas",
        color: "White",
      },
      {
        name: "Converse Chuck Taylor All Star",
        price: 60.0,
        description: "Timeless high-top design.",
        stock: 25,
        imageUrl:
          "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw5fc0187b/images/hi-res/001498562_101.png?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [7, 8, 9, 10, 11],
        model: "Chuck Taylor All Star",
        brand: "Converse",
        color: "Black",
      },
      {
        name: "Vans Old Skool",
        price: 65.0,
        description: "Iconic side stripe and durable design.",
        stock: 18,
        imageUrl: "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw807714cf/images/hi-res/001377329_101.png?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Old Skool",
        brand: "Vans",
        color: "Black",
      },
      {
        name: "Air Jordan 1",
        price: 150.0,
        description: "The shoe that started it all.",
        stock: 10,
        imageUrl:
          "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw22d68554/images/hi-res/001515410_101.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10],
        model: "Air Jordan 1",
        brand: "Jordan",
        color: "Red/Black",
      },
      {
        name: "Nike Air Force 1",
        price: 90.0,
        description: "Legendary design with Air cushioning.",
        stock: 20,
        imageUrl:
          "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dwf45d9dcd/images/hi-res/001198486_001.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Air Force 1",
        brand: "Nike",
        color: "White",
      },
      {
        name: "Adidas Stan Smith",
        price: 75.0,
        description: "Minimalist tennis shoe.",
        stock: 22,
        imageUrl: "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dwaf693623/images/hi-res/001489717_101.png?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [7, 8, 9, 10],
        model: "Stan Smith",
        brand: "Adidas",
        color: "White/Green",
      },
      {
        name: "Reebok Classic Leather",
        price: 75.0,
        description: "Clean and classic design.",
        stock: 15,
        imageUrl: "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw7413da11/images/hi-res/001497942_101.png?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Classic Leather",
        brand: "Reebok",
        color: "White",
      },
      {
        name: "Puma Suede Classic",
        price: 70.0,
        description: "Retro style with a suede upper.",
        stock: 18,
        imageUrl:
          "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dwee918678/images/hi-res/001514767_101.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Suede Classic",
        brand: "Puma",
        color: "Black",
      },
      {
        name: "New Balance 574",
        price: 80.0,
        description: "Classic design with modern comfort.",
        stock: 15,
        imageUrl: "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw625d9468/images/hi-res/001514712_101.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "574",
        brand: "New Balance",
        color: "Grey",
      },
      {
        name: "Asics Gel-Lyte III",
        price: 100.0,
        description: "Split tongue design with gel cushioning.",
        stock: 12,
        imageUrl:
          "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dwcdd5987a/images/hi-res/001519348_101.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Gel-Lyte III",
        brand: "Asics",
        color: "Black",
      },
      {
        name: "Nike Blazer Mid",
        price: 100.0,
        description: "Vintage basketball style.",
        stock: 14,
        imageUrl:
          "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw519d67b0/images/hi-res/001466939_101.png?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Blazer Mid",
        brand: "Nike",
        color: "White",
      },
      {
        name: "Adidas NMD_R1",
        price: 140.0,
        description: "Modern design with Boost cushioning.",
        stock: 12,
        imageUrl: "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw4b19059d/images/hi-res/1631363-62be8fe59d9cb.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "NMD_R1",
        brand: "Adidas",
        color: "Black",
      },
      {
        name: "Vans Sk8-Hi",
        price: 70.0,
        description: "High-top design with a durable upper.",
        stock: 20,
        imageUrl: "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw464934af/images/hi-res/001209759_101.png?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Sk8-Hi",
        brand: "Vans",
        color: "Black",
      },
      {
        name: "Air Jordan 4",
        price: 190.0,
        description: "Classic Jordan design with mesh detailing.",
        stock: 8,
        imageUrl:
          "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw3a7becfe/images/hi-res/001516647_101.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [9, 10, 11],
        model: "Air Jordan 4",
        brand: "Jordan",
        color: "White/Black",
      },
      {
        name: "Nike Dunk Low",
        price: 100.0,
        description: "Classic basketball silhouette.",
        stock: 15,
        imageUrl:
          "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dwe137876f/images/hi-res/001488292_101.png?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Dunk Low",
        brand: "Nike",
        color: "Black/White",
      },
      {
        name: "Adidas Ultraboost 21",
        price: 180.0,
        description: "Maximum comfort with Boost cushioning.",
        stock: 10,
        imageUrl: "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dwdfbf5b87/images/hi-res/3366273-6360d48d5a720.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Ultraboost 21",
        brand: "Adidas",
        color: "White",
      },
      {
        name: "Puma Future Rider",
        price: 80.0,
        description: "Retro style with modern comfort.",
        stock: 15,
        imageUrl:
          "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw6f48cac6/images/hi-res/001506837_101.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Future Rider",
        brand: "Puma",
        color: "Black",
      },
      {
        name: "Reebok Club C 85",
        price: 70.0,
        description: "Clean and classic tennis style.",
        stock: 18,
        imageUrl: "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dw7791b353/images/hi-res/001434552_101.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "Club C 85",
        brand: "Reebok",
        color: "White",
      },
      {
        name: "New Balance 990v5",
        price: 175.0,
        description: "Premium materials and comfort.",
        stock: 10,
        imageUrl:
          "https://www.courir.com/dw/image/v2/BCCL_PRD/on/demandware.static/-/Sites-master-catalog-courir/default/dwa94dbeb7/images/hi-res/001511178_101.jpg?sw=600&sh=600&sm=fit&q=90&frz-v=41",
        availableSizes: [8, 9, 10, 11],
        model: "990v5",
        brand: "New Balance",
        color: "Grey",
      },
    ];

    await Product.insertMany(products);

    console.log("Data seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}
