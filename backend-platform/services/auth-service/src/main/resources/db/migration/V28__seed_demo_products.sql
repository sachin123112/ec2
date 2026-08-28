-- Seed the development catalog used by the frontend.
INSERT INTO categories (name) VALUES ('Cats')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, description, sku, price, stock_quantity, category_id)
SELECT product.name, product.description, product.sku, product.price, 100, category.id
FROM (VALUES
  ('Premium Dog Kibble', 'High-protein, grain-free dry food for adult dogs. Made with real chicken and wholesome vegetables.', 'DEMO-DOG-001', 899.00, 'Dogs'),
  ('Puppy Starter Pack', 'Complete nutrition for puppies 2-12 months. Supports healthy growth and immune system.', 'DEMO-DOG-002', 649.00, 'Dogs'),
  ('Dog Chew Toy Set', 'Durable rubber chew toys that keep your dog entertained and teeth clean.', 'DEMO-DOG-003', 349.00, 'Dogs'),
  ('Dog Collar & Leash Combo', 'Adjustable nylon collar with matching leash. Available in multiple colors.', 'DEMO-DOG-004', 499.00, 'Dogs'),
  ('Indoor Cat Formula', 'Specially formulated for indoor cats. Helps control weight and reduce hairballs.', 'DEMO-CAT-001', 749.00, 'Cats'),
  ('Kitten Milk Replacer', 'Complete nutrition for orphaned or rejected kittens. Easy to digest formula.', 'DEMO-CAT-002', 299.00, 'Cats'),
  ('Cat Scratcher Tower', 'Multi-level cat tower with sisal rope scratching posts, cozy perches and dangling toys.', 'DEMO-CAT-003', 1299.00, 'Cats'),
  ('Interactive Feather Wand', 'Retractable feather wand toy that stimulates your cat''s natural hunting instincts.', 'DEMO-CAT-004', 199.00, 'Cats'),
  ('Parrot Seed Mix', 'Premium blend of seeds, nuts and dried fruits for parrots and large parakeets.', 'DEMO-BIRD-001', 249.00, 'Birds'),
  ('Bird Cage Deluxe', 'Spacious wrought-iron bird cage with multiple perches, food bowls and swing.', 'DEMO-BIRD-002', 2499.00, 'Birds'),
  ('Tropical Fish Flakes', 'Color-enhancing flake food for all tropical freshwater fish. Rich in vitamins.', 'DEMO-FISH-001', 149.00, 'Fish'),
  ('Aquarium Starter Kit', '10-gallon glass tank with LED lighting, filter, heater and water conditioner.', 'DEMO-FISH-002', 1899.00, 'Fish')
) AS product(name, description, sku, price, category_name)
JOIN categories category ON category.name = product.category_name
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_images (product_id, image_url)
SELECT product.id, image.image_url
FROM (VALUES
  ('DEMO-DOG-001', 'https://images.unsplash.com/photo-1589924691995-400dc9a65b3d?w=400&q=80'),
  ('DEMO-DOG-002', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80'),
  ('DEMO-DOG-003', 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=400&q=80'),
  ('DEMO-DOG-004', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80'),
  ('DEMO-CAT-001', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80'),
  ('DEMO-CAT-002', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80'),
  ('DEMO-CAT-003', 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=80'),
  ('DEMO-CAT-004', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80'),
  ('DEMO-BIRD-001', 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&q=80'),
  ('DEMO-BIRD-002', 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=80'),
  ('DEMO-FISH-001', 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&q=80'),
  ('DEMO-FISH-002', 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80')
) AS image(sku, image_url)
JOIN products product ON product.sku = image.sku
WHERE NOT EXISTS (
  SELECT 1 FROM product_images existing WHERE existing.product_id = product.id
);
