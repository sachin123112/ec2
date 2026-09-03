-- Seed the categories shown on the mobile Shop screen and products for their detail pages.
INSERT INTO categories (name) VALUES
  ('Dog Food'),
  ('Cat Food'),
  ('Bird Food'),
  ('Fish Food'),
  ('Treats'),
  ('Pet Toys'),
  ('Beds & Comfort'),
  ('Grooming'),
  ('Collars & Leashes'),
  ('Aquarium Care')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, description, sku, price, stock_quantity, net_quantity, category_id)
SELECT item.name, item.description, item.sku, item.price, 100, item.net_quantity, category.id
FROM (VALUES
  ('Chicken Puppy Kibble', 'Complete daily nutrition for growing puppies.', 'MOBILE-DOG-FOOD-001', 699.00, 1000, 'Dog Food'),
  ('Adult Dog Nutrition', 'Balanced chicken and vegetable recipe for adult dogs.', 'MOBILE-DOG-FOOD-002', 899.00, 1000, 'Dog Food'),
  ('Indoor Cat Formula', 'Wholesome food for indoor cats with hairball support.', 'MOBILE-CAT-FOOD-001', 749.00, 800, 'Cat Food'),
  ('Kitten Growth Bites', 'Small, nutritious bites for healthy kitten growth.', 'MOBILE-CAT-FOOD-002', 599.00, 800, 'Cat Food'),
  ('Parrot Seed Mix', 'Premium seeds, grains and dried fruit for parrots.', 'MOBILE-BIRD-FOOD-001', 249.00, 700, 'Bird Food'),
  ('Daily Bird Treats', 'Crunchy vitamin-rich treats for pet birds.', 'MOBILE-BIRD-FOOD-002', 199.00, 700, 'Bird Food'),
  ('Tropical Fish Flakes', 'Color-enhancing flakes for tropical freshwater fish.', 'MOBILE-FISH-FOOD-001', 149.00, 900, 'Fish Food'),
  ('Goldfish Granules', 'Easy-to-digest granules for goldfish and pond fish.', 'MOBILE-FISH-FOOD-002', 179.00, 900, 'Fish Food'),
  ('Crunchy Dental Treats', 'Chewy treats that support everyday dental care.', 'MOBILE-TREATS-001', 299.00, 600, 'Treats'),
  ('Natural Training Treats', 'Small reward treats made with natural ingredients.', 'MOBILE-TREATS-002', 249.00, 600, 'Treats'),
  ('Interactive Feather Toy', 'Engaging feather toy for active cats and kittens.', 'MOBILE-TOYS-001', 199.00, 500, 'Pet Toys'),
  ('Durable Chew Toy', 'Long-lasting rubber toy for energetic dogs.', 'MOBILE-TOYS-002', 349.00, 500, 'Pet Toys'),
  ('Memory Foam Pet Bed', 'Supportive washable bed for restful naps.', 'MOBILE-BEDS-001', 1299.00, 300, 'Beds & Comfort'),
  ('Cozy Comfort Cushion', 'Soft cushion for small pets and cats.', 'MOBILE-BEDS-002', 899.00, 300, 'Beds & Comfort'),
  ('Gentle Grooming Brush', 'Soft-bristle brush for a clean, healthy coat.', 'MOBILE-GROOM-001', 299.00, 450, 'Grooming'),
  ('Pet Shampoo', 'Mild everyday shampoo for sensitive pet skin.', 'MOBILE-GROOM-002', 399.00, 450, 'Grooming'),
  ('Adjustable Collar and Leash', 'Comfortable matching collar and leash set.', 'MOBILE-ACCESSORY-001', 499.00, 400, 'Collars & Leashes'),
  ('Reflective Safety Collar', 'Reflective collar for safer evening walks.', 'MOBILE-ACCESSORY-002', 299.00, 400, 'Collars & Leashes'),
  ('Aquarium Water Conditioner', 'Helps maintain clean, healthy aquarium water.', 'MOBILE-AQUARIUM-001', 349.00, 350, 'Aquarium Care'),
  ('Aquarium Plant Care Kit', 'Essential tools for healthy aquatic plants.', 'MOBILE-AQUARIUM-002', 599.00, 350, 'Aquarium Care')
) AS item(name, description, sku, price, net_quantity, category_name)
JOIN categories category ON category.name = item.category_name
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_images (product_id, image_url)
SELECT product.id, image.image_url
FROM (VALUES
  ('MOBILE-DOG-FOOD-001', 'https://images.unsplash.com/photo-1589924691995-400dc9a65b3d?w=500&q=85'),
  ('MOBILE-DOG-FOOD-002', 'https://images.unsplash.com/photo-1568640347023-a616a7fba0bd?w=500&q=85'),
  ('MOBILE-CAT-FOOD-001', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=85'),
  ('MOBILE-CAT-FOOD-002', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&q=85'),
  ('MOBILE-BIRD-FOOD-001', 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500&q=85'),
  ('MOBILE-BIRD-FOOD-002', 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=500&q=85'),
  ('MOBILE-FISH-FOOD-001', 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&q=85'),
  ('MOBILE-FISH-FOOD-002', 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=85'),
  ('MOBILE-TREATS-001', 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?w=500&q=85'),
  ('MOBILE-TREATS-002', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=85'),
  ('MOBILE-TOYS-001', 'https://images.unsplash.com/photo-1533745367119-9bb42f3f7bff?w=500&q=85'),
  ('MOBILE-TOYS-002', 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=500&q=85'),
  ('MOBILE-BEDS-001', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=85'),
  ('MOBILE-BEDS-002', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=85'),
  ('MOBILE-GROOM-001', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=85'),
  ('MOBILE-GROOM-002', 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&q=85'),
  ('MOBILE-ACCESSORY-001', 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=500&q=85'),
  ('MOBILE-ACCESSORY-002', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=85'),
  ('MOBILE-AQUARIUM-001', 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=85'),
  ('MOBILE-AQUARIUM-002', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=85')
) AS image(sku, image_url)
JOIN products product ON product.sku = image.sku
WHERE NOT EXISTS (
  SELECT 1 FROM product_images existing WHERE existing.product_id = product.id
);
