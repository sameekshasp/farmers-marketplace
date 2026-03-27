const fs = require('fs');
const path = require('path');

const fixDependenciesAndUnused = (file, fixes) => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  fixes.forEach(f => {
    if (f.type === 'replace') {
      content = content.replace(f.search, f.replace);
    } else if (f.type === 'regex') {
      content = content.replace(f.search, f.replace);
    }
  });
  fs.writeFileSync(fullPath, content, 'utf8');
};

// AuthContext.js
fixDependenciesAndUnused('src/context/AuthContext.js', [
  { type: 'replace', search: 'useEffect(() => {\n    if (token) {\n      loadUser();\n    }\n  }, [token]);', replace: 'useEffect(() => {\n    if (token) {\n      loadUser();\n    }\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [token]);' }
]);

// CartContext.js
fixDependenciesAndUnused('src/context/CartContext.js', [
  { type: 'regex', search: /import React, \{ createContext, useContext, useState, useEffect \} from 'react';/, replace: "import React, { createContext, useContext, useState } from 'react';" }
]);

// Cart.js
fixDependenciesAndUnused('src/pages/Cart.js', [
  { type: 'regex', search: /const \{ t \} = useTranslation\(\);\n\s*/, replace: '' },
  { type: 'regex', search: /import \{ useTranslation \} from 'react-i18next';\n/, replace: '' },
  { type: 'replace', search: 'useEffect(() => {\n    loadCart();\n  }, []);', replace: 'useEffect(() => {\n    loadCart();\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, []);' }
]);

// Checkout.js
fixDependenciesAndUnused('src/pages/Checkout.js', [
  { type: 'regex', search: /const \{ t \} = useTranslation\(\);\n\s*/, replace: '' },
  { type: 'regex', search: /import \{ useTranslation \} from 'react-i18next';\n/, replace: '' },
  { type: 'replace', search: 'useEffect(() => {\n    if (!cartItems || cartItems.length === 0) {\n      navigate(\'/cart\');\n    }\n  }, [cartItems, navigate]);', replace: 'useEffect(() => {\n    if (!cartItems || cartItems.length === 0) {\n      navigate(\'/cart\');\n    }\n  }, [cartItems, navigate]);' },
  { type: 'replace', search: 'const response = await ordersAPI.post', replace: 'await ordersAPI.post' }
]);

// FarmerDashboard.js
fixDependenciesAndUnused('src/pages/FarmerDashboard.js', [
  { type: 'regex', search: /Star,\n\s*Users,\n\s*/g, replace: '' },
  { type: 'regex', search: /Edit2,\n\s*/g, replace: '' },
  { type: 'regex', search: /MapPin,\n\s*Phone\n\s*/g, replace: '' },
  { type: 'replace', search: 'const response = await productsAPI.delete', replace: 'await productsAPI.delete' }
]);

// Forum.js
fixDependenciesAndUnused('src/pages/Forum.js', [
  { type: 'regex', search: /import React, \{ useState, useEffect \} from 'react';/, replace: "import React, { useState } from 'react';" },
  { type: 'regex', search: /const \{ t \} = useTranslation\(\);\n\s*/, replace: '' },
  { type: 'regex', search: /import \{ useTranslation \} from 'react-i18next';\n/, replace: '' }
]);

// Login.js
fixDependenciesAndUnused('src/pages/Login.js', [
  { type: 'regex', search: /User,\n\s*/g, replace: '' },
  { type: 'regex', search: /watch,\n\s*setError,\n\s*/g, replace: 'watch,\n  ' },
  { type: 'regex', search: /const googleUserData \= /g, replace: 'await ' }
]);

// Orders.js
fixDependenciesAndUnused('src/pages/Orders.js', [
  { type: 'regex', search: /Phone,\n\s*Mail\n\s*/g, replace: '' },
  { type: 'replace', search: 'useEffect(() => {\n    if (orderId || id) {\n      fetchOrderDetails();\n    }\n  }, [orderId, id]);', replace: 'useEffect(() => {\n    if (orderId || id) {\n      fetchOrderDetails();\n    }\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [orderId, id]);' }
]);

// ProductDetails.js
fixDependenciesAndUnused('src/pages/ProductDetails.js', [
  { type: 'regex', search: /import React, \{ useState, useEffect \} from 'react';/, replace: "import React, { useState } from 'react';" },
  { type: 'regex', search: /import \{ productsAPI, reviewsAPI \} from '\.\.\/services\/api';/, replace: "import { productsAPI } from '../services/api';" },
  { type: 'regex', search: /Heart,\n\s*CheckCircle,\n\s*/g, replace: '' },
  { type: 'regex', search: /const \{ t \} = useTranslation\(\);\n\s*/, replace: '' },
  { type: 'regex', search: /import \{ useTranslation \} from 'react-i18next';\n/, replace: '' }
]);

// Products.js
fixDependenciesAndUnused('src/pages/Products.js', [
  { type: 'regex', search: /const \{ t \} = useTranslation\(\);\n\s*/, replace: '' },
  { type: 'regex', search: /import \{ useTranslation \} from 'react-i18next';\n/, replace: '' },
  { type: 'regex', search: /const activeFiltersCount = Object.values\(filters\).filter\(Boolean\).length;/g, replace: '' }
]);

console.log('Fixes applied.');
