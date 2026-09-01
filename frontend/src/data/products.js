const catalog = [
  { category: 'Dogs', icon: '🐶', color: '#FF6B35', bg: '#FFF0EA', subCategories: ['Food', 'Toys', 'Accessories', 'Grooming'] },
  { category: 'Cats', icon: '🐱', color: '#9B59B6', bg: '#F5EEF8', subCategories: ['Food', 'Toys', 'Accessories', 'Home Care', 'Grooming'] },
  { category: 'Birds', icon: '🐦', color: '#2980B9', bg: '#EBF5FB', subCategories: ['Food', 'Toys', 'Accessories'] },
  { category: 'Fish', icon: '🐠', color: '#16A085', bg: '#E8F8F5', subCategories: ['Food', 'Accessories'] },
  { category: 'Small Pets', icon: '🐹', color: '#F39C12', bg: '#FEF5E7', subCategories: ['Food', 'Toys', 'Habitat', 'Accessories'] },
  { category: 'Reptiles', icon: '🦎', color: '#27AE60', bg: '#EAFAF1', subCategories: ['Food', 'Habitat', 'Accessories'] },
  { category: 'Aquarium Plants', icon: '🌿', color: '#2ECC71', bg: '#EAFBF1', subCategories: ['Plants', 'Decor', 'Accessories'] },
  { category: 'Food', icon: '🥗', color: '#F39C12', bg: '#FFF4E6', subCategories: ['Pet Food', 'Treats', 'Supplements', 'Premium'] },
];

function getSvgImageDataUri(title, subtitle, icon, color, background) {
  const safeTitle = String(title || 'Pet Product').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSubtitle = String(subtitle || 'PawMart').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${background || '#FFF0EA'}"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)"/>
      <circle cx="660" cy="130" r="110" fill="rgba(255,255,255,0.28)"/>
      <text x="52" y="250" font-size="150">${icon || '🐾'}</text>
      <text x="52" y="390" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="${color || '#FF6B35'}">${safeTitle}</text>
      <text x="52" y="460" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#4b5563">${safeSubtitle}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const productNames = {
  Dogs: ['Trail Mix', 'Smart Collar', 'Bite Guard', 'Pup Plush', 'Recovery Bed', 'Chew Bone', 'Daily Treat', 'Hydration Bowl', 'Safety Harness', 'Play Mat', 'Cozy Blanket', 'Paw Cleanser', 'Dental Sticks', 'Travel Bowl', 'Feather Ball', 'Fresh Coat Oil', 'Paw Protector', 'Tree Bark Toy', 'Sunshade Cover', 'Calming Spray', 'Active Rope', 'Leather Lead', 'Warm Coat', 'Scented Chew', 'Jump Rope', 'Cuddle Cushion', 'Boost Protein', 'Soft Frisbee', 'Velvet Bandana', 'Air Cooling Vest', 'Bone Snack Pack', 'Splash Feeder', 'Paw Massage Pad', 'Night Light Collar', 'Freeze-Dried Bites', 'Rapid Groom Brush', 'Paw Balm', 'Training Clicker', 'Pup Play Tunnel', 'Fresh Coat Shampoo', 'Memory Foam Cushion', 'Hiking Leash', 'Poise Harness', 'Winter Booties', 'Travel Crate', 'Pup Steps'],
  Cats: ['Crunch Bites', 'Scratch Pad', 'Soft Tunnel', 'Litter Scoop', 'Purr Blanket', 'Toy Mouse', 'Calming Treat', 'Window Hammock', 'Catnip Jar', 'Feather Rotator', 'Clean Groom Kit', 'Whisker Bowl', 'Play Tower', 'Paw Foam', 'Bubble Ball', 'Cozy Cubby', 'Scent Pack', 'Nap Cushion', 'Feline Combo', 'Velvet Scratcher', 'Mini Launcher', 'Purr Pouch', 'Grooming Mitt', 'Nuzzle Mat', 'Silk Ribbon', 'Paw Cleaner', 'Bone Crunch', 'Laser Light', 'Trim Clipper', 'Purr Plush', 'Hunting Wand', 'Curled Tunnel', 'Litter Mat', 'Cushion Bed', 'Auto Feeder', 'Fresh Air Filter', 'Whisker Mitt', 'Soft Pom Pom', 'Kitten Comfort Kit', 'Silk Collar', 'Warm Nest', 'Sun Halo Bed', 'Patio Cat Seat', 'Dawn Meal Cups', 'Night Glow Toy', 'Feline Groom Set'],
  Birds: ['Nut Blend', 'Seed Cubes', 'Swing Rope', 'Tidy Feeder', 'Perch Grip', 'Nest Cushion', 'Feather Treat', 'Shiny Bell', 'Bird Ladder', 'Color Ball', 'Tidy Spray', 'Caress Mix', 'Grit Blend', 'Chewing Sticks', 'Hanging Toy', 'Parrot Platter', 'Feather Guard', 'Cage Cover', 'Clean Bristle', 'Bowls Plus', 'Pecking Toy', 'Pine Perch', 'Dried Fruit Mix', 'Wooden Ring', 'Claw Groomer', 'Tasty Puff', 'Climber Set', 'Travel Cage', 'Seed Dispenser', 'Vitamin Sprinkle', 'Social Swing', 'Bath Splash', 'Perch Guard', 'Feather Brush', 'Mimic Bell', 'Calm Essential', 'Nest Pad', 'Foraging Toy', 'Rainproof Cover', 'Pine Ladder', 'Cage Ladder', 'Feeder Combo', 'Travel Carrier', 'Bamboo Perch'],
  Fish: ['Glow Pellets', 'Tank Brush', 'Floating Veggie', 'Water Guard', 'Utility Net', 'Plant Pot', 'Cave Decor', 'Probiotic Mix', 'Tank Cleaner', 'Leaf Hide', 'Bubble Stone', 'Shell Decor', 'Color Boost', 'Ph Balance Pack', 'Surface Skimmer', 'Repair Valve', 'Churn Filter', 'Mini Rocks', 'Crystal Pellets', 'River Stones', 'Pond Strips', 'Fern Bundle', 'Bubble Lamp', 'Day Glow Mix', 'Gentle Net', 'Clean Salt Pack', 'Plasma Food', 'Freshwater Granules', 'Reef Stone', 'Aquarium Lamp', 'Bio Filter', 'Cozy Coral', 'Mini Bowl', 'Plant Cover', 'Algae Scrubber', 'Oxygen Stone', 'Glass Cleaner', 'Flow Nozzle', 'Warm Heater', 'Wave Pump', 'Pebble Tray', 'Water Test Kit', 'Sponge Filter', 'Fish Food Cubes', 'Tidal Treat Mix'],
  'Small Pets': ['Hay Crunch', 'Wheel Sprint', 'Tunnel Run', 'Snack Trail', 'Hamster Dome', 'Cage Chew', 'Burrow Tunnel', 'Feeder Bowl', 'Nest Pad', 'Wheel Cover', 'Munch Mix', 'Comfort Hut', 'Scented Timber', 'Play Ramp', 'Clean Litter', 'Bunny Brush', 'Soft Bedding', 'Pocket Carrier', 'Mini Wheel', 'Seed Bowl', 'Ladder Climber', 'Wooly Nest', 'Chew Block', 'Tunnel Tube', 'Garden Hay', 'Muzzle Toy', 'Tooth Stick', 'Pillow Nest', 'Cage Shelf', 'Bunny Meal Kit', 'Hideaway Cube', 'Bedding Saver', 'Cage Ladder', 'Moss Carpet', 'Tasty Granules', 'Rolling Ball', 'Kibble Scoop', 'Comfort Crate', 'Nap Blanket', 'Quiet Wheel', 'Bridge Toy', 'Pet Pot', 'Toy Ring', 'Fresh Snack Box', 'Clean Brush', 'Hamster Treat Pack'],
  Reptiles: ['Meal Worm Mix', 'Heat Rock', 'Cave Hide', 'Calcium Dust', 'Terrarium Tray', 'UV Lamp', 'Humidity Pod', 'Leaf Shelter', 'Crisp Crunch', 'Basking Log', 'Feeder Tongs', 'Water Dish', 'Lizard Ladder', 'Plant Pot', 'Stone Hide', 'Warm Mat', 'Digestive Pellets', 'Sun Glow Lamp', 'Spray Mist', 'Rock Tunnel', 'Terrarium Brush', 'Reptile Nest', 'Leaf Hide', 'Sip Cup', 'Forest Moss', 'Sand Scoop', 'Basking Stone', 'Worm Feeder', 'Terrarium Cover', 'Glow Rock', 'Humidity Gauge', 'Cage Scoop', 'Feeding Dish', 'Climbing Branch', 'Tropical Plant', 'Lizard Treats', 'Heat Guard', 'Pet Shelter', 'Mini Logger', 'Snake Hide', 'Dew Dish', 'Hygiene Wipes', 'Warm Pad', 'Crest Basket'],
  'Aquarium Plants': ['Java Fern', 'Amazon Sword', 'Hornwort', 'Anubias', 'Water Sprite', 'Cryptocoryne', 'Bacopa', 'Moss Carpet', 'Lily Pad', 'Ludwigia', 'Rotala', 'Valisneria', 'Marimo Moss', 'Duckweed Pack', 'Cabomba', 'Water Wisteria', 'Najas', 'Glossostigma', 'Aponogeton', 'Hydrocotyle'],
  Food: ['Premium Kibble', 'Salmon Bites', 'Herbal Blend', 'Protein Mix', 'Treat Cubes', 'Vet Formula', 'Omega Boost', 'Digestive Pellets', 'Grain-Free Feast', 'Natural Mix', 'Senior Formula', 'Chicken Crunch', 'Meat Tender', 'Organic Feast', 'Fish Flakes', 'Scoop Blend', 'Wellness Bowl', 'Fresh Harvest', 'Mini Grains', 'Daily Nutrition'],
};

const generatedProducts = [];
const categoryDisplayName = {
  Dogs: 'Dog',
  Cats: 'Cat',
  Birds: 'Bird',
  Fish: 'Fish',
  'Small Pets': 'Small Pet',
  Reptiles: 'Reptile',
  'Aquarium Plants': 'Aquarium Plant',
  Food: 'Food',
};

catalog.forEach(({ category, subCategories }) => {
  productNames[category].forEach((name, index) => {
    const subCategory = subCategories[index % subCategories.length];
    const priceBase = category === 'Dogs' ? 250 : category === 'Cats' ? 220 : category === 'Birds' ? 180 : category === 'Fish' ? 160 : category === 'Small Pets' ? 140 : category === 'Aquarium Plants' ? 110 : category === 'Food' ? 130 : 180;
    const price = priceBase + ((index * 63) % 1800) + (category === 'Dogs' ? 120 : category === 'Cats' ? 90 : category === 'Birds' ? 60 : category === 'Fish' ? 50 : category === 'Small Pets' ? 35 : category === 'Aquarium Plants' ? 40 : category === 'Food' ? 55 : 45);
    const rating = Number((3.8 + ((index % 7) * 0.2)).toFixed(1));
    const reviews = 18 + ((index * 13) % 220);
    const badgePool = ['Best Seller', 'New', 'Popular', 'Top Rated', 'Premium', 'Health Care', 'Travel Ready', ''];
    const badge = badgePool[index % badgePool.length];
    const imageMap = {
      Dogs: getSvgImageDataUri(`${categoryDisplayName[category]} ${name}`, category, '🐶', '#FF6B35', '#FFF0EA'),
      Cats: getSvgImageDataUri(`${categoryDisplayName[category]} ${name}`, category, '🐱', '#9B59B6', '#F5EEF8'),
      Birds: getSvgImageDataUri(`${categoryDisplayName[category]} ${name}`, category, '🐦', '#2980B9', '#EBF5FB'),
      Fish: getSvgImageDataUri(`${categoryDisplayName[category]} ${name}`, category, '🐠', '#16A085', '#E8F8F5'),
      'Small Pets': getSvgImageDataUri(`${categoryDisplayName[category]} ${name}`, category, '🐹', '#F39C12', '#FEF5E7'),
      Reptiles: getSvgImageDataUri(`${categoryDisplayName[category]} ${name}`, category, '🦎', '#27AE60', '#EAFAF1'),
      'Aquarium Plants': getSvgImageDataUri(`${categoryDisplayName[category]} ${name}`, category, '🌿', '#2ECC71', '#EAFBF1'),
      Food: getSvgImageDataUri(`${categoryDisplayName[category]} ${name}`, category, '🥗', '#F39C12', '#FFF4E6'),
    };

    generatedProducts.push({
      id: generatedProducts.length + 1,
      name: `${categoryDisplayName[category]} ${name}`,
      category,
      subCategory,
      price,
      rating,
      reviews,
      image: imageMap[category],
      badge,
      description: `Premium ${category.toLowerCase()} selection designed for comfort, nutrition and everyday care.`,
      inStock: true,
    });
  });
});

export const products = generatedProducts.slice(0, 100);

export const categories = catalog.map(({ category, icon, color, bg }) => ({ name: category, icon, color, bg }));
