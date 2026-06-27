const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Hello from AWS EC2 + PM2 and Pratham' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
