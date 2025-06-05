// simple-server-test.js - Minimal server to test database connection
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

app.use(express.json());

// Database configuration - UPDATE THESE VALUES
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1234', // ⚠️ Replace this with your MySQL password
    // Don't specify database initially to test basic connection
};

// Test route to check database connection
app.get('/test-db', async (req, res) => {
    try {
        console.log('Testing database connection...');
        console.log('Config:', { ...dbConfig, password: '[HIDDEN]' });
        
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection successful!');
        
        // Test query
        const [rows] = await connection.execute('SELECT VERSION() as version, NOW() as current_time');
        console.log('Query result:', rows[0]);
        
        await connection.end();
        
        res.json({ 
            success: true, 
            message: 'Database connection successful!',
            version: rows[0].version,
            time: rows[0].current_time
        });
        
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('Error Code:', error.code);
        console.error('Error Number:', error.errno);
        console.error('SQL State:', error.sqlState);
        console.error('Message:', error.message);
        
        res.status(500).json({ 
            success: false, 
            error: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState
        });
    }
});

// Basic test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running! Go to /test-db to test database connection.' });
});

app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log('Visit http://localhost:3000/test-db to test database connection');
    console.log('\nIf database connection fails, check:');
    console.log('1. MySQL service is running');
    console.log('2. Username and password are correct');
    console.log('3. MySQL is listening on port 3306');
    console.log('4. No firewall blocking the connection');
});