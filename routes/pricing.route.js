import { Router } from 'express';
import path from 'path';
import { readJSON } from '../utils/fileUtils.js';
import {
  categoryTrendScores,
  getDynamicPriceAlt,
  getDiscountPercent,
} from '../services/pricing.service.js';

const router = Router();
const INVENTORY_JSON = path.join(process.cwd(), 'inventory.json');

router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const inventory = await readJSON(INVENTORY_JSON);
    const product = inventory.find((p) => p.product_id === id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const basePrice = parseFloat(product.base_price) || 0;
    const sellingPrice = parseFloat(product.selling_price) || 0;
    const trendScore = categoryTrendScores[product.product_category] || 0;

    const dynamicPrice = getDynamicPriceAlt(sellingPrice, trendScore, basePrice);
    const discountPercent = getDiscountPercent(sellingPrice, dynamicPrice);

    res.json({
      basePrice: sellingPrice.toFixed(2),
      finalPrice: dynamicPrice.toFixed(2),
      discountPercent,
    });
  } catch (err) {
    console.error('Error in /api/pricing/:id', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
