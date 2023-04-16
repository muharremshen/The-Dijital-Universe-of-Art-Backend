const express = require("express");
const router = express.Router();

const MenuItem = require("../models/MenuItemModel");
const Category = require("../models/CategoryModel");
const PriceHistory = require("../models/PriceHistoryModel");
const MenuItemCategory = require("../models/MenuItemCategoryModel");

router.get("/", async function (req, res) {
  const menuItems = await MenuItem.find({isDeleted: false});
  return res.status(200).json(menuItems);
});

router.get("/:id", async function (req, res) {
  const menuItem = await MenuItem.findById(req.params.id).populate(Category.id);
  const categories = await MenuItemCategory.find({menuItem: menuItem.id}).populate("category");
  return res.status(200).json({...menuItem, categories});
});

router.post("/", async (req, res) => {
  try {
    const {name, description, image_url, price, categories} = req.body;

    if (!name || !image_url || !price || !categories) {
      return res.status(400).json({errors: ["name, image_url, price, and categories are required"]});
    }

    if (typeof name !== "string" || name.length < 3 || name.length > 250) {
      return res.status(400).json({errors: ["name is invalid"]});
    }

    if (description && (typeof description !== "string" || description.length < 3 || description.length > 250)) {
      return res.status(400).json({errors: ["description is invalid"]});
    }

    if (image_url && !/^https?:\/\/.+/.test(image_url)) {
      return res.status(400).json({errors: ["image_url is invalid"]});
    }

    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({errors: ["price is invalid"]});
    }

    const categoryCount = await Category.countDocuments({_id: {$in: categories}});
    if (categoryCount !== categories.length) {
      return res.status(400).json({errors: ["Some category ids are invalid"]});
    }

    const createdMenu = await MenuItem.create({name, description, image_url, price});
    await PriceHistory.create({menuItem: createdMenu._id, price: createdMenu.price});

    for (const category of categories) {
      await MenuItemCategory.findOneAndUpdate(
        {category, menuItem: createdMenu._id},
        {},
        {upsert: true, setDefaultsOnInsert: true, runValidators: true}
      );
    }

    return res.status(201).json({createdMenu});
  } catch (err) {
    return res.status(400).json({errors: ["Bad Request"]});
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const founded = await MenuItem.findById(req.params.id);

    if (!founded) {
      return res.status(404).json({errors: ["menu item _id is invalid"]});
    }

    await MenuItem.findByIdAndUpdate(founded._id, {isDeleted: true});

    return res.status(200).json({message: "Menu item deleted successfully"});
  } catch (error) {
    return res.status(400).json({errors: ["Bad Request"]});
  }
});

router.get("/:id/price-history", async (req, res) => {
  try {
    const founded = await MenuItem.findById(req.params.id);
    if (!founded) {
      return res.status(404).json({errors: ["menu item _id is invalid"]});
    }
    const priceHistory = await PriceHistory.find({founded: req.params.id});
    return res.json(priceHistory);
  } catch (err) {
    console.error(err);
    return res.status(400).json({errors: ["Bad Request"]});
  }
});

module.exports = router;
