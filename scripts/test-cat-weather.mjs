import { initializeBuiltInTools } from '../dist/chunk-QLA3CLCH.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const registry = initializeBuiltInTools();

async function run() {
  console.log('\n=== CAT IMAGES TEST ===');
  const catRes = await registry.executeTool('random-cat-images', { count: 1, size: 'small' });
  console.log(catRes.data || catRes.error || catRes);

  console.log('\n=== WEATHER TEST (may need API key) ===');
  const weatherRes = await registry.executeTool('get-weather', { location: 'London', includeforecast: false });
  console.log(weatherRes.message || weatherRes.error);
}

run().catch(e => console.error(e));
