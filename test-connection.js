// test-connection.js - Test MySQL connection independently
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Testing MySQL connection...');
    
    // Test different connection configurations
    const configs = [
        {
            name: 'With password',
            config: {
                host: 'localhost',
                user: 'root',
                password: '1234', // Replace with your actual password
                // Don't specify database initially
            }
        },
        {
            name: 'Without password',
            config: {
                host: 'localhost',
                user: 'root',
                password: '',
            }
        },
        {
            name: 'With port 3306',
            config: {
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: '1234', // Replace with your actual password
            }
        }
    ];

    for (const { name, config } of configs) {
        try {
            console.log(`\n--- Testing: ${name} ---`);
            console.log('Config:', { ...config, password: config.password ? '[HIDDEN]' : '[EMPTY]' });
            
            const connection = await mysql.createConnection(config);
            console.log('✅ Connection successful!');
            
            // Test basic query
            const [rows] = await connection.execute('SELECT VERSION() as version');
            console.log('MySQL Version:', rows[0].version);
            
            // List databases
            const [databases] = await connection.execute('SHOW DATABASES');
            console.log('Available databases:', databases.map(db => db.Database));
            
            await connection.end();
            console.log('Connection closed successfully');
            break; // Exit loop on first successful connection
            
        } catch (error) {
            console.log('❌ Connection failed:');
            console.log('Error Code:', error.code);
            console.log('Error Message:', error.message);
            console.log('SQL State:', error.sqlState);
        }
    }
}

// Also test if MySQL service is running
async function checkMySQLService() {
    console.log('\n=== MySQL Service Check ===');
    
    const { exec } = require('child_process');
    const os = require('os');
    
    if (os.platform() === 'win32') {
        // Windows
        exec('sc query mysql80', (error, stdout, stderr) => {
            if (error) {
                console.log('MySQL80 service not found, trying MySQL...');
                exec('sc query mysql', (error2, stdout2, stderr2) => {
                    if (error2) {
                        console.log('❌ MySQL service not found');
                        console.log('Try: net start mysql or net start mysql80');
                    } else {
                        console.log('MySQL service status:', stdout2);
                    }
                });
            } else {
                console.log('MySQL80 service status:', stdout);
            }
        });
    } else {
        // Unix-like systems
        exec('systemctl status mysql', (error, stdout, stderr) => {
            if (error) {
                console.log('❌ Could not check MySQL service status');
                console.log('Try: sudo systemctl status mysql');
            } else {
                console.log('MySQL service status:', stdout);
            }
        });
    }
}

// Run tests
testConnection();
checkMySQLService();