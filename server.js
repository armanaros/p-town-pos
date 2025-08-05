const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`P-Town POS server running on:`);
  console.log(`- Local: http://localhost:${port}`);
  console.log(`- Network: http://192.168.1.50:${port}`);
});
