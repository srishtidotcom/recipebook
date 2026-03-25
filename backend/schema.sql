-- ============================================
-- RecipeBook Database Schema + Sample Data
-- Run: mysql -u root -p < schema.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS recipebook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recipebook;

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  bio        TEXT,
  avatar     VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          NOT NULL,
  title        VARCHAR(200) NOT NULL,
  slug         VARCHAR(220) NOT NULL UNIQUE,
  description  TEXT,
  category     VARCHAR(50)  NOT NULL,
  prep_time    INT DEFAULT 0,
  cook_time    INT DEFAULT 0,
  servings     INT DEFAULT 4,
  ingredients  JSON,
  instructions JSON,
  image        VARCHAR(255),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id  INT  NOT NULL,
  user_id    INT  NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- SAMPLE DATA
-- Password for all sample users: "password123"
-- bcrypt hash of "password123"
-- ─────────────────────────────────────────────

INSERT INTO users (username, email, password, bio) VALUES
('chef_marco', 'marco@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oN5O4Pcn6', 'Passionate Italian home cook sharing family recipes.'),
('sarah_bakes', 'sarah@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oN5O4Pcn6', 'Baker, foodie, and coffee enthusiast.'),
('spice_king', 'raj@example.com',   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oN5O4Pcn6', 'Bringing the heat with authentic Indian spices.');

INSERT INTO recipes (user_id, title, slug, description, category, prep_time, cook_time, servings, ingredients, instructions, image) VALUES
(
  1,
  'Classic Spaghetti Carbonara',
  'classic-spaghetti-carbonara',
  'A creamy Roman pasta dish made with eggs, Pecorino Romano, guanciale, and black pepper. No cream needed!',
  'Dinner',
  15, 20, 4,
  '["400g spaghetti","200g guanciale or pancetta","4 large eggs","100g Pecorino Romano, finely grated","100g Parmigiano-Reggiano, finely grated","Freshly ground black pepper","Salt for pasta water"]',
  '["Bring a large pot of salted water to a boil. Cook spaghetti until al dente.","While pasta cooks, fry the guanciale in a large pan over medium heat until crispy. Remove from heat.","Beat eggs with most of the cheese and a generous amount of black pepper in a bowl.","Reserve 1 cup of pasta water, then drain pasta. Add hot pasta to the guanciale pan off the heat.","Quickly pour egg mixture over pasta, tossing vigorously. Add pasta water a little at a time until creamy.","Serve immediately with remaining cheese and extra pepper."]',
  NULL
),
(
  2,
  'Fluffy Blueberry Pancakes',
  'fluffy-blueberry-pancakes',
  'Light and airy pancakes bursting with fresh blueberries. Perfect weekend breakfast for the whole family.',
  'Breakfast',
  10, 20, 4,
  '["2 cups all-purpose flour","2 tbsp sugar","2 tsp baking powder","1/2 tsp baking soda","1/2 tsp salt","2 large eggs","1 3/4 cups buttermilk","3 tbsp melted butter","1 cup fresh blueberries","1 tsp vanilla extract"]',
  '["Mix flour, sugar, baking powder, baking soda, and salt in a large bowl.","In another bowl, whisk eggs, buttermilk, melted butter, and vanilla.","Pour wet ingredients into dry and stir until just combined (lumps are fine!).","Fold in blueberries gently.","Heat a griddle over medium heat and lightly butter it.","Pour 1/4 cup batter per pancake. Cook until bubbles form, then flip. Cook 1-2 more minutes.","Serve with maple syrup and extra blueberries."]',
  NULL
),
(
  3,
  'Chicken Tikka Masala',
  'chicken-tikka-masala',
  'The beloved British-Indian curry with tender marinated chicken in a rich, spiced tomato cream sauce.',
  'Dinner',
  30, 40, 6,
  '["800g boneless chicken thighs","1 cup plain yogurt","2 tbsp lemon juice","2 tsp garam masala","2 tsp cumin","1 tsp turmeric","1 tsp chili powder","3 tbsp butter","1 onion, diced","4 garlic cloves, minced","1 tbsp ginger, grated","1 can (400g) crushed tomatoes","1 cup heavy cream","Fresh cilantro to garnish"]',
  '["Mix yogurt, lemon juice, and spices. Marinate chicken for at least 2 hours or overnight.","Grill or broil chicken until charred at edges. Set aside.","Melt butter in a pan, sauté onion until golden. Add garlic and ginger, cook 2 minutes.","Add crushed tomatoes and remaining spices. Simmer 15 minutes.","Blend sauce until smooth, return to pan. Add cream and stir well.","Add grilled chicken pieces and simmer 10 more minutes.","Garnish with cilantro and serve with basmati rice or naan."]',
  NULL
),
(
  1,
  'Tiramisu',
  'tiramisu',
  'The iconic Italian dessert with layers of espresso-soaked ladyfingers and mascarpone cream.',
  'Dessert',
  30, 0, 8,
  '["500g mascarpone cheese","4 large eggs, separated","100g powdered sugar","300ml strong espresso, cooled","3 tbsp dark rum or Marsala wine","30-35 ladyfinger biscuits","Unsweetened cocoa powder for dusting"]',
  '["Whisk egg yolks with sugar until pale and thick. Fold in mascarpone until smooth.","Beat egg whites to stiff peaks, then fold gently into mascarpone mixture.","Mix espresso with rum in a shallow bowl.","Dip each ladyfinger briefly (1-2 seconds) in espresso mixture.","Arrange soaked ladyfingers in a single layer in a dish.","Spread half the mascarpone cream over the ladyfingers. Repeat layers.","Dust generously with cocoa powder. Refrigerate at least 4 hours before serving."]',
  NULL
),
(
  2,
  'Avocado Toast with Poached Eggs',
  'avocado-toast-with-poached-eggs',
  'Trendy, nutritious, and endlessly customizable. A perfectly ripe avocado on crusty sourdough.',
  'Breakfast',
  5, 10, 2,
  '["2 large eggs","2 thick slices sourdough bread","1 ripe avocado","1 lemon, juiced","Red pepper flakes","Salt and black pepper","1 tbsp white vinegar (for poaching)","Optional: microgreens, cherry tomatoes"]',
  '["Toast bread slices to your preferred level of crunch.","Mash avocado with lemon juice, salt, and pepper. Spread onto toast.","Bring a pot of water with vinegar to a gentle simmer. Create a gentle whirlpool.","Crack each egg into the swirling water. Poach 3-4 minutes for runny yolks.","Remove eggs with a slotted spoon, pat dry, place on avocado toast.","Season with red pepper flakes, salt, and pepper. Add optional toppings."]',
  NULL
),
(
  3,
  'Mango Lassi',
  'mango-lassi',
  'A refreshing chilled yogurt drink with sweet mango and a hint of cardamom. Perfect summer drink.',
  'Drinks',
  5, 0, 2,
  '["2 ripe mangoes, peeled and cubed","1 cup plain yogurt","1/2 cup cold milk","2 tbsp sugar or honey","1/4 tsp cardamom powder","Pinch of salt","Ice cubes"]',
  '["Add mango pieces, yogurt, milk, sugar, and cardamom to a blender.","Blend until completely smooth and frothy.","Taste and adjust sweetness if needed.","Pour over ice cubes in tall glasses.","Garnish with a pinch of cardamom or a small mango slice."]',
  NULL
);

INSERT INTO comments (recipe_id, user_id, content) VALUES
(1, 2, 'Made this last night and it was absolutely divine! The key really is keeping the pan off the heat when adding the egg mixture.'),
(1, 3, 'Authentic and delicious. I used pancetta since guanciale is hard to find here and it was still amazing.'),
(2, 1, 'My kids devoured these! I added a touch of cinnamon to the batter and it elevated the whole dish.'),
(3, 1, 'Best tikka masala I have ever made at home. The marinating time makes a huge difference!'),
(3, 2, 'I made this for a dinner party and everyone was blown away. Served it with homemade garlic naan.'),
(4, 3, 'The tiramisu set perfectly overnight. I skipped the rum for a family version - still incredible.');

-- ─────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_user_id  ON recipes(user_id);
CREATE INDEX idx_comments_recipe  ON comments(recipe_id);
