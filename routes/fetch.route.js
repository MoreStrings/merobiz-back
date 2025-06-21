import { Router } from 'express';
import path from 'path';
import { readJSON } from '../utils/fileUtils.js';
import {
  categoryTrendScores,
  getDynamicPrice,
  getDiscountPercent,
} from '../services/pricing.service.js';

const router = Router();
const INVENTORY_JSON = path.join(process.cwd(), 'inventory.json');

router.get('/', async (req, res) => {
  try {
    const inventory = await readJSON(INVENTORY_JSON);
    const products = inventory.map((item) => {
      const basePrice = parseFloat(item.base_price) || 0;
      const sellingPrice = parseFloat(item.selling_price) || 0;
      const trendScore = categoryTrendScores[item.product_category] || 0;
      const dynamicPrice = getDynamicPrice(basePrice, sellingPrice, trendScore);
      const discountPercent = getDiscountPercent(sellingPrice, dynamicPrice);

      return {
        ...item,
        dynamicPrice,
        discountPercent,
      };
    });
    res.json({ products });
  } catch (err) {
    console.error('Error loading products:', err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

export default router