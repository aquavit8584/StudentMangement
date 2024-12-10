require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// 中間件設置
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 連接到 MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/studentDB';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 連接失敗：'));
db.once('open', () => {
    console.log('成功連接至 MongoDB');
});


// 定義學生資料模型
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    grade: { type: String, required: true },
});

const Student = mongoose.model('Student', studentSchema);

// API 路由
// 取得所有學生
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        console.error('取得學生失敗：', error.message);
        res.status(500).send({ error: '伺服器錯誤' });
    }
});

// 新增學生
app.post('/students', async (req, res) => {
    try {
        const { name, age, grade } = req.body;
        const newStudent = new Student({ name, age, grade });
        const savedStudent = await newStudent.save();
        res.json(savedStudent);
    } catch (error) {
        console.error('新增學生失敗：', error.message);
        res.status(400).send({ error: '無法新增學生' });
    }
});

// 更新學生
app.put('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, grade } = req.body;
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { name, age, grade },
            { new: true }
        );
        res.json(updatedStudent);
    } catch (error) {
        console.error('更新學生失敗：', error.message);
        res.status(400).send({ error: '無法更新學生' });
    }
});

// 刪除學生
app.delete('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Student.findByIdAndDelete(id);
        res.json({ message: '學生已刪除' });
    } catch (error) {
        console.error('刪除學生失敗：', error.message);
        res.status(400).send({ error: '無法刪除學生' });
    }
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`伺服器已啟動：http://localhost:${PORT}`);
});
