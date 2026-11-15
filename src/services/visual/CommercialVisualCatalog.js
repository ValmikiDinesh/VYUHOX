/**
 * CommercialVisualCatalog.js
 * World-Class Strategic Commercial Visual Synthesizer & High-Resolution Asset Catalog
 * 
 * CORE PRINCIPLE:
 * Ad copy carries the strategic hook, headline, and offer.
 * The Visual Creative MUST showcase the tangible product or experiential service outcome
 * in an ultra-high-desire, award-winning commercial aesthetic with ZERO text overlays.
 */

export class CommercialVisualCatalog {
  /**
   * Curated high-resolution royalty-free commercial photography library by vertical.
   * Used as instantaneous, zero-latency, rate-limit-proof visual assets.
   */
  static CURATED_COMMERCIAL_ASSETS = {
    WEDDING_AND_STATIONERY: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85', // Luxury paper stationery flat-lay
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85', // Royal wedding floral & invite setting
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85', // Elegant wedding celebration couple & atmosphere
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=85', // Luxury bridal hands & golden invitation
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85', // Gold rings, calligraphy, luxury stationery
    ],
    SUNGLASSES_AND_EYEWEAR: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85', // Luxury sunglasses close-up with golden reflections
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1200&q=85', // Model wearing sunglasses in sunlit Mediterranean setting
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=85', // Premium polarized eyewear on marble stone
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1200&q=85', // Minimalist fashion eyewear editorial
    ],
    FASHION_AND_LUXURY: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85', // Editorial fashion model luxury lighting
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85', // Luxury boutique retail setting
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85', // High-fashion editorial color palette
    ],
    SAAS_TECH_AND_GROWTH: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=85', // Sunlit modern architectural office
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85', // Creative team collaborating in modern workspace
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85', // Clean laptop dashboard analytics, natural light
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85', // Executive reviewing growth roadmap on tablet
    ],
    PROFESSIONAL_SERVICES: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85', // Confident modern business professional
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85', // Modern glass architectural tower at dusk
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=85', // Elegant boardroom desk with architectural blueprints
    ],
    REAL_ESTATE_AND_HOMES: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85', // Luxury modern villa with infinity pool at twilight
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85', // Architectural interior living room, warm sunlight
    ],
    FOOD_AND_HOSPITALITY: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85', // Elegant dining ambiance
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85', // Artisanal culinary presentation
    ],
  };

  /**
   * Detects industry category from raw business strings
   */
  static categorizeVertical(businessText = '') {
    const text = (businessText || '').toLowerCase();
    if (/wedding|invite|invitation|stationery|event|matrimony|bridal|cards/i.test(text)) {
      return 'WEDDING_AND_STATIONERY';
    }
    if (/sunglass|eyewear|shades|spectacles|frames|optics/i.test(text)) {
      return 'SUNGLASSES_AND_EYEWEAR';
    }
    if (/fashion|clothing|apparel|jewelry|luxury|boutique|perfume|cosmetics/i.test(text)) {
      return 'FASHION_AND_LUXURY';
    }
    if (/real estate|property|villa|realtor|homes|architecture/i.test(text)) {
      return 'REAL_ESTATE_AND_HOMES';
    }
    if (/food|restaurant|cafe|culinary|dining|catering|bakery/i.test(text)) {
      return 'FOOD_AND_HOSPITALITY';
    }
    if (/saas|software|platform|automation|ai|tech|crm|app|dev/i.test(text)) {
      return 'SAAS_TECH_AND_GROWTH';
    }
    return 'PROFESSIONAL_SERVICES';
  }

  /**
   * Retrieves a high-converting, curated commercial photo for the specific business vertical
   */
  static getCuratedAsset(businessText = '', index = 0) {
    const vertical = this.categorizeVertical(businessText);
    const list = this.CURATED_COMMERCIAL_ASSETS[vertical] || this.CURATED_COMMERCIAL_ASSETS.PROFESSIONAL_SERVICES;
    return list[Math.abs(index) % list.length];
  }

  /**
   * Synthesizes a world-class, product-centric visual prompt strictly with zero text overlays.
   */
  static synthesizeProductVisualPrompt({
    companyName = '',
    industry = '',
    productFocus = '',
    variationIndex = 0,
    platform = 'META_FEED',
  }) {
    const vertical = this.categorizeVertical(`${industry} ${companyName} ${productFocus}`);

    switch (vertical) {
      case 'WEDDING_AND_STATIONERY': {
        const weddingPrompts = [
          `Ultra-luxurious Indian wedding invitation flat-lay on dark royal velvet: bespoke deckle-edge invitation card with hand-pressed gold foil embossing, deep royal crimson envelope with wax seal, fresh jasmine garlands and marigold petals, beside an illuminated high-end smartphone showcasing a glowing royal digital wedding video invitation, warm candlelight bokeh, 8k commercial macro photography, zero text overlays, pristine editorial`,
          `Breathtaking royal wedding setting: an elegant bride's hand with intricate henna and gold bangles gracefully holding a golden smartphone previewing a cinematic wedding invitation, heritage palace courtyard with soft golden hour sunlight, lush florals, cinematic shallow depth of field, Vogue wedding editorial, no text, no typography`,
          `High-end luxury wedding stationery suite: opened royal emerald gift box revealing personalized gold foil calligraphy cards, silk ribbon, shimmering gold dust accents, placed on polished black marble with soft studio softbox lighting, ultra-sharp focus, masterwork commercial advertising photograph, zero words`,
        ];
        return weddingPrompts[variationIndex % weddingPrompts.length];
      }

      case 'SUNGLASSES_AND_EYEWEAR': {
        const sunglassPrompts = [
          `Ultra-luxury polarized sunglasses resting on the sun-drenched teak wood deck of a yacht in the Amalfi coast, crystalline ocean waves in soft bokeh, brilliant golden hour sun refraction gleam on dark gradient lenses, crisp macro product photography, 8k resolution, zero text overlays, high-fashion commercial campaign`,
          `Editorial portrait of a charismatic model wearing premium matte-black acetate designer sunglasses, natural warm Mediterranean sun, confident smile, luxury resort background, 85mm f/1.8 lens, Vogue commercial standard, sharp focus on eyewear textures, no words`,
          `Minimalist commercial product showcase: designer titanium sunglasses balanced on warm architectural travertine stone pedestal, crisp geometric shadows, soft studio lighting, ultra-clean commercial shoot, masterwork, zero typography`,
        ];
        return sunglassPrompts[variationIndex % sunglassPrompts.length];
      }

      case 'FASHION_AND_LUXURY': {
        const fashionPrompts = [
          `High-fashion luxury product flat-lay: handcrafted Italian leather goods and gold accessories on dark raw granite, soft dramatic rim lighting, tactile grain texture, Vogue commercial photography, 8k, zero text overlays`,
          `Haute couture editorial model showcasing luxury collection in an architectural Paris apartment with high ceilings and warm afternoon sunlight, timeless elegance, cinematic 8k, no text`,
          `Minimalist designer fashion piece suspended against an ethereal monochrome gradient backdrop, dramatic studio lighting, ultra-clean commercial advertising photograph`,
        ];
        return fashionPrompts[variationIndex % fashionPrompts.length];
      }

      case 'REAL_ESTATE_AND_HOMES': {
        const rePrompts = [
          `Stunning architectural twilight photograph of a luxury modern hillside villa with infinity pool glowing turquoise, warm interior lighting visible through floor-to-ceiling glass walls, dramatic sky, Architectural Digest editorial, 8k, no text`,
          `Sun-drenched luxury penthouse living room overlooking city skyline, designer furniture, polished marble floors, warm natural daylight, pristine commercial photography, zero words`,
        ];
        return rePrompts[variationIndex % rePrompts.length];
      }

      case 'FOOD_AND_HOSPITALITY': {
        const foodPrompts = [
          `Michelin-star artisanal culinary masterpiece plated on handcrafted dark stoneware, fresh microgreens, exquisite sauce drizzle, warm ambient restaurant candlelight, macro food commercial photography, 8k, zero text`,
          `Luxury dining experience: elegant table setting with sparkling crystal glasses, fresh flowers, warm ambient glow, high-end hospitality commercial, no typography`,
        ];
        return foodPrompts[variationIndex % foodPrompts.length];
      }

      case 'SAAS_TECH_AND_GROWTH':
      default: {
        const techPrompts = [
          `Aspirational modern designer office: minimalist natural oak executive desk with an open MacBook Pro displaying an elegant clean dashboard with upward green growth curves, steam rising from ceramic coffee mug, floor-to-ceiling glass windows with city skyline bathed in morning sun, warm architectural photography, 8k, zero text overlays`,
          `High-end executive workspace: sleek Apple studio display on obsidian stone desk, subtle ambient warm LED backlight, designer leather chair, architectural glass office, ultra-clean commercial product photography, no typography`,
          `Confident growth leader in tailored blazer looking at an iPad in a sunlit architectural atrium, natural genuine expression, crisp focus, Forbes editorial style, no words`,
        ];
        return techPrompts[variationIndex % techPrompts.length];
      }
    }
  }
}
