const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

// ข้อมูลสินค้า 10 ชนิด
const products = [
  { id: 1, name: "มือถือ", price: 15000 },
  { id: 2, name: "แล็ปท็อป", price: 25000 },
  { id: 3, name: "หูฟัง", price: 2000 },
  { id: 4, name: "เมาส์", price: 500 },
  { id: 5, name: "คีย์บอร์ด", price: 1500 },
  { id: 6, name: "กระเป๋า", price: 800 },
  { id: 7, name: "หนังสือ", price: 300 },
  { id: 8, name: "ปากกา", price: 50 },
  { id: 9, name: "นาฬิกา", price: 3000 },
  { id: 10, name: "รองเท้า", price: 2500 }
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