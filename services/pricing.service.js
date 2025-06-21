import path from 'path';
import googleTrends from 'google-trends-api';
import { readJSON } from '../utils/fileUtils.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INVENTORY_JSON = path.join(__dirname, '../inventory.json');

let categoryTrendScores = {};

export async function fetchTrendScore(keyword) {
  try {
    const results = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      geo: '',
    });
    const data = JSON.parse(results);
    if (!data.default || !data.default.timelineData) return 0;
    const scores = data.default.timelineData.map((d) => d.value[0]);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avgScore;
  } catch (err) {
    console.error('Google Trends fetch error:', err);
    return 0;
  }
}

export async function updateCategoryTrends() {
  try {
    const inventory = await readJSON(INVENTORY_JSON);
    const categories = [...new Set(inventory.map((item) => item.product_category))];
    for (const cat of categories) {
      const score = await fetchTrendScore(cat);
      categoryTrendScores[cat] = score;
    }
    console.log('Updated Google Trends scores:', categoryTrendScores);
  } catch (e) {
    console.error('Error updating trends:', e);
  }
}

export function getDynamicPrice(basePrice, sellingPrice, trendScore) {
  const maxDiscountPercent = 0.20;
  const factor = trendScore / 100;
  const trendDiscount = maxDiscountPercent * factor;
  const minDiscount = 0.01;
  const effectiveDiscount = Math.max(minDiscount, trendDiscount);

  let dynamicPrice = sellingPrice * (1 - effectiveDiscount);
  if (dynamicPrice < basePrice) dynamicPrice = basePrice;

  return parseFloat(dynamicPrice.toFixed(2));
}

export function getDynamicPriceAlt(sellingPrice, trendScore, basePrice = 0) {
  const maxDiscountPercent = 0.20;
  const factor = trendScore / 100;
  const trendDiscount = maxDiscountPercent * factor;
  const minDiscount = 0.01;
  const effectiveDiscount = Math.max(minDiscount, trendDiscount);

  let dynamicPrice = sellingPrice * (1 - effectiveDiscount);
  if (dynamicPrice < basePrice) dynamicPrice = basePrice;

  return parseFloat(dynamicPrice.toFixed(2));
}

export function getDiscountPercent(sellingPrice, dynamicPrice) {
  if (!sellingPrice || !dynamicPrice || dynamicPrice >= sellingPrice) return 0;
  return Math.round(((sellingPrice - dynamicPrice) / sellingPrice) * 100);
}

export { categoryTrendScores };
