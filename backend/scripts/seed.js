const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Product images from Unsplash
const productImages = {
  // Vegetables
  tomato: 'https://images.unsplash.com/photo-1546470427-227e9e3e0e4e?w=500',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500',
  cabbage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=500',
  spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500',
  cauliflower: 'https://images.unsplash.com/photo-1568584711271-e88a6c8b6a3b?w=500',
  brinjal: 'https://images.unsplash.com/photo-1621518183654-f4994c4e6e4e?w=500',
  cucumber: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=500',
  pumpkin: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=500',
  lettuce: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500',
  bittergourd: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=500',
  ladyfinger: 'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=500',
  beetroot: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=500',
  // Fruits
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500',
  banana: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500',
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500',
  grapes: 'https://images.unsplash.com/photo-1599819177331-6d0b4cd1e8d7?w=500',
  papaya: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500',
  guava: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=500',
  pomegranate: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500',
  watermelon: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=500',
  // Seeds
  sunflowerseeds: 'https://images.unsplash.com/photo-1611575619049-4e4e4e4e4e4e?w=500',
  pumpkinseeds: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500',
  chiaseeds: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=500',
  flaxseeds: 'https://images.unsplash.com/photo-1611575619049-4e4e4e4e4e4e?w=500',
  sesameseeds: 'https://images.unsplash.com/photo-1612257416648-8b4e4e4e4e4e?w=500',
  corianderseeds: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500',
  mustardseeds: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500',
  // Fibre & Protein
  soybeans: 'https://images.unsplash.com/photo-1612257416648-8b4e4e4e4e4e?w=500',
  chickpeas: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=500',
  lentils: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=500',
  blackbeans: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=500',
  quinoa: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
  hemp: 'https://images.unsplash.com/photo-1611575619049-4e4e4e4e4e4e?w=500',
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // ========== REMOVE ALL DEMO ACCOUNTS ==========
    console.log('🗑️  Removing all demo accounts...');

    // Get IDs of users to keep (admin) and users to delete
    const [usersToDelete] = await pool.execute(
      "SELECT id FROM users WHERE email != 'ashwithashettigar628@gmail.com'"
    );

    if (usersToDelete.length > 0) {
      const userIds = usersToDelete.map(u => u.id);
      const placeholders = userIds.map(() => '?').join(',');

      // Get farmer IDs for those users
      const [farmersToDelete] = await pool.execute(
        `SELECT id FROM farmers WHERE user_id IN (${placeholders})`,
        userIds
      );

      if (farmersToDelete.length > 0) {
        const farmerIds = farmersToDelete.map(f => f.id);
        const farmerPlaceholders = farmerIds.map(() => '?').join(',');

        // Get product IDs for those farmers
        const [productsToDelete] = await pool.execute(
          `SELECT id FROM products WHERE farmer_id IN (${farmerPlaceholders})`,
          farmerIds
        );

        if (productsToDelete.length > 0) {
          const productIds = productsToDelete.map(p => p.id);
          const productPlaceholders = productIds.map(() => '?').join(',');

          // Delete reviews for those products
          await pool.execute(`DELETE FROM reviews WHERE product_id IN (${productPlaceholders})`, productIds);

          // Delete cart items for those products
          await pool.execute(`DELETE FROM cart WHERE product_id IN (${productPlaceholders})`, productIds);

          // Get order IDs that contain those products
          const [orderItemsToDelete] = await pool.execute(
            `SELECT DISTINCT order_id FROM order_items WHERE product_id IN (${productPlaceholders})`,
            productIds
          );

          if (orderItemsToDelete.length > 0) {
            const orderIds = orderItemsToDelete.map(o => o.order_id);
            const orderPlaceholders = orderIds.map(() => '?').join(',');
            await pool.execute(`DELETE FROM order_items WHERE order_id IN (${orderPlaceholders})`, orderIds);
            await pool.execute(`DELETE FROM orders WHERE id IN (${orderPlaceholders})`, orderIds);
          }

          // Delete traceability for those products
          await pool.execute(`DELETE FROM traceability WHERE product_id IN (${productPlaceholders})`, productIds);

          // Delete products
          await pool.execute(`DELETE FROM products WHERE id IN (${productPlaceholders})`, productIds);
        }

        // Delete farmers
        await pool.execute(`DELETE FROM farmers WHERE id IN (${farmerPlaceholders})`, farmerIds);
      }

      // Delete post_likes, comments, posts for those users
      const [postsToDelete] = await pool.execute(
        `SELECT id FROM posts WHERE user_id IN (${placeholders})`,
        userIds
      );
      if (postsToDelete.length > 0) {
        const postIds = postsToDelete.map(p => p.id);
        const postPlaceholders = postIds.map(() => '?').join(',');
        await pool.execute(`DELETE FROM post_likes WHERE post_id IN (${postPlaceholders})`, postIds);
        await pool.execute(`DELETE FROM comments WHERE post_id IN (${postPlaceholders})`, postIds);
        await pool.execute(`DELETE FROM posts WHERE id IN (${postPlaceholders})`, postIds);
      }

      // Delete remaining orders placed by those users (buyer orders)
      const [buyerOrders] = await pool.execute(
        `SELECT id FROM orders WHERE user_id IN (${placeholders})`,
        userIds
      );
      if (buyerOrders.length > 0) {
        const buyerOrderIds = buyerOrders.map(o => o.id);
        const buyerOrderPlaceholders = buyerOrderIds.map(() => '?').join(',');
        await pool.execute(`DELETE FROM order_items WHERE order_id IN (${buyerOrderPlaceholders})`, buyerOrderIds);
        await pool.execute(`DELETE FROM orders WHERE id IN (${buyerOrderPlaceholders})`, buyerOrderIds);
      }

      // Delete remaining reviews, cart, post_likes, comments by those users
      await pool.execute(`DELETE FROM reviews WHERE user_id IN (${placeholders})`, userIds);
      await pool.execute(`DELETE FROM cart WHERE user_id IN (${placeholders})`, userIds);
      await pool.execute(`DELETE FROM post_likes WHERE user_id IN (${placeholders})`, userIds);
      await pool.execute(`DELETE FROM comments WHERE user_id IN (${placeholders})`, userIds);

      // Finally delete the users
      await pool.execute(`DELETE FROM users WHERE id IN (${placeholders})`, userIds);
    }

    console.log('  ✓ All demo accounts removed\n');

    // ========== CREATE ADMIN ACCOUNT ==========
    console.log('👤 Creating admin account...');
    const adminPassword = await bcrypt.hash('Ashwitha@628', 12);

    await pool.execute(
      'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?, name = ?, role = ?',
      [
        'ashwithashettigar628@gmail.com',
        adminPassword,
        'Ashwitha Shettigar',
        '9999999999',
        'admin',
        adminPassword,
        'Ashwitha Shettigar',
        'admin'
      ]
    );
    console.log('  ✓ Admin: ashwithashettigar628@gmail.com / Ashwitha@628\n');

    // ========== CREATE FARMER ACCOUNTS ==========
    console.log('👨‍🌾 Creating farmer accounts...');
    const farmerPassword = await bcrypt.hash('farmer123', 10);

    const farmers = [
      ['farmer1@farmersmarket.com', 'Ramesh Singh', '9876543220', 'Green Valley Farm', 'Pune, Maharashtra', 'Organic vegetables and fruits grown with natural methods', 18.5204, 73.8567, 4.5],
      ['farmer2@farmersmarket.com', 'Lakshmi Devi', '9876543221', 'Sunrise Organic Farm', 'Nashik, Maharashtra', 'Fresh organic produce with zero pesticides', 19.9975, 73.7898, 4.7],
      ['farmer3@farmersmarket.com', 'Suresh Reddy', '9876543222', 'Golden Harvest Farm', 'Bangalore, Karnataka', 'Premium quality fruits and vegetables', 12.9716, 77.5946, 4.3],
      ['farmer4@farmersmarket.com', 'Meena Kumari', '9876543223', 'Nature Fresh Farm', 'Hyderabad, Telangana', 'Chemical-free farming with traditional methods', 17.3850, 78.4867, 4.6],
      ['farmer5@farmersmarket.com', 'Vijay Kumar', '9876543224', 'Eco Green Farm', 'Chennai, Tamil Nadu', 'Sustainable agriculture for a healthier tomorrow', 13.0827, 80.2707, 4.4],
      ['farmer6@farmersmarket.com', 'Anita Sharma', '9876543225', 'Seed Heritage Farm', 'Jaipur, Rajasthan', 'Specializing in heirloom seeds and protein crops', 26.9124, 75.7873, 4.8],
      ['farmer7@farmersmarket.com', 'Ravi Patel', '9876543226', 'Protein Valley Farm', 'Ahmedabad, Gujarat', 'High-protein legumes and fibre-rich crops', 23.0225, 72.5714, 4.5]
    ];

    const farmerDbIds = [];

    for (const [email, name, phone, farmName, location, description, lat, lng, rating] of farmers) {
      const [userResult] = await pool.execute(
        'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
        [email, farmerPassword, name, phone, 'farmer']
      );

      if (userResult.affectedRows > 0) {
        const userId = userResult.insertId;
        const [farmerResult] = await pool.execute(
          'INSERT INTO farmers (user_id, farm_name, location, description, latitude, longitude, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, farmName, location, description, lat, lng, rating]
        );
        farmerDbIds.push(farmerResult.insertId);
      }
    }
    console.log('  ✓ Created 7 farmer accounts\n');

    // ========== CREATE PRODUCTS ==========
    console.log('🥬 Creating products...');

    // Helper to insert product + traceability
    const insertProduct = async (farmerId, name, category, description, price, quantity, unit, imageUrl, batchSuffix, harvestDate) => {
      const batchId = `BATCH-${batchSuffix}`;
      const [result] = await pool.execute(
        'INSERT INTO products (farmer_id, name, category, description, price, quantity, unit, image_url, batch_id, harvest_date, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [farmerId, name, category, description, price, quantity, unit, imageUrl, batchId, harvestDate, true]
      );
      await pool.execute(
        'INSERT INTO traceability (batch_id, farmer_id, product_id, harvest_date, transport_info, storage_conditions, certifications) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          batchId,
          farmerId,
          result.insertId,
          harvestDate,
          'Refrigerated transport, delivered within 24 hours',
          'Stored at 4-8°C in cold storage',
          'Organic Certified, FSSAI Approved'
        ]
      );
      return result.insertId;
    };

    // ---- FARMER 1: Green Valley Farm (Pune) — Vegetables ----
    await insertProduct(farmerDbIds[0], 'Fresh Tomatoes', 'Vegetables', 'Juicy red tomatoes, perfect for salads and cooking. Grown without pesticides.', 40, 50, 'kg', productImages.tomato, 'TOM-001', '2026-04-15');
    await insertProduct(farmerDbIds[0], 'Organic Potatoes', 'Vegetables', 'Farm-fresh potatoes, ideal for all dishes. Rich in carbohydrates and potassium.', 30, 100, 'kg', productImages.potato, 'POT-001', '2026-04-10');
    await insertProduct(farmerDbIds[0], 'Red Onions', 'Vegetables', 'Premium quality onions with long shelf life. Essential kitchen staple.', 35, 75, 'kg', productImages.onion, 'ONI-001', '2026-04-12');
    await insertProduct(farmerDbIds[0], 'Fresh Lettuce', 'Lettuce', 'Crisp and fresh green lettuce leaves, perfect for salads and wraps. Rich in vitamins A and K.', 60, 30, 'kg', productImages.lettuce, 'LET-001', '2026-05-01');
    await insertProduct(farmerDbIds[0], 'Iceberg Lettuce', 'Lettuce', 'Crunchy iceberg lettuce heads, great for burgers and salads. High water content, very refreshing.', 55, 25, 'kg', productImages.lettuce, 'LET-002', '2026-05-02');

    // ---- FARMER 2: Sunrise Organic Farm (Nashik) — Vegetables ----
    await insertProduct(farmerDbIds[1], 'Fresh Carrots', 'Vegetables', 'Sweet and crunchy organic carrots. Excellent source of beta-carotene and fibre.', 45, 40, 'kg', productImages.carrot, 'CAR-001', '2026-04-14');
    await insertProduct(farmerDbIds[1], 'Green Cabbage', 'Vegetables', 'Fresh cabbage, rich in nutrients and fibre. Great for stir-fries and salads.', 25, 60, 'kg', productImages.cabbage, 'CAB-001', '2026-04-13');
    await insertProduct(farmerDbIds[1], 'Fresh Spinach', 'Vegetables', 'Iron-rich organic spinach leaves. Excellent source of vitamins and minerals.', 30, 20, 'kg', productImages.spinach, 'SPI-001', '2026-05-01');
    await insertProduct(farmerDbIds[1], 'Bitter Gourd', 'Vegetables', 'Fresh bitter gourd known for its medicinal properties. Excellent for blood sugar management.', 50, 35, 'kg', productImages.bittergourd, 'BIT-001', '2026-04-20');
    await insertProduct(farmerDbIds[1], 'Romaine Lettuce', 'Lettuce', 'Tall and crisp romaine lettuce, ideal for Caesar salads. High in folate and vitamin C.', 65, 20, 'kg', productImages.lettuce, 'LET-003', '2026-05-03');

    // ---- FARMER 3: Golden Harvest Farm (Bangalore) — Fruits ----
    await insertProduct(farmerDbIds[2], 'Organic Bananas', 'Fruits', 'Naturally ripened bananas, rich in potassium and energy. Great for breakfast.', 50, 80, 'dozen', productImages.banana, 'BAN-001', '2026-05-01');
    await insertProduct(farmerDbIds[2], 'Alphonso Mangoes', 'Fruits', 'King of mangoes — sweet, juicy and aromatic. Seasonal delight from Ratnagiri.', 200, 25, 'kg', productImages.mango, 'MAN-001', '2026-04-20');
    await insertProduct(farmerDbIds[2], 'Kashmiri Apples', 'Fruits', 'Premium quality apples from Kashmir. Crisp, sweet and full of antioxidants.', 120, 30, 'kg', productImages.apple, 'APP-001', '2026-04-18');
    await insertProduct(farmerDbIds[2], 'Fresh Papaya', 'Fruits', 'Ripe and sweet papaya, rich in papain enzyme and vitamin C. Great for digestion.', 40, 45, 'kg', productImages.papaya, 'PAP-001', '2026-05-02');
    await insertProduct(farmerDbIds[2], 'Guava', 'Fruits', 'Fresh guava with high vitamin C content. Sweet and slightly tangy flavour.', 60, 35, 'kg', productImages.guava, 'GUA-001', '2026-04-25');

    // ---- FARMER 4: Nature Fresh Farm (Hyderabad) — Fruits & Vegetables ----
    await insertProduct(farmerDbIds[3], 'Nagpur Oranges', 'Fruits', 'Sweet and tangy oranges from Nagpur. Packed with vitamin C and antioxidants.', 60, 50, 'kg', productImages.orange, 'ORA-001', '2026-04-08');
    await insertProduct(farmerDbIds[3], 'Pomegranate', 'Fruits', 'Ruby red pomegranate seeds bursting with flavour. Rich in antioxidants and fibre.', 150, 20, 'kg', productImages.pomegranate, 'POM-001', '2026-04-15');
    await insertProduct(farmerDbIds[3], 'Watermelon', 'Fruits', 'Large sweet watermelons, perfect for summer. 92% water content, very hydrating.', 25, 40, 'kg', productImages.watermelon, 'WAT-001', '2026-05-05');
    await insertProduct(farmerDbIds[3], 'Cauliflower', 'Vegetables', 'Fresh white cauliflower, pesticide-free. Rich in vitamins C and K.', 35, 45, 'kg', productImages.cauliflower, 'CAU-001', '2026-04-11');
    await insertProduct(farmerDbIds[3], 'Brinjal (Eggplant)', 'Vegetables', 'Purple brinjal, perfect for curries and grills. Low calorie and high in fibre.', 40, 35, 'kg', productImages.brinjal, 'BRI-001', '2026-04-14');

    // ---- FARMER 5: Eco Green Farm (Chennai) — Vegetables & Seeds ----
    await insertProduct(farmerDbIds[4], 'Green Grapes', 'Fruits', 'Seedless green grapes, fresh and sweet. Rich in resveratrol and antioxidants.', 80, 30, 'kg', productImages.grapes, 'GRA-001', '2026-04-09');
    await insertProduct(farmerDbIds[4], 'Cucumber', 'Vegetables', 'Crisp and fresh cucumbers. High water content, great for hydration and salads.', 25, 40, 'kg', productImages.cucumber, 'CUC-001', '2026-04-15');
    await insertProduct(farmerDbIds[4], 'Lady Finger (Okra)', 'Vegetables', 'Fresh tender okra, rich in dietary fibre and folate. Great for curries and stir-fries.', 45, 30, 'kg', productImages.ladyfinger, 'LAD-001', '2026-04-18');
    await insertProduct(farmerDbIds[4], 'Coriander Seeds', 'Seeds', 'Aromatic coriander seeds for cooking and sprouting. Rich in antioxidants and digestive benefits.', 80, 15, 'kg', productImages.corianderseeds, 'COR-S-001', '2026-03-20');
    await insertProduct(farmerDbIds[4], 'Mustard Seeds', 'Seeds', 'Black mustard seeds for tempering and pickling. Rich in omega-3 fatty acids and selenium.', 70, 20, 'kg', productImages.mustardseeds, 'MUS-S-001', '2026-03-15');

    // ---- FARMER 6: Seed Heritage Farm (Jaipur) — Seeds ----
    await insertProduct(farmerDbIds[5], 'Sunflower Seeds', 'Seeds', 'Raw sunflower seeds, excellent source of vitamin E and healthy fats. Great for snacking.', 120, 25, 'kg', productImages.sunflowerseeds, 'SUN-S-001', '2026-03-10');
    await insertProduct(farmerDbIds[5], 'Pumpkin Seeds', 'Seeds', 'Nutrient-dense pumpkin seeds rich in magnesium, zinc and protein. Perfect for snacking.', 180, 15, 'kg', productImages.pumpkinseeds, 'PUM-S-001', '2026-03-12');
    await insertProduct(farmerDbIds[5], 'Chia Seeds', 'Seeds', 'Superfood chia seeds loaded with omega-3, fibre and protein. Great for smoothies and puddings.', 350, 10, 'kg', productImages.chiaseeds, 'CHI-S-001', '2026-03-05');
    await insertProduct(farmerDbIds[5], 'Flax Seeds', 'Seeds', 'Golden flax seeds rich in omega-3 fatty acids and lignans. Excellent for heart health.', 200, 12, 'kg', productImages.flaxseeds, 'FLA-S-001', '2026-03-08');
    await insertProduct(farmerDbIds[5], 'Sesame Seeds', 'Seeds', 'White sesame seeds rich in calcium and healthy fats. Essential for cooking and baking.', 150, 18, 'kg', productImages.sesameseeds, 'SES-S-001', '2026-03-18');
    await insertProduct(farmerDbIds[5], 'Beetroot', 'Vegetables', 'Fresh beetroot, rich in nitrates and antioxidants. Great for juices and salads.', 55, 40, 'kg', productImages.beetroot, 'BEE-001', '2026-04-22');

    // ---- FARMER 7: Protein Valley Farm (Ahmedabad) — Fibre & Protein ----
    await insertProduct(farmerDbIds[6], 'Soybeans', 'Fibre & Protein', 'Organic soybeans — complete plant protein with all essential amino acids. Great for tofu and milk.', 90, 50, 'kg', productImages.soybeans, 'SOY-001', '2026-03-25');
    await insertProduct(farmerDbIds[6], 'Chickpeas (Chana)', 'Fibre & Protein', 'Dried chickpeas, high in protein and fibre. Versatile legume for curries, hummus and salads.', 80, 60, 'kg', productImages.chickpeas, 'CHK-001', '2026-03-20');
    await insertProduct(farmerDbIds[6], 'Red Lentils (Masoor Dal)', 'Fibre & Protein', 'Split red lentils, quick-cooking and protein-rich. Excellent source of iron and folate.', 70, 55, 'kg', productImages.lentils, 'LEN-001', '2026-03-22');
    await insertProduct(farmerDbIds[6], 'Black Beans', 'Fibre & Protein', 'Organic black beans packed with protein, fibre and antioxidants. Great for Mexican dishes.', 95, 40, 'kg', productImages.blackbeans, 'BLK-001', '2026-03-18');
    await insertProduct(farmerDbIds[6], 'Quinoa', 'Fibre & Protein', 'White quinoa — a complete protein grain with all 9 essential amino acids. Gluten-free superfood.', 400, 20, 'kg', productImages.quinoa, 'QUI-001', '2026-03-10');
    await insertProduct(farmerDbIds[6], 'Hemp Seeds', 'Seeds', 'Hulled hemp seeds with perfect omega-3 to omega-6 ratio. Rich in complete protein and minerals.', 500, 8, 'kg', productImages.hemp, 'HEM-S-001', '2026-03-05');

    console.log('  ✓ Created 36 products across Vegetables, Fruits, Lettuce, Seeds, and Fibre & Protein categories\n');

    // ========== CREATE FORUM POSTS ==========
    console.log('💬 Creating forum posts...');

    const [adminUser] = await pool.execute("SELECT id FROM users WHERE email = 'ashwithashettigar628@gmail.com'");
    const [allFarmers] = await pool.execute('SELECT user_id FROM farmers LIMIT 5');

    const postUsers = [adminUser[0].id, ...allFarmers.map(f => f.user_id)];

    const posts = [
      ['Best Organic Fertilizers for Vegetables', 'I have been using chemical fertilizers for years. Now I want to switch to organic. What are the best organic fertilizers for vegetables like tomatoes and potatoes?', 'farming-tips'],
      ['How to Control Pests Naturally?', "My crops are getting affected by pests. I don't want to use chemical pesticides. What are some natural pest control methods?", 'farming-tips'],
      ['Seasonal Crop Planning Guide', 'Can someone share a guide on which crops to plant in different seasons? I am from Maharashtra region.', 'general'],
      ['Best Practices for Organic Farming', 'I am starting organic farming. What are the best practices I should follow? Any tips from experienced farmers?', 'farming-tips'],
      ['Water Conservation Techniques', 'With water scarcity increasing, what are some effective water conservation techniques for farming?', 'farming-tips'],
      ['Benefits of Chia Seeds and Flax Seeds', 'I recently started growing chia and flax seeds. What are the health benefits and how should buyers use them?', 'general'],
      ['How to Store Fresh Vegetables', 'What is the best way to store fresh vegetables to keep them fresh for longer?', 'general'],
      ['Growing Lettuce in Small Spaces', 'Lettuce is one of the easiest crops to grow. Here are some tips for growing lettuce even in small spaces or containers.', 'farming-tips']
    ];

    for (let i = 0; i < posts.length; i++) {
      const [title, content, category] = posts[i];
      const userId = postUsers[i % postUsers.length];

      const [postResult] = await pool.execute(
        'INSERT INTO posts (user_id, title, content, category, likes_count) VALUES (?, ?, ?, ?, ?)',
        [userId, title, content, category, Math.floor(Math.random() * 20)]
      );

      if (i < 4) {
        const postId = postResult.insertId;
        const comments = [
          'Great question! I have been using vermicompost and it works wonderfully.',
          'Thanks for sharing this. Very helpful information!'
        ];
        for (let j = 0; j < 2; j++) {
          const commentUserId = postUsers[(i + j + 1) % postUsers.length];
          await pool.execute(
            'INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)',
            [postId, commentUserId, comments[j]]
          );
        }
      }
    }
    console.log('  ✓ Created 8 forum posts with comments\n');

    // ========== SUMMARY ==========
    console.log('✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log('  • 1 Admin account (ashwithashettigar628@gmail.com)');
    console.log('  • 7 Farmer accounts');
    console.log('  • 36 Products: Vegetables, Fruits, Lettuce, Seeds, Fibre & Protein');
    console.log('  • 8 Forum posts with comments\n');

    console.log('🔐 Login Credentials:');
    console.log('  Admin:  ashwithashettigar628@gmail.com / Ashwitha@628');
    console.log('  Farmer: farmer1@farmersmarket.com / farmer123\n');

    console.log('🌐 Visit: http://localhost:3000');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
