const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json()); // เพิ่ม middleware สำหรับ parse JSON

// ข้อมูลสินค้า 10 ชนิด
let products = [
  { 
    id: 1, 
    name: "มือถือ", 
    price: 15000,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop"
  },
  { 
    id: 2, 
    name: "แล็ปท็อป", 
    price: 25000,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop"
  },
  { 
    id: 3, 
    name: "หูฟัง", 
    price: 2000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
  },
  { 
    id: 4, 
    name: "เมาส์", 
    price: 500,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop"
  },
  { 
    id: 5, 
    name: "คีย์บอร์ด", 
    price: 1500,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop"
  },
  { 
    id: 6, 
    name: "กระเป๋า", 
    price: 800,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"
  },
  { 
    id: 7, 
    name: "หนังสือ", 
    price: 300,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop"
  },
  { 
    id: 8, 
    name: "ปากกา", 
    price: 50,
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop"
  },
  { 
    id: 9, 
    name: "นาฬิกา", 
    price: 3000,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop"
  },
  { 
    id: 10, 
    name: "รองเท้า", 
    price: 2500,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop"
  }
];

// ฟังก์ชันสำหรับสร้าง ID ใหม่
const getNextId = () => {
  return Math.max(...products.map(p => p.id)) + 1;
};

// ฟังก์ชันตรวจสอบข้อมูลสินค้า
const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim() === '') {
    errors.push('ชื่อสินค้าจำเป็น');
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('ราคาต้องมากกว่า 0');
  }
  
  return errors;
};

// GET - ดูสินค้าทั้งหมด
app.get('/products', (req, res) => {
  res.json(products);
});

// GET - ดูสินค้าตาม ID
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'ไม่พบสินค้า' });
  }
});

// POST - เพิ่มสินค้าใหม่
app.post('/products', (req, res) => {
  const { name, price, image } = req.body;
  
  // ตรวจสอบข้อมูล
  const errors = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  // สร้างสินค้าใหม่
  const newProduct = {
    id: getNextId(),
    name: name.trim(),
    price: parseFloat(price),
    image: image || "https://via.placeholder.com/400x400?text=No+Image"
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT - แก้ไขสินค้าทั้งหมด
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'ไม่พบสินค้า' });
  }
  
  // ตรวจสอบข้อมูล
  const errors = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  // อัพเดทสินค้า
  const updatedProduct = {
    id: id,
    name: req.body.name.trim(),
    price: parseFloat(req.body.price),
    image: req.body.image || products[productIndex].image
  };
  
  products[productIndex] = updatedProduct;
  res.json(updatedProduct);
});

// PATCH - แก้ไขสินค้าบางส่วน
app.patch('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'ไม่พบสินค้า' });
  }
  
  const product = products[productIndex];
  const updatedData = { ...product };
  
  // อัพเดทเฉพาะฟิลด์ที่ส่งมา
  if (req.body.name !== undefined) {
    if (req.body.name.trim() === '') {
      return res.status(400).json({ error: 'ชื่อสินค้าไม่สามารถว่างได้' });
    }
    updatedData.name = req.body.name.trim();
  }
  
  if (req.body.price !== undefined) {
    if (req.body.price <= 0) {
      return res.status(400).json({ error: 'ราคาต้องมากกว่า 0' });
    }
    updatedData.price = parseFloat(req.body.price);
  }
  
  if (req.body.image !== undefined) {
    updatedData.image = req.body.image;
  }
  
  products[productIndex] = updatedData;
  res.json(updatedData);
});

// DELETE - ลบสินค้า
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'ไม่พบสินค้า' });
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  res.json({ 
    message: 'ลบสินค้าเรียบร้อยแล้ว', 
    product: deletedProduct 
  });
});

// DELETE - ลบสินค้าทั้งหมด
app.delete('/products', (req, res) => {
  const deletedCount = products.length;
  products = [];
  res.json({ 
    message: `ลบสินค้าทั้งหมดเรียบร้อยแล้ว (${deletedCount} รายการ)` 
  });
});

// เริ่มเซิร์ฟเวอร์
app.listen(3000, () => {
  console.log('Server ทำงานที่ http://localhost:3000');
  console.log('\n--- API Endpoints ---');
  console.log('GET    /products       - ดูสินค้าทั้งหมด');
  console.log('GET    /products/:id   - ดูสินค้าตาม ID');
  console.log('POST   /products       - เพิ่มสินค้าใหม่');
  console.log('PUT    /products/:id   - แก้ไขสินค้าทั้งหมด');
  console.log('PATCH  /products/:id   - แก้ไขสินค้าบางส่วน');
  console.log('DELETE /products/:id   - ลบสินค้าตาม ID');
  console.log('DELETE /products       - ลบสินค้าทั้งหมด');
  console.log('\nลองเข้า: http://localhost:3000/products');
});

// Export สำหรับ testing
module.exports = app;