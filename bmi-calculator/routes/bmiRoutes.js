const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const historyFilePath = path.join(__dirname, '../history/history.json');

router.route('/calculator')
  .get((req, res) => {
    res.render('index');
  })
  .post((req, res) => {
    const weight = parseFloat(req.body.weight);
    const height = parseFloat(req.body.height);
    const age = parseInt(req.body.age);
    const gender = req.body.gender;

    if (isNaN(weight) || isNaN(height) || isNaN(age) || weight <= 0 || height <= 0 || age <= 0) {
      return res.render('result', { result: 'Invalid input. Please enter valid values.' });
    }

    // Calculate BMI based on units and determine the category
    const { bmi, category } = calculateBMI(weight, height, age, gender);

    // Store the result in history.json
    const historyData = readHistory();
    addToHistory(historyData, weight, height, age, gender, bmi, category);
    writeHistory(historyData);

    res.render('result', { bmiResult: bmi, categoryResult: category });
    
  });

// Bonus Feature: History route
router.route('/history')
  .get((req, res) => {
    const historyData = readHistory();
    res.json(historyData);
  });

// Middleware to store BMI calculation in history.json
router.use('/calculator', (req, res, next) => {
  const weight = parseFloat(req.body.weight);
  const height = parseFloat(req.body.height);
  const age = parseInt(req.body.age);
  const gender = req.body.gender;
  
  // Calculate BMI based on units and determine the category
  const { bmi, category } = calculateBMI(weight, height, age, gender);

  const historyData = readHistory();
  addToHistory(historyData, weight, height, age, gender, bmi, category);
  writeHistory(historyData);

  next();
});

// Function to calculate BMI based on units
function calculateBMI(weight, height, age, gender) {
  // Convert height to meters
  const heightInMeters = height / 100;

  // Calculate BMI
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);

  // Determine BMI category
  let category;
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'Normal';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obesity';
  }

  return { bmi, category };
}

// Function to read history from history.json
function readHistory() {
  try {
    const historyData = JSON.parse(fs.readFileSync(historyFilePath, 'utf-8'));
    return historyData || [];
  } catch (error) {
    console.error('Error reading history file:', error);
    return [];
  }
}

// Function to add a new calculation to history
function addToHistory(historyData, weight, height, age, gender, bmi, category) {
  historyData.push({
    weight,
    height,
    age,
    gender,
    bmi,
    category,
    timestamp: new Date().toISOString(),
  });
}

// Function to write history back to history.json
function writeHistory(historyData) {
  try {
    fs.writeFileSync(historyFilePath, JSON.stringify(historyData, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing history file:', error);
  }
}

module.exports = router;
