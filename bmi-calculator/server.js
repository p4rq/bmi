const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bmiRoutes = require('./routes/bmiRoutes');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Generic error handler (move this before defining routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/bmi', bmiRoutes);



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
