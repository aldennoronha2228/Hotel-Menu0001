-- ========================================
-- UPDATE MENU - Clear old items and add new menu
-- ========================================

-- Step 1: Delete all existing menu items and categories
DELETE FROM order_items;
DELETE FROM menu_items;
DELETE FROM categories;

-- Step 2: Insert new categories
INSERT INTO categories (name, display_order) VALUES
  ('Chinese Starters', 1),
  ('Twist of Mexican', 2),
  ('Quesadilla', 3),
  ('Pastas', 4),
  ('Noodles N Rice', 5);

-- Step 3: Insert Chinese Starters
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Green Chilly Gobi',
  120,
  (SELECT id FROM categories WHERE name = 'Chinese Starters'),
  'veg',
  true
UNION ALL SELECT 'Green Chilly Chicken', 130, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Green Chilly Chicken Sausage', 140, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Manchurian Gobi', 120, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'veg', true
UNION ALL SELECT 'Manchurian Chicken', 130, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Manchurian Chicken Sausage', 140, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Honey Chilly Gobi', 130, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'veg', true
UNION ALL SELECT 'Honey Chilly Potato', 140, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'veg', true
UNION ALL SELECT 'Honey Chilly Chicken', 150, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Honey Chilly Chicken Sausage', 150, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Basil Chilly Gobi', 130, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'veg', true
UNION ALL SELECT 'Basil Chilly Chicken', 140, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Basil Chilly Chicken Sausage', 150, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Lemon Chilly Gobi', 130, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'veg', true
UNION ALL SELECT 'Lemon Chilly Chicken', 140, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Lemon Chilly Chicken Sausage', 150, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Black Pepper Gobi', 130, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'veg', true
UNION ALL SELECT 'Black Pepper Chicken', 140, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Black Pepper Chicken Sausage', 150, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Dragon Chicken', 140, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Garlic Chicken with Cheese Sauce', 180, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'non-veg', true
UNION ALL SELECT 'Add on: Veg Noodle', 50, (SELECT id FROM categories WHERE name = 'Chinese Starters'), 'veg', true;

-- Step 4: Insert Twist of Mexican
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Burrito Bowl',
  130,
  (SELECT id FROM categories WHERE name = 'Twist of Mexican'),
  'veg',
  true
UNION ALL SELECT 'Bean Burrito Wrap', 140, (SELECT id FROM categories WHERE name = 'Twist of Mexican'), 'veg', true
UNION ALL SELECT 'Chicken Burrito Wrap', 150, (SELECT id FROM categories WHERE name = 'Twist of Mexican'), 'non-veg', true
UNION ALL SELECT 'Chicken Sausage Burrito Wrap', 160, (SELECT id FROM categories WHERE name = 'Twist of Mexican'), 'non-veg', true
UNION ALL SELECT 'Spicy Paneer Fajita', 140, (SELECT id FROM categories WHERE name = 'Twist of Mexican'), 'veg', true
UNION ALL SELECT 'Sweet Chilly Paneer Fajita', 140, (SELECT id FROM categories WHERE name = 'Twist of Mexican'), 'veg', true
UNION ALL SELECT 'Sweet Chilly Chicken Fajita', 140, (SELECT id FROM categories WHERE name = 'Twist of Mexican'), 'non-veg', true
UNION ALL SELECT 'Spicy Chicken Fajita', 140, (SELECT id FROM categories WHERE name = 'Twist of Mexican'), 'non-veg', true
UNION ALL SELECT 'Spicy Chicken Sausage Fajita', 150, (SELECT id FROM categories WHERE name = 'Twist of Mexican'), 'non-veg', true;

-- Step 5: Insert Quesadilla
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Plain Cheese Quesadilla',
  120,
  (SELECT id FROM categories WHERE name = 'Quesadilla'),
  'veg',
  true
UNION ALL SELECT 'Refried Kidney Bean Quesadilla', 130, (SELECT id FROM categories WHERE name = 'Quesadilla'), 'veg', true
UNION ALL SELECT 'Spicy Egg Quesadilla', 130, (SELECT id FROM categories WHERE name = 'Quesadilla'), 'non-veg', true
UNION ALL SELECT 'Spicy Mushroom Quesadilla', 150, (SELECT id FROM categories WHERE name = 'Quesadilla'), 'veg', true
UNION ALL SELECT 'Paneer Quesadilla', 150, (SELECT id FROM categories WHERE name = 'Quesadilla'), 'veg', true
UNION ALL SELECT 'Fried Chicken Quesadilla', 150, (SELECT id FROM categories WHERE name = 'Quesadilla'), 'non-veg', true
UNION ALL SELECT 'Stir Fry Chicken Quesadilla', 150, (SELECT id FROM categories WHERE name = 'Quesadilla'), 'non-veg', true;

-- Step 6: Insert Pastas
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Alfredo Pasta (White Sauce)',
  130,
  (SELECT id FROM categories WHERE name = 'Pastas'),
  'veg',
  true
UNION ALL SELECT 'Basil Italiano Pasta (Red Sauce Spicy)', 130, (SELECT id FROM categories WHERE name = 'Pastas'), 'veg', true
UNION ALL SELECT 'Basil Red Pepper Pasta (White Sauce Spicy)', 130, (SELECT id FROM categories WHERE name = 'Pastas'), 'veg', true
UNION ALL SELECT 'Basil Tomato Cream Pasta (Red & White Sauce)', 150, (SELECT id FROM categories WHERE name = 'Pastas'), 'veg', true
UNION ALL SELECT 'Basil Creamy Pasta (White Sauce)', 150, (SELECT id FROM categories WHERE name = 'Pastas'), 'veg', true
UNION ALL SELECT 'Yorkshire Pasta (Red Sauce Mild Spicy)', 150, (SELECT id FROM categories WHERE name = 'Pastas'), 'veg', true
UNION ALL SELECT 'Tuscany Pasta (White Sauce Mild Spicy)', 150, (SELECT id FROM categories WHERE name = 'Pastas'), 'veg', true;

-- Step 7: Insert Noodles N Rice
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Veg Noodles',
  80,
  (SELECT id FROM categories WHERE name = 'Noodles N Rice'),
  'veg',
  true
UNION ALL SELECT 'Egg Noodles', 90, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Chicken Noodles', 120, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Veg Fried Rice', 80, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'veg', true
UNION ALL SELECT 'Egg Fried Rice', 90, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Chicken Fried Rice', 120, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Tossed with Schzwan Sauce', 40, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'veg', true
UNION ALL SELECT 'Green Chilly Paneer Noodle', 120, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'veg', true
UNION ALL SELECT 'Green Chilly Chicken Noodle', 130, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Honey Chilly Paneer Noodle', 130, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'veg', true
UNION ALL SELECT 'Honey Chilly Chicken Noodle', 130, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Basil Chilly Paneer Noodle', 130, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'veg', true
UNION ALL SELECT 'Basil Chilly Chicken Noodle', 130, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Mi Goreng Egg', 120, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Mi Goreng Chicken', 140, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Mi Goreng Chicken Sausage', 150, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Dry Curry Paneer Noodle', 120, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'veg', true
UNION ALL SELECT 'Dry Curry Chicken Noodle', 140, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Veg Noodle Soup', 100, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'veg', true
UNION ALL SELECT 'Egg Noodle Soup', 110, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Chicken Noodle Soup', 120, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true
UNION ALL SELECT 'Nasi Ayam', 140, (SELECT id FROM categories WHERE name = 'Noodles N Rice'), 'non-veg', true;

-- Step 8: Insert more categories
INSERT INTO categories (name, display_order) VALUES
  ('Basilcombo Meals', 6),
  ('Indian Dishes', 7),
  ('Coolers', 8),
  ('Ice-cream Shakes', 9),
  ('Desserts', 10);

-- Step 9: Insert Basilcombo Meals - Chinese
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Basil Chilly Paneer with Plain Rice',
  130,
  (SELECT id FROM categories WHERE name = 'Basilcombo Meals'),
  'veg',
  true
UNION ALL SELECT 'Basil Chilly Paneer with Butter Garlic Rice', 140, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'veg', true
UNION ALL SELECT 'Basil Chilly Paneer with Veg Fried Rice', 150, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'veg', true
UNION ALL SELECT 'Honey Chilly Paneer with Plain Rice', 130, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'veg', true
UNION ALL SELECT 'Honey Chilly Paneer with Butter Garlic Rice', 140, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'veg', true
UNION ALL SELECT 'Honey Chilly Paneer with Veg Fried Rice', 150, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'veg', true
UNION ALL SELECT 'Basil Chilly Chicken with Plain Rice', 130, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'non-veg', true
UNION ALL SELECT 'Basil Chilly Chicken with Butter Garlic Rice', 140, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'non-veg', true
UNION ALL SELECT 'Basil Chilly Chicken with Veg Fried Rice', 150, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'non-veg', true
UNION ALL SELECT 'Honey Chilly Chicken with Plain Rice', 130, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'non-veg', true
UNION ALL SELECT 'Honey Chilly Chicken with Butter Garlic Rice', 140, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'non-veg', true
UNION ALL SELECT 'Honey Chilly Chicken with Veg Fried Rice', 150, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'non-veg', true;

-- Step 10: Insert Basilcombo Meals - Continental
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Cheesy Tabasco Mushroom with Butter Garlic Rice',
  130,
  (SELECT id FROM categories WHERE name = 'Basilcombo Meals'),
  'veg',
  true
UNION ALL SELECT 'Mexican Cream Sauce Veg Ball with Plain Rice', 140, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'veg', true
UNION ALL SELECT 'Mexican Cream Sauce Veg Ball with Butter Garlic Rice', 150, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'veg', true
UNION ALL SELECT 'Cheesy Tabasco Chicken with Plain Rice', 140, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'non-veg', true
UNION ALL SELECT 'Cheesy Tabasco Chicken with Butter Garlic Rice', 150, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'non-veg', true
UNION ALL SELECT 'Mexican Cream Sauce Chicken with Plain Rice', 140, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'non-veg', true
UNION ALL SELECT 'Mexican Cream Sauce Chicken with Butter Garlic Rice', 150, (SELECT id FROM categories WHERE name = 'Basilcombo Meals'), 'non-veg', true;

-- Step 11: Insert Dal Kichidi & Biriyani
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Dal Kichidi',
  90,
  (SELECT id FROM categories WHERE name = 'Indian Dishes'),
  'veg',
  true
UNION ALL SELECT 'Chicken Dal Kichidi', 130, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'non-veg', true
UNION ALL SELECT 'With Tadka Extra', 20, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Ambur Egg Biriyani', 120, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'non-veg', true
UNION ALL SELECT 'Ambur Paneer Biriyani', 130, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Ambur Chicken Biriyani (Bone)', 150, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'non-veg', true;

-- Step 12: Insert Indian Dishes
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Dal Fry',
  90,
  (SELECT id FROM categories WHERE name = 'Indian Dishes'),
  'veg',
  true
UNION ALL SELECT 'Rajma Masala', 130, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Aloo Gobi Butter Masala', 140, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Green Peas Masala', 140, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Mutter Panner', 140, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Tawa Masala Panner', 140, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Pepper Masala Panner', 140, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Egg Butter Masala', 140, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'non-veg', true
UNION ALL SELECT 'Egg Pepper Masala', 140, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'non-veg', true
UNION ALL SELECT 'Butter Chicken', 190, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'non-veg', true
UNION ALL SELECT 'Tawa Masala Chicken', 190, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'non-veg', true
UNION ALL SELECT 'Pepper Masala Chicken', 190, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'non-veg', true
UNION ALL SELECT 'Steam Rice (Half)', 30, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Steam Rice (Full)', 50, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Butter Garlic Rice (Half)', 50, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Butter Garlic Rice (Full)', 70, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Ghee Rice (Half)', 70, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Ghee Rice (Full)', 90, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Parota / Chapathi', 20, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true
UNION ALL SELECT 'Extra Butter', 10, (SELECT id FROM categories WHERE name = 'Indian Dishes'), 'veg', true;

-- Step 13: Insert Coolers
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Mineral Water (1 Ltr)',
  25,
  (SELECT id FROM categories WHERE name = 'Coolers'),
  'veg',
  true
UNION ALL SELECT 'Coke / 7 Up (300ml)', 25, (SELECT id FROM categories WHERE name = 'Coolers'), 'veg', true
UNION ALL SELECT 'Lime Soda', 30, (SELECT id FROM categories WHERE name = 'Coolers'), 'veg', true
UNION ALL SELECT 'Purple Haze', 40, (SELECT id FROM categories WHERE name = 'Coolers'), 'veg', true
UNION ALL SELECT 'Blue Curacao', 40, (SELECT id FROM categories WHERE name = 'Coolers'), 'veg', true
UNION ALL SELECT 'Strawberry Punch', 40, (SELECT id FROM categories WHERE name = 'Coolers'), 'veg', true
UNION ALL SELECT 'Ice Lemon Tea', 40, (SELECT id FROM categories WHERE name = 'Coolers'), 'veg', true
UNION ALL SELECT 'Coke Float', 50, (SELECT id FROM categories WHERE name = 'Coolers'), 'veg', true
UNION ALL SELECT 'Virgin Mojito', 70, (SELECT id FROM categories WHERE name = 'Coolers'), 'veg', true
UNION ALL SELECT 'Fresh Fruit Juice (Seasonal)', 60, (SELECT id FROM categories WHERE name = 'Coolers'), 'veg', true;

-- Step 14: Insert Ice-cream Shakes
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Irish Coffee',
  70,
  (SELECT id FROM categories WHERE name = 'Ice-cream Shakes'),
  'veg',
  true
UNION ALL SELECT 'Hershey''s Chocolate', 70, (SELECT id FROM categories WHERE name = 'Ice-cream Shakes'), 'veg', true
UNION ALL SELECT 'Cold Coffee', 70, (SELECT id FROM categories WHERE name = 'Ice-cream Shakes'), 'veg', true
UNION ALL SELECT 'Oreo Shake', 70, (SELECT id FROM categories WHERE name = 'Ice-cream Shakes'), 'veg', true
UNION ALL SELECT 'Litchi Rose', 70, (SELECT id FROM categories WHERE name = 'Ice-cream Shakes'), 'veg', true
UNION ALL SELECT 'Mango Shake', 70, (SELECT id FROM categories WHERE name = 'Ice-cream Shakes'), 'veg', true
UNION ALL SELECT 'Extra Scoop Ice Cream', 20, (SELECT id FROM categories WHERE name = 'Ice-cream Shakes'), 'veg', true;

-- Step 15: Insert Desserts
INSERT INTO menu_items (name, price, category_id, type, available) 
SELECT 
  'Chocolate Biscuit Pudding',
  40,
  (SELECT id FROM categories WHERE name = 'Desserts'),
  'veg',
  true
UNION ALL SELECT 'Chocolate Biscuit Pudding with Vanilla Ice Cream', 50, (SELECT id FROM categories WHERE name = 'Desserts'), 'veg', true
UNION ALL SELECT 'Chocolate Biscuit Pudding with Chocolate Ice Cream', 60, (SELECT id FROM categories WHERE name = 'Desserts'), 'veg', true
UNION ALL SELECT 'Fried Ice Cream with Chocolate Sauce', 90, (SELECT id FROM categories WHERE name = 'Desserts'), 'veg', true
UNION ALL SELECT 'Fried Oreo Ice Cream with Chocolate Sauce', 90, (SELECT id FROM categories WHERE name = 'Desserts'), 'veg', true;

