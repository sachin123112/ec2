const baseProducts = [
  // Dog products
  { name: 'Premium Dog Kibble', category: 'Dogs', subCategory: 'Food', price: 899, rating: 4.8, reviews: 124, image: 'https://images.unsplash.com/photo-1589924691995-400dc9a65b3d?w=400&q=80', badge: 'Best Seller', description: 'High-protein, grain-free dry food for adult dogs. Made with real chicken and wholesome vegetables.', inStock: true },
  { name: 'Puppy Starter Pack', category: 'Dogs', subCategory: 'Food', price: 649, rating: 4.7, reviews: 89, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80', badge: 'New', description: 'Complete nutrition for puppies 2–12 months. Supports healthy growth and immune system.', inStock: true },
  { name: 'Dog Chew Toy Set', category: 'Dogs', subCategory: 'Toys', price: 349, rating: 4.5, reviews: 56, image: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=400&q=80', badge: '', description: 'Durable rubber chew toys that keep your dog entertained and teeth clean.', inStock: true },
  { name: 'Dog Collar & Leash Combo', category: 'Dogs', subCategory: 'Accessories', price: 499, rating: 4.6, reviews: 43, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80', badge: '', description: 'Adjustable nylon collar with matching leash. Available in multiple colors.', inStock: true },
  { name: 'Loyalty Dog Snack Box', category: 'Dogs', subCategory: 'Food', price: 599, rating: 4.6, reviews: 61, image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80', badge: 'Popular', description: 'A tasty collection of crunchy rewards for training and daily treats.', inStock: true },
  { name: 'Dog Grooming Kit', category: 'Dogs', subCategory: 'Grooming', price: 689, rating: 4.4, reviews: 28, image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80', badge: '', description: 'Brush, comb and trim tools designed for healthy coats and easy grooming.', inStock: true },
  { name: 'Orthopedic Dog Bed', category: 'Dogs', subCategory: 'Accessories', price: 1499, rating: 4.9, reviews: 148, image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80', badge: 'Best Seller', description: 'Memory-foam dog bed that supports joints and keeps restless pets comfy.', inStock: true },
  { name: 'Fetch Ball Set', category: 'Dogs', subCategory: 'Toys', price: 279, rating: 4.5, reviews: 34, image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&q=80', badge: '', description: 'Bright, durable tennis balls for lively fetch games in the park.', inStock: true },
  { name: 'Dog Carrier Backpack', category: 'Dogs', subCategory: 'Accessories', price: 1899, rating: 4.7, reviews: 72, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80', badge: 'Travel Ready', description: 'Comfortable front-facing dog carrier for outings, travel, and vet visits.', inStock: true },
  { name: 'Senior Dog Health Mix', category: 'Dogs', subCategory: 'Food', price: 959, rating: 4.8, reviews: 96, image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=400&q=80', badge: 'Health Care', description: 'Joints, digestion and balanced nutrition formula for older pets.', inStock: true },
  { name: 'Dog Raincoat', category: 'Dogs', subCategory: 'Accessories', price: 699, rating: 4.3, reviews: 22, image: 'https://images.unsplash.com/photo-1525253086316-d0c936c814f8?w=400&q=80', badge: '', description: 'Waterproof, breathable layer that keeps dogs dry in drizzling weather.', inStock: true },
  { name: 'Interactive Tug Rope', category: 'Dogs', subCategory: 'Toys', price: 399, rating: 4.6, reviews: 47, image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80', badge: '', description: 'Heavy-duty rope toy for pulling, tugging and bonding with your dog.', inStock: true },

  // Cat products
  { name: 'Indoor Cat Formula', category: 'Cats', subCategory: 'Food', price: 749, rating: 4.9, reviews: 201, image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80', badge: 'Top Rated', description: 'Specially formulated for indoor cats. Helps control weight and reduce hairballs.', inStock: true },
  { name: 'Kitten Milk Replacer', category: 'Cats', subCategory: 'Food', price: 299, rating: 4.7, reviews: 67, image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80', badge: 'New', description: 'Complete nutrition for orphaned or rejected kittens. Easy to digest formula.', inStock: true },
  { name: 'Cat Scratcher Tower', category: 'Cats', subCategory: 'Accessories', price: 1299, rating: 4.8, reviews: 92, image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=80', badge: 'Best Seller', description: 'Multi-level cat tower with sisal rope scratching posts, cozy perches and dangling toys.', inStock: true },
  { name: 'Interactive Feather Wand', category: 'Cats', subCategory: 'Toys', price: 199, rating: 4.4, reviews: 38, image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80', badge: '', description: 'Retractable feather wand toy that stimulates your cat’s natural hunting instincts.', inStock: true },
  { name: 'Cat Litter Kit', category: 'Cats', subCategory: 'Home Care', price: 479, rating: 4.5, reviews: 58, image: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400&q=80', badge: '', description: 'Low-dust clumping litter with odour control and easy cleanup.', inStock: true },
  { name: 'Whiskers Salmon Bites', category: 'Cats', subCategory: 'Food', price: 389, rating: 4.8, reviews: 110, image: 'https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=400&q=80', badge: 'Favorite', description: 'Savory salmon treats packed with protein and omega oils.', inStock: true },
  { name: 'Cat Window Seat', category: 'Cats', subCategory: 'Accessories', price: 1599, rating: 4.9, reviews: 87, image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&q=80', badge: 'Premium', description: 'Secure, cushioned perch positioned near windows for lounging and sunbathing.', inStock: true },
  { name: 'Laser Pointer Toy', category: 'Cats', subCategory: 'Toys', price: 169, rating: 4.3, reviews: 31, image: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400&q=80', badge: '', description: 'Rechargeable laser toy to encourage movement and playtime energy.', inStock: true },
  { name: 'Cat Grooming Brush', category: 'Cats', subCategory: 'Grooming', price: 439, rating: 4.7, reviews: 49, image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400&q=80', badge: '', description: 'Gentle brush for removing loose fur and reducing matting.', inStock: true },
  { name: 'Cat Carrier Deluxe', category: 'Cats', subCategory: 'Accessories', price: 2199, rating: 4.8, reviews: 68, image: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400&q=80', badge: 'Travel Ready', description: 'Air-vented cat carrier with soft cushions and secure locking mechanism.', inStock: true },
  { name: 'Feline Wet Food Variety', category: 'Cats', subCategory: 'Food', price: 649, rating: 4.7, reviews: 75, image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&q=80', badge: '', description: 'Protein-rich poultry, tuna and chicken recipes in a balanced mix.', inStock: true },
  { name: 'Cat Tunnel Play Arena', category: 'Cats', subCategory: 'Toys', price: 1899, rating: 4.8, reviews: 54, image: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400&q=80', badge: 'Best Seller', description: 'Soft, colorful tunnel set for chase, hide-and-seek and playtime fun.', inStock: true },

  // Bird products
  { name: 'Parrot Seed Mix', category: 'Birds', subCategory: 'Food', price: 249, rating: 4.6, reviews: 51, image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&q=80', badge: '', description: 'Premium blend of seeds, nuts and dried fruits for parrots and large parakeets.', inStock: true },
  { name: 'Bird Cage Deluxe', category: 'Birds', subCategory: 'Accessories', price: 2499, rating: 4.7, reviews: 29, image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=80', badge: 'Premium', description: 'Spacious wrought-iron bird cage with multiple perches, food bowls and swing.', inStock: true },
  { name: 'Sunflower Seed Blend', category: 'Birds', subCategory: 'Food', price: 299, rating: 4.4, reviews: 42, image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80', badge: '', description: 'Energy-rich seed mix that keeps feathered friends active and bright.', inStock: true },
  { name: 'Bird Perch Set', category: 'Birds', subCategory: 'Accessories', price: 349, rating: 4.5, reviews: 36, image: 'https://images.unsplash.com/photo-1525253086316-d0c936c814f8?w=400&q=80', badge: '', description: 'Natural wood perches for comfort, balance and exercise indoors.', inStock: true },
  { name: 'Parakeet Toy Bundle', category: 'Birds', subCategory: 'Toys', price: 399, rating: 4.6, reviews: 33, image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&q=80', badge: 'New', description: 'Colorful bells, ropes and foraging toys to keep birds mentally stimulated.', inStock: true },
  { name: 'Bird Bath Fountain', category: 'Birds', subCategory: 'Accessories', price: 799, rating: 4.7, reviews: 45, image: 'https://images.unsplash.com/photo-1525253086316-d0c936c814f8?w=400&q=80', badge: '', description: 'Stylish bowl that keeps water fresh and gives birds a playful splash zone.', inStock: true },
  { name: 'Vitamin Pellets', category: 'Birds', subCategory: 'Food', price: 559, rating: 4.8, reviews: 69, image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&q=80', badge: 'Health', description: 'Fortified pellets for balanced nutrition and feather health.', inStock: true },
  { name: 'Hanging Swing', category: 'Birds', subCategory: 'Toys', price: 289, rating: 4.3, reviews: 26, image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=80', badge: '', description: 'A sturdy rope swing for resting, playtime and exercise.', inStock: true },
  { name: 'Aviary Nest Box', category: 'Birds', subCategory: 'Accessories', price: 899, rating: 4.6, reviews: 38, image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&q=80', badge: '', description: 'Comfortable shelter that creates a secure resting place for small birds.', inStock: true },
  { name: 'Budgie Treat Mix', category: 'Birds', subCategory: 'Food', price: 229, rating: 4.5, reviews: 27, image: 'https://images.unsplash.com/photo-1525253086316-d0c936c814f8?w=400&q=80', badge: '', description: 'A crunchy snack blend with dried fruit and trail mix for active budgies.', inStock: true },
  { name: 'Bird Ladder Play Set', category: 'Birds', subCategory: 'Toys', price: 469, rating: 4.6, reviews: 31, image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=80', badge: 'Popular', description: 'Climbing toy designed for agile birds to move, perch and explore.', inStock: true },
  { name: 'Large Parrot Cage', category: 'Birds', subCategory: 'Accessories', price: 3499, rating: 4.9, reviews: 57, image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&q=80', badge: 'Premium', description: 'Spacious enclosure with rails, feeders and easy-clean design.', inStock: true },

  // Fish products
  { name: 'Tropical Fish Flakes', category: 'Fish', subCategory: 'Food', price: 149, rating: 4.5, reviews: 78, image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&q=80', badge: '', description: 'Color-enhancing flake food for all tropical freshwater fish. Rich in vitamins.', inStock: true },
  { name: 'Aquarium Starter Kit', category: 'Fish', subCategory: 'Accessories', price: 1899, rating: 4.8, reviews: 44, image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80', badge: 'New', description: '10-gallon glass tank with LED lighting, filter, heater and water conditioner.', inStock: true },
  { name: 'Betta Food Pellets', category: 'Fish', subCategory: 'Food', price: 199, rating: 4.6, reviews: 41, image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&q=80', badge: '', description: 'High-protein pellets made for bettas and small ornamental fish.', inStock: true },
  { name: 'LED Aquarium Light', category: 'Fish', subCategory: 'Accessories', price: 1299, rating: 4.7, reviews: 28, image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80', badge: '', description: 'Energy-saving LED light to enhance aquarium colors and plant growth.', inStock: true },
  { name: 'Fish Tank Filter', category: 'Fish', subCategory: 'Accessories', price: 999, rating: 4.6, reviews: 36, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70b5?w=400&q=80', badge: 'Popular', description: 'Quiet filtration system for crystal-clear and healthy water.', inStock: true },
  { name: 'Gold Fish Gourmet Mix', category: 'Fish', subCategory: 'Food', price: 249, rating: 4.7, reviews: 63, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70b5?w=400&q=80', badge: '', description: 'Balanced mix of grains, dried veggies and vitamins for goldfish.', inStock: true },
  { name: 'Decorative Coral Reef', category: 'Fish', subCategory: 'Accessories', price: 799, rating: 4.5, reviews: 24, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70b5?w=400&q=80', badge: '', description: 'Artificial coral decoration to create a natural habitat appearance.', inStock: true },
  { name: 'Aquarium Heater', category: 'Fish', subCategory: 'Accessories', price: 1199, rating: 4.7, reviews: 32, image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80', badge: 'Smart', description: 'Thermostat-controlled heater that maintains a safe temperature range.', inStock: true },
  { name: 'Live Plant Pack', category: 'Fish', subCategory: 'Accessories', price: 449, rating: 4.4, reviews: 23, image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&q=80', badge: '', description: 'Set of easy-care live plants for oxygenation and natural beauty.', inStock: true },
  { name: 'Tetra Nutrition Sticks', category: 'Fish', subCategory: 'Food', price: 179, rating: 4.5, reviews: 31, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70b5?w=400&q=80', badge: '', description: 'Slow-sinking fish food for community tanks and active swimmers.', inStock: true },
  { name: 'Aquarium Gravel Set', category: 'Fish', subCategory: 'Accessories', price: 399, rating: 4.3, reviews: 18, image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80', badge: '', description: 'Natural textured gravel ideal for substrate and aquarium styling.', inStock: true },
  { name: 'Freshwater Fish Combo', category: 'Fish', subCategory: 'Food', price: 699, rating: 4.8, reviews: 58, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70b5?w=400&q=80', badge: 'Best Seller', description: 'A complete feeding mix for vibrant colors, growth and immune support.', inStock: true },
];

const generatedProducts = [];
const categoryGroups = [
  { category: 'Dogs', subCategories: ['Food', 'Toys', 'Accessories', 'Grooming'] },
  { category: 'Cats', subCategories: ['Food', 'Toys', 'Accessories', 'Home Care', 'Grooming'] },
  { category: 'Birds', subCategories: ['Food', 'Toys', 'Accessories'] },
  { category: 'Fish', subCategories: ['Food', 'Accessories'] },
];

const productNames = {
  Dogs: ['Trail Mix', 'Smart Collar', 'Bite Guard', 'Pup Plush', 'Recovery Bed', 'Chew Bone', 'Daily Treat', 'Hydration Bowl', 'Safety Harness', 'Play Mat', 'Cozy Blanket', 'Paw Cleanser', 'Dental Sticks', 'Travel Bowl', 'Feather Ball', 'Fresh Coat Oil', 'Paw Protector', 'Tree Bark Toy', 'Sunshade Cover', 'Calming Spray', 'Active Rope', 'Leather Lead', 'Warm Coat', 'Scented Chew', 'Jump Rope', 'Cuddle Cushion', 'Boost Protein', 'Soft Frisbee'],
  Cats: ['Crunch Bites', 'Scratch Pad', 'Soft Tunnel', 'Litter Scoop', 'Purr Blanket', 'Toy Mouse', 'Calming Treat', 'Window Hammock', 'Catnip Jar', 'Feather Rotator', 'Clean Groom Kit', 'Whisker Bowl', 'Play Tower', 'Paw Foam', 'Bubble Ball', 'Cozy Cubby', 'Scent Pack', 'Nap Cushion', 'Feline Combo', 'Velvet Scratcher', 'Mini Launcher', 'Purr Pouch', 'Grooming Mitt', 'Nuzzle Mat', 'Silk Ribbon', 'Paw Cleaner', 'Bone Crunch', 'Laser Light'],
  Birds: ['Nut Blend', 'Seed Cubes', 'Swing Rope', 'Tidy Feeder', 'Perch Grip', 'Nest Cushion', 'Feather Treat', 'Shiny Bell', 'Bird Ladder', 'Color Ball', 'Tidy Spray', 'Caress Mix', 'Grit Blend', 'Chewing Sticks', 'Hanging Toy', 'Parrot Platter', 'Feather Guard', 'Cage Cover', 'Clean Bristle', 'Bowls Plus', 'Pecking Toy', 'Pine Perch', 'Dried Fruit Mix', 'Wooden Ring', 'Claw Groomer', 'Tasty Puff', 'Climber Set', 'Travel Cage'],
  Fish: ['Glow Pellets', 'Tank Brush', 'Floating Veggie', 'Water Guard', 'Utility Net', 'Plant Pot', 'Cave Decor', 'Probiotic Mix', 'Tank Cleaner', 'Leaf Hide', 'Bubble Stone', 'Shell Decor', 'Color Boost', 'Ph Balance Pack', 'Surface Skimmer', 'Repair Valve', 'Churn Filter', 'Mini Rocks', 'Crystal Pellets', 'River Stones', 'Pond Strips', 'Fern Bundle', 'Bubble Lamp', 'Day Glow Mix', 'Gentle Net', 'Clean Salt Pack', 'Plasma Food', 'Freshwater Granules'],
};

categoryGroups.forEach(({ category, subCategories }) => {
  productNames[category].forEach((name, index) => {
    const subCategory = subCategories[index % subCategories.length];
    const priceBase = category === 'Dogs' ? 250 : category === 'Cats' ? 220 : category === 'Birds' ? 180 : 160;
    const price = priceBase + ((index * 63) % 1800) + (category === 'Dogs' ? 120 : category === 'Cats' ? 90 : 60);
    const rating = Number((3.8 + ((index % 7) * 0.2)).toFixed(1));
    const reviews = 18 + ((index * 13) % 220);
    const badgePool = ['Best Seller', 'New', 'Popular', 'Top Rated', 'Premium', 'Health Care', 'Travel Ready', ''];
    const badge = badgePool[index % badgePool.length];
    const imageMap = {
      Dogs: 'https://images.unsplash.com/photo-1583337130479-1e4f4a2d5d6d?w=400&q=80',
      Cats: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400&q=80',
      Birds: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&q=80',
      Fish: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&q=80',
    };

    generatedProducts.push({
      id: generatedProducts.length + 1,
      name: `${category.replace(/s$/, '')} ${name}`,
      category,
      subCategory,
      price,
      rating,
      reviews,
      image: imageMap[category],
      badge,
      description: `High-quality ${category.toLowerCase()} care product designed for everyday comfort, safety and long-term wellness.`,
      inStock: true,
    });
  });
});

export const products = [...baseProducts, ...generatedProducts].slice(0, 100);

export const categories = [
  { name: 'Dogs', icon: '🐶', color: '#FF6B35', bg: '#FFF0EA' },
  { name: 'Cats', icon: '🐱', color: '#9B59B6', bg: '#F5EEF8' },
  { name: 'Birds', icon: '🐦', color: '#2980B9', bg: '#EBF5FB' },
  { name: 'Fish', icon: '🐠', color: '#16A085', bg: '#E8F8F5' },
];
