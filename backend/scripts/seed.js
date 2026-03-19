const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Sample product images (using placeholder images)
const productImages = {
  tomato: 'https://images.unsplash.com/photo-1546470427-227e9e3e0e4e?w=500',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500',
  cabbage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=500',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500',
  banana: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500',
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500',
  grapes: 'https://images.unsplash.com/photo-1599819177331-6d0b4cd1e8d7?w=500',
  spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500',
  cauliflower: 'https://images.unsplash.com/photo-1568584711271-e88a6c8b6a3b?w=500',
  brinjal: 'https://images.unsplash.com/photo-1621518183654-f4994c4e6e4e?w=500',
  cucumber: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=500',
  pumpkin: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=500'
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Hash passwords
    const buyerPassword = await bcrypt.hash('buyer123', 10);
    const farmerPassword = await bcrypt.hash('farmer123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // ========== CREATE USERS ==========
    console.log('👥 Creating users...');

    // Create admin user
    await pool.execute(
      'INSERT IGNORE INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      ['admin@farmersmarket.com', adminPassword, 'Admin User', '9999999999', 'admin']
    );
    console.log('  ✓ Admin: admin@farmersmarket.com / admin123');

    // Create buyer users
    const buyers = [
      ['buyer@example.com', 'Rajesh Kumar', '9876543210'],
      ['priya@example.com', 'Priya Sharma', '9876543211'],
      ['amit@example.com', 'Amit Patel', '9876543212']
    ];

    for (const [email, name, phone] of buyers) {
      await pool.execute(
        'INSERT IGNORE INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
        [email, buyerPassword, name, phone, 'buyer']
      );
    }
    console.log('  ✓ Buyers: buyer@example.com / buyer123 (and 2 more)');

    // Create farmer users
    const farmers = [
      ['farmer1@example.com', 'Ramesh Singh', '9876543220', 'Green Valley Farm', 'Pune, Maharashtra', 'Organic vegetables and fruits', 19.0760, 72.8777, 4.5],
      ['farmer2@example.com', 'Lakshmi Devi', '9876543221', 'Sunrise Organic Farm', 'Nashik, Maharashtra', 'Fresh organic produce', 19.9975, 73.7898, 4.7],
      ['farmer3@example.com', 'Suresh Reddy', '9876543222', 'Golden Harvest Farm', 'Bangalore, Karnataka', 'Premium quality fruits and vegetables', 12.9716, 77.5946, 4.3],
      ['farmer4@example.com', 'Meena Kumari', '9876543223', 'Nature Fresh Farm', 'Hyderabad, Telangana', 'Chemical-free farming', 17.3850, 78.4867, 4.6],
      ['farmer5@example.com', 'Vijay Kumar', '9876543224', 'Eco Green Farm', 'Chennai, Tamil Nadu', 'Sustainable agriculture', 13.0827, 80.2707, 4.4]
    ];

    for (const [email, name, phone, farmName, location, description, lat, lng, rating] of farmers) {
      const [userResult] = await pool.execute(
        'INSERT IGNORE INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
        [email, farmerPassword, name, phone, 'farmer']
      );

      if (userResult.affectedRows > 0) {
        const [user] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (user.length > 0) {
          await pool.execute(
            'INSERT INTO farmers (user_id, farm_name, location, description, latitude, longitude, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user[0].id, farmName, location, description, lat, lng, rating]
          );
        }
      }
    }
    console.log('  ✓ Farmers: farmer1@example.com / farmer123 (and 4 more)\n');

    // ========== CREATE PRODUCTS ==========
    console.log('🥬 Creating products...');

    const [farmersList] = await pool.execute('SELECT id, user_id FROM farmers');

    const products = [
      // Farmer 1 - Green Valley Farm
      ['Fresh Tomatoes', 'Vegetables', 'Juicy red tomatoes, perfect for salads and cooking', 40, 50, 'kg', productImages.tomato, 'BATCH-TOM-001', '2024-01-15'],
      ['Organic Potatoes', 'Vegetables', 'Farm-fresh potatoes, ideal for all dishes', 30, 100, 'kg', productImages.potato, 'BATCH-POT-001', '2024-01-10'],
      ['Red Onions', 'Vegetables', 'Premium quality onions with long shelf life', 35, 75, 'kg', productImages.onion, 'BATCH-ONI-001', '2024-01-12'],
      
      // Farmer 2 - Sunrise Organic Farm
      ['Fresh Carrots', 'Vegetables', 'Sweet and crunchy organic carrots', 45, 40, 'kg', productImages.carrot, 'BATCH-CAR-001', '2024-01-14'],
      ['Green Cabbage', 'Vegetables', 'Fresh cabbage, rich in nutrients', 25, 60, 'kg', productImages.cabbage, 'BATCH-CAB-001', '2024-01-13'],
      ['Kashmiri Apples', 'Fruits', 'Premium quality apples from Kashmir', 120, 30, 'kg', productImages.apple, 'BATCH-APP-001', '2023-12-20'],
      
      // Farmer 3 - Golden Harvest Farm
      ['Organic Bananas', 'Fruits', 'Naturally ripened bananas, rich in potassium', 50, 80, 'dozen', productImages.banana, 'BATCH-BAN-001', '2024-01-16'],
      ['Alphonso Mangoes', 'Fruits', 'King of mangoes, sweet and juicy', 200, 25, 'kg', productImages.mango, 'BATCH-MAN-001', '2024-01-05'],
      ['Fresh Spinach', 'Vegetables', 'Iron-rich organic spinach leaves', 30, 20, 'kg', productImages.spinach, 'BATCH-SPI-001', '2024-01-17'],
      
      // Farmer 4 - Nature Fresh Farm
      ['Cauliflower', 'Vegetables', 'Fresh white cauliflower, pesticide-free', 35, 45, 'kg', productImages.cauliflower, 'BATCH-CAU-001', '2024-01-11'],
      ['Brinjal (Eggplant)', 'Vegetables', 'Purple brinjal, perfect for curries', 40, 35, 'kg', productImages.brinjal, 'BATCH-BRI-001', '2024-01-14'],
      ['Nagpur Oranges', 'Fruits', 'Sweet and tangy oranges from Nagpur', 60, 50, 'kg', productImages.orange, 'BATCH-ORA-001', '2024-01-08'],
      
      // Farmer 5 - Eco Green Farm
      ['Green Grapes', 'Fruits', 'Seedless green grapes, fresh and sweet', 80, 30, 'kg', productImages.grapes, 'BATCH-GRA-001', '2024-01-09'],
      ['Cucumber', 'Vegetables', 'Crisp and fresh cucumbers', 25, 40, 'kg', productImages.cucumber, 'BATCH-CUC-001', '2024-01-15'],
      ['Pumpkin', 'Vegetables', 'Large orange pumpkins, great for soups', 30, 50, 'kg', productImages.pumpkin, 'BATCH-PUM-001', '2024-01-10']
    ];

    let productIndex = 0;
    for (const farmer of farmersList) {
      const farmerProducts = products.slice(productIndex, productIndex + 3);
      
      for (const [name, category, description, price, quantity, unit, imageUrl, batchId, harvestDate] of farmerProducts) {
        await pool.execute(
          'INSERT INTO products (farmer_id, name, category, description, price, quantity, unit, image_url, batch_id, harvest_date, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [farmer.id, name, category, description, price, quantity, unit, imageUrl, batchId, harvestDate, true]
        );

        // Create traceability record
        await pool.execute(
          'INSERT INTO traceability (batch_id, farmer_id, product_id, harvest_date, transport_info, storage_conditions, certifications) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            batchId,
            farmer.id,
            (await pool.execute('SELECT LAST_INSERT_ID() as id'))[0][0].id,
            harvestDate,
            'Refrigerated transport, delivered within 24 hours',
            'Stored at 4-8°C in cold storage',
            'Organic Certified, FSSAI Approved'
          ]
        );
      }
      
      productIndex += 3;
    }
    console.log('  ✓ Created 15 products with traceability\n');

    // ========== CREATE FORUM POSTS ==========
    console.log('💬 Creating forum posts...');

    const [allUsers] = await pool.execute('SELECT id, name FROM users');

    const posts = [
      ['Best Organic Fertilizers for Vegetables', 'I have been using chemical fertilizers for years. Now I want to switch to organic. What are the best organic fertilizers for vegetables like tomatoes and potatoes?', 'farming-tips'],
      ['How to Control Pests Naturally?', 'My crops are getting affected by pests. I don\'t want to use chemical pesticides. What are some natural pest control methods?', 'farming-tips'],
      ['Seasonal Crop Planning Guide', 'Can someone share a guide on which crops to plant in different seasons? I am from Maharashtra region.', 'general'],
      ['Best Practices for Organic Farming', 'I am starting organic farming. What are the best practices I should follow? Any tips from experienced farmers?', 'farming-tips'],
      ['Water Conservation Techniques', 'With water scarcity increasing, what are some effective water conservation techniques for farming?', 'farming-tips'],
      ['Delicious Tomato Recipes', 'I bought fresh tomatoes from a local farmer. Share your favorite tomato recipes!', 'recipes'],
      ['How to Store Fresh Vegetables', 'What is the best way to store fresh vegetables to keep them fresh for longer?', 'general'],
      ['Benefits of Buying Local Produce', 'Why should we buy from local farmers instead of supermarkets? Let\'s discuss the benefits.', 'general']
    ];

    for (let i = 0; i < posts.length; i++) {
      const [title, content, category] = posts[i];
      const userId = allUsers[i % allUsers.length].id;
      
      const [postResult] = await pool.execute(
        'INSERT INTO posts (user_id, title, content, category, likes_count) VALUES (?, ?, ?, ?, ?)',
        [userId, title, content, category, Math.floor(Math.random() * 20)]
      );

      // Add some comments to posts
      if (i < 4) {
        const postId = postResult.insertId;
        const comments = [
          'Great question! I have been using vermicompost and it works wonderfully.',
          'Thanks for sharing this. Very helpful information!',
          'I tried this method and it really works. Highly recommended!'
        ];

        for (let j = 0; j < 2; j++) {
          const commentUserId = allUsers[(i + j + 1) % allUsers.length].id;
          await pool.execute(
            'INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)',
            [postId, commentUserId, comments[j]]
          );
        }
      }
    }
    console.log('  ✓ Created 8 forum posts with comments\n');

    // ========== CREATE SAMPLE REVIEWS ==========
    console.log('⭐ Creating product reviews...');

    const [productsList] = await pool.execute('SELECT id FROM products LIMIT 5');
    const [buyersList] = await pool.execute('SELECT id FROM users WHERE role = "buyer"');

    for (let i = 0; i < Math.min(5, productsList.length); i++) {
      const productId = productsList[i].id;
      const buyerId = buyersList[i % buyersList.length].id;
      
      const reviews = [
        [5, 'Excellent quality! Fresh and organic. Will buy again.'],
        [4, 'Good product. Delivered on time. Slightly expensive but worth it.'],
        [5, 'Best quality vegetables I have bought online. Highly recommended!'],
        [4, 'Fresh produce. Good packaging. Happy with the purchase.'],
        [5, 'Amazing quality! Tastes much better than supermarket produce.']
      ];

      const [rating, comment] = reviews[i];
      
      await pool.execute(
        'INSERT IGNORE INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
        [buyerId, productId, rating, comment]
      );
    }
    console.log('  ✓ Created 5 product reviews\n');

    // ========== SUMMARY ==========
    console.log('✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log('  • 1 Admin user');
    console.log('  • 3 Buyer users');
    console.log('  • 5 Farmer users with profiles');
    console.log('  • 15 Products with images and traceability');
    console.log('  • 8 Forum posts with comments');
    console.log('  • 5 Product reviews');
    console.log('  • 10 Seasonal crops (pre-populated)\n');
    
    console.log('🔐 Login Credentials:');
    console.log('  Admin:  admin@farmersmarket.com / admin123');
    console.log('  Buyer:  buyer@example.com / buyer123');
    console.log('  Farmer: farmer1@example.com / farmer123\n');
    
    console.log('🌐 Visit: http://localhost:3000');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
