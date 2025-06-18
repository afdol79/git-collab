const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

// ข้อมูลสินค้า 10 ชนิด
const products = [
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

// ดูสินค้าทั้งหมด
app.get('/products', (req, res) => {
  res.json(products);
});

// ดูสินค้าตาม ID
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'ไม่พบสินค้า' });
  }
});

// เริ่มเซิร์ฟเวอร์
app.listen(3000, () => {
  console.log('Server ทำงานที่ http://localhost:3000');
  console.log('ลองเข้า: http://localhost:3000/products');
});