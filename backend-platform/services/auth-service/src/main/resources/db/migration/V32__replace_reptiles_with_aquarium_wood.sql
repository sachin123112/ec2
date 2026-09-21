-- Replace the legacy Reptiles category while preserving product relationships.
DO $$
DECLARE
  reptiles_id INTEGER;
  aquarium_wood_id INTEGER;
BEGIN
  SELECT id INTO reptiles_id FROM categories WHERE name = 'Reptiles';
  SELECT id INTO aquarium_wood_id FROM categories WHERE name = 'Aquarium Wood';

  IF reptiles_id IS NOT NULL AND aquarium_wood_id IS NULL THEN
    UPDATE categories
    SET name = 'Aquarium Wood'
    WHERE id = reptiles_id;
  ELSIF reptiles_id IS NOT NULL AND aquarium_wood_id IS NOT NULL THEN
    UPDATE products
    SET category_id = aquarium_wood_id
    WHERE category_id = reptiles_id;

    DELETE FROM categories
    WHERE id = reptiles_id;
  ELSIF reptiles_id IS NULL AND aquarium_wood_id IS NULL THEN
    INSERT INTO categories (name) VALUES ('Aquarium Wood');
  END IF;
END $$;
