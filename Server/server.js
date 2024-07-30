const express = require('express'); // Import the Express library to create the server
const cors = require('cors'); // Import CORS to handle cross-origin requests
const sqlite3 = require('sqlite3').verbose(); // Import SQLite3 for database management

const app = express(); // Create an instance of Express
const port = 3000; // Define the port on which the server will run

// Connect to the database
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error('Error opening database', err); // Log an error if connection to the database fails
  } else {
    console.log('Connected to SQLite database.'); // Log a success message when connected to the database
    // Initialize the database with users if no data exists
    initializeDatabase();
  }
});

app.use(cors()); // Use CORS middleware to handle cross-origin requests
app.use(express.json()); // Use JSON parsing middleware to handle JSON requests

/**
 * Validate user data
 * @param {Object} user - The user object containing user details
 * @returns {Object} errors - An object containing error messages if validation fails
 */
const validateUser = (user) => {
  const errors = {};
  
  // Check if all fields are present
  if (!user.firstName || !user.lastName || !user.phoneNumber || !user.email || !user.role) {
    errors.missingFields = 'All fields are required.';
  }
  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.email = 'Invalid email format.';
  }
  // Validate phone number format
  if (!/^\d{10}$/.test(user.phoneNumber)) {
    errors.phoneNumber = 'Phone number must be 10 digits long.';
  }
  // Validate role value
  if (!['manager', 'waiter'].includes(user.role)) {
    errors.role = 'Role must be either "Manager" or "Waiter".';
  }
  
  return errors;
};

// Initialize the database with some default users if it is empty
const initializeDatabase = () => {
  db.all('SELECT COUNT(*) as count FROM users', [], (err, rows) => {
    if (err) {
      console.error('Error checking user count', err); // Log an error if checking user count fails
      return;
    }
    if (rows[0].count === 0) {
      const users = [
        { firstName: 'John', lastName: 'Doe', phoneNumber: '1234567890', email: 'john.doe@example.com', role: 'Manager' },
        { firstName: 'Jane', lastName: 'Smith', phoneNumber: '0987654321', email: 'jane.smith@example.com', role: 'Waiter' }
      ];

      const sql = 'INSERT INTO users (firstName, lastName, phoneNumber, email, role) VALUES (?, ?, ?, ?, ?)';
      users.forEach(user => {
        db.run(sql, [user.firstName, user.lastName, user.phoneNumber, user.email, user.role], function(err) {
          if (err) {
            console.error('Error inserting initial users', err); // Log an error if inserting users fails
          } else {
            console.log(`Inserted user with ID ${this.lastID}`); // Log the ID of the newly inserted user
          }
        });
      });
    }
  });
};

// Get all users from the database
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message }); // Send a 500 error if there is an issue with the query
      return;
    }
    res.json(rows); // Send the list of users as a JSON response
  });
});

// Add a new user to the database
app.post('/users', (req, res) => {
  const errors = validateUser(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json(errors); // Send a 400 error with validation messages if validation fails
  }
  
  const { firstName, lastName, phoneNumber, email, role } = req.body;
  const sql = 'INSERT INTO users (firstName, lastName, phoneNumber, email, role) VALUES (?, ?, ?, ?, ?)';
  
  db.run(sql, [firstName, lastName, phoneNumber, email, role], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message }); // Send a 500 error if there is an issue with the query
    }
    res.json({ id: this.lastID, ...req.body }); // Send the newly created user with its ID as a JSON response
  });
});

// Update an existing user in the database
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  const errors = validateUser(updatedUser);
  
  if (Object.keys(errors).length) {
    return res.status(400).json(errors); // Send a 400 error with validation messages if validation fails
  }

  const { firstName, lastName, phoneNumber, email, role } = updatedUser;
  const sql = 'UPDATE users SET firstName = ?, lastName = ?, phoneNumber = ?, email = ?, role = ? WHERE id = ?';

  db.run(sql, [firstName, lastName, phoneNumber, email, role, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message }); // Send a 500 error if there is an issue with the query
    }
    if (this.changes > 0) {
      res.json(updatedUser); // Send the updated user data as a JSON response if the update was successful
    } else {
      res.status(404).json({ message: 'User not found' }); // Send a 404 error if the user was not found
    }
  });
});

// Delete a user from the database
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';

  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message }); // Send a 500 error if there is an issue with the query
    }
    if (this.changes > 0) {
      res.json({ message: 'User deleted' }); // Send a success message as a JSON response if the user was deleted
    } else {
      res.status(404).json({ message: 'User not found' }); // Send a 404 error if the user was not found
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`); // Log a message indicating the server is running
});
