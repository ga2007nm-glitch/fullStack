/**
 * Catalog data source.
 *
 * In a real deployment this module is the seam where the API call goes: the
 * exported helpers below already return promises, so swapping the literals for
 * `fetch()` changes nothing at the call sites (hooks/components stay untouched).
 *
 * Remote image URLs are Unsplash CDN links, which is deliberate — they support
 * on-the-fly resizing and AVIF/WebP transcoding, which `OptimizedImage` relies on.
 */

const img = (id) => `https://images.unsplash.com/photo-${id}`

export const categories = [
  { id: 'all', label: 'All products' },
  { id: 'audio', label: 'Audio' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'carry', label: 'Everyday carry' }
]

export const products = [
  {
    id: 'prd-01',
    slug: 'aperture-over-ear-headphones',
    name: 'Aperture Over-Ear Headphones',
    category: 'audio',
    price: 349,
    compareAt: 429,
    rating: 4.8,
    reviews: 1240,
    stock: 12,
    tags: ['bestseller'],
    blurb: 'Planar drivers, memory-foam cups, and a 40-hour battery for long sessions.',
    description:
      'A closed-back reference headphone tuned for balance rather than boom. The planar magnetic drivers keep transients quick and distortion low, while the memory-foam ear cushions distribute pressure so you can wear them through a full workday.',
    specs: {
      Driver: '40 mm planar magnetic',
      Battery: '40 hours (ANC off)',
      Weight: '278 g',
      Connectivity: 'Bluetooth 5.3 / USB-C / 3.5 mm'
    },
    image: img('1505740420928-5e560c06d30e')
  },
  {
    id: 'prd-02',
    slug: 'halo-desk-lamp',
    name: 'Halo Desk Lamp',
    category: 'lighting',
    price: 189,
    compareAt: null,
    rating: 4.7,
    reviews: 612,
    stock: 24,
    tags: ['new'],
    blurb: 'Edge-lit panel with stepless dimming and a flicker-free driver.',
    description:
      'Halo throws a wide, even pool of light with no hot spot and no visible flicker — the kind of light you can read under for hours. A single tactile dial handles brightness and colour temperature, and the arm holds any angle without drifting.',
    specs: {
      Output: '1,100 lumens',
      'Colour temp': '2,700 K – 6,500 K',
      CRI: '95+',
      Power: 'USB-C PD, 30 W'
    },
    image: img('1507473885765-e6ed057f782c')
  },
  {
    id: 'prd-03',
    slug: 'meridian-mechanical-keyboard',
    name: 'Meridian Mechanical Keyboard',
    category: 'workspace',
    price: 219,
    compareAt: 259,
    rating: 4.9,
    reviews: 2038,
    stock: 7,
    tags: ['bestseller'],
    blurb: 'Gasket-mounted, hot-swappable, and quiet enough for an open office.',
    description:
      'A 75% layout with a gasket-mounted plate that softens every keystroke. Switches are hot-swappable and the firmware is open, so you can remap anything without installing vendor software.',
    specs: {
      Layout: '75% (82 keys)',
      'Switch type': 'Hot-swap, 3- and 5-pin',
      Mount: 'Gasket',
      Connectivity: 'USB-C / Bluetooth / 2.4 GHz'
    },
    image: img('1587829741301-dc798b83add3')
  },
  {
    id: 'prd-04',
    slug: 'porter-leather-sleeve',
    name: 'Porter Leather Sleeve',
    category: 'carry',
    price: 129,
    compareAt: null,
    rating: 4.6,
    reviews: 388,
    stock: 31,
    tags: [],
    blurb: 'Full-grain leather with a wool felt lining that patinas beautifully.',
    description:
      'Cut from a single panel of vegetable-tanned full-grain leather and lined with 3 mm merino felt. It is stiff for a week, then moulds to whatever you keep inside it. Edges are hand-burnished rather than painted, so they age instead of cracking.',
    specs: {
      Material: 'Full-grain vegetable-tanned leather',
      Lining: '3 mm merino wool felt',
      Fits: 'Up to 14-inch laptops',
      Warranty: 'Lifetime'
    },
    image: img('1553062407-98eeb64c6a62')
  },
  {
    id: 'prd-05',
    slug: 'orbit-portable-speaker',
    name: 'Orbit Portable Speaker',
    category: 'audio',
    price: 149,
    compareAt: 179,
    rating: 4.5,
    reviews: 903,
    stock: 18,
    tags: ['sale'],
    blurb: '360° sound, IP67, and a passive radiator that punches above its size.',
    description:
      'Two opposed full-range drivers cancel their own vibration, so Orbit stays put on a shelf even at volume. It is fully waterproof and floats, which makes it the one you take outside without thinking about it.',
    specs: {
      Output: '2 × 15 W + passive radiator',
      Battery: '18 hours',
      Rating: 'IP67 dust and waterproof',
      Weight: '540 g'
    },
    image: img('1608043152269-423dbba4e7e1')
  },
  {
    id: 'prd-06',
    slug: 'strata-monitor-stand',
    name: 'Strata Monitor Stand',
    category: 'workspace',
    price: 159,
    compareAt: null,
    rating: 4.4,
    reviews: 271,
    stock: 15,
    tags: [],
    blurb: 'Solid ash riser that puts your screen at eye level and hides the clutter.',
    description:
      'Raises a display to a comfortable eye line while giving the keyboard somewhere to live. Solid ash, finished with hardwax oil, with a felt-lined channel underneath for cables and a hub.',
    specs: {
      Material: 'Solid ash, hardwax oil finish',
      'Load capacity': '20 kg',
      Clearance: '95 mm',
      Dimensions: '600 × 240 × 110 mm'
    },
    image: img('1593642532973-d31b6557fa68')
  },
  {
    id: 'prd-07',
    slug: 'beacon-floor-lamp',
    name: 'Beacon Floor Lamp',
    category: 'lighting',
    price: 279,
    compareAt: 329,
    rating: 4.7,
    reviews: 456,
    stock: 9,
    tags: ['sale'],
    blurb: 'Linen shade, weighted base, and a dimmer built into the stem.',
    description:
      'A floor lamp that reads as furniture rather than equipment. The linen shade diffuses a warm, low-glare glow, and the dimmer sits exactly where your hand falls on the stem.',
    specs: {
      Material: 'Brushed steel, natural linen',
      Height: '1,620 mm',
      Bulb: 'E27, dimmable LED included',
      Base: 'Weighted, 4.2 kg'
    },
    image: img('1507473885765-e6ed057f782c')
  },
  {
    id: 'prd-08',
    slug: 'field-daypack-22l',
    name: 'Field Daypack 22L',
    category: 'carry',
    price: 189,
    compareAt: null,
    rating: 4.8,
    reviews: 1122,
    stock: 21,
    tags: ['bestseller'],
    blurb: '22 litres, recycled shell, and a laptop bay that opens flat.',
    description:
      'Built around a clamshell opening, so nothing gets lost in the bottom. The shell is a recycled 900D weave with a DWR coating, all zips are water-resistant, and the laptop bay opens flat for airport trays.',
    specs: {
      Capacity: '22 L',
      Shell: 'Recycled 900D with DWR',
      'Laptop bay': 'Up to 16-inch',
      Weight: '1.15 kg'
    },
    image: img('1553062407-98eeb64c6a62')
  },
  {
    id: 'prd-09',
    slug: 'studio-usb-microphone',
    name: 'Studio USB Microphone',
    category: 'audio',
    price: 179,
    compareAt: 219,
    rating: 4.6,
    reviews: 734,
    stock: 14,
    tags: ['sale'],
    blurb: 'Cardioid condenser with a built-in shock mount and zero-latency monitoring.',
    description:
      'A 25 mm condenser capsule on an internal shock mount, so desk knocks stay out of the recording. Class-compliant USB-C means no drivers, on any OS.',
    specs: {
      Capsule: '25 mm cardioid condenser',
      'Sample rate': '24-bit / 96 kHz',
      'Shock mount': 'Internal, dual-stage',
      Connection: 'USB-C, class-compliant'
    },
    image: img('1590602847861-f357a9332bbc')
  },
  {
    id: 'prd-10',
    slug: 'contour-desk-mat',
    name: 'Contour Desk Mat',
    category: 'workspace',
    price: 69,
    compareAt: null,
    rating: 4.3,
    reviews: 219,
    stock: 42,
    tags: [],
    blurb: 'Wool-blend felt with a natural rubber base that never creeps.',
    description:
      'A 4 mm felt surface that damps keyboard noise and keeps things warm under your wrists, bonded to a natural rubber base so it grips the desk instead of travelling.',
    specs: {
      Surface: 'Wool-blend felt, 4 mm',
      Base: 'Natural rubber',
      Size: '900 × 400 mm',
      Care: 'Spot clean, air dry'
    },
    image: img('1593642632823-8f785ba67e45')
  },
  {
    id: 'prd-11',
    slug: 'lumen-task-light',
    name: 'Lumen Task Light',
    category: 'lighting',
    price: 99,
    compareAt: 129,
    rating: 4.5,
    reviews: 541,
    stock: 28,
    tags: ['sale'],
    blurb: 'Pocketable clamp light with a magnetic head and 8-hour battery.',
    description:
      'Clamps onto a monitor, a shelf, or the edge of a book and swivels through 360°. The magnetic head detaches and sticks to steel surfaces on its own.',
    specs: {
      Output: '400 lumens',
      Battery: '8 hours at 50%',
      Mount: 'Spring clamp + magnetic base',
      'Colour temp': '2,700 K / 4,000 K / 5,500 K'
    },
    image: img('1513506003901-1e6a229e2d15')
  },
  {
    id: 'prd-12',
    slug: 'trek-insulated-bottle',
    name: 'Trek Insulated Bottle',
    category: 'carry',
    price: 45,
    compareAt: null,
    rating: 4.7,
    reviews: 1687,
    stock: 56,
    tags: ['bestseller'],
    blurb: 'Vacuum steel, 24 hours cold, and a lid that actually seals.',
    description:
      'Double-wall vacuum steel with a powder-coated exterior that survives being thrown in a bag. The lid gasket is replaceable, which is the part that usually fails first.',
    specs: {
      Capacity: '750 ml',
      Cold: '24 hours',
      Hot: '12 hours',
      Material: '18/8 stainless steel'
    },
    image: img('1602143407151-7111542de6e8')
  }
]

/** All products. Async shape matches a future API call. */
export async function fetchProducts() {
  return products
}

export async function fetchProductBySlug(slug) {
  return products.find((product) => product.slug === slug) ?? null
}

/** Sync lookup for render paths that must not suspend (e.g. the cart). */
export const getProductById = (id) => products.find((product) => product.id === id) ?? null

export const getCategoryLabel = (id) =>
  categories.find((category) => category.id === id)?.label ?? id