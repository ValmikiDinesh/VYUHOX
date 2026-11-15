/**
 * CommercialVisualCatalog.js
 * Proxy wrapper pointing to CommercialVisualSynthesizer
 */

import { CommercialVisualSynthesizer, CommercialVisualCatalog as CatalogAlias } from './CommercialVisualSynthesizer.js';

export { CommercialVisualSynthesizer };
export const CommercialVisualCatalog = CatalogAlias;
export default CommercialVisualSynthesizer;
