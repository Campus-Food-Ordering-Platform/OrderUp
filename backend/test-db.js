const { Client } = require('pg');

const client = new Client({
  host: 'orderup-server.postgres.database.azure.com',
  port: 5432,
  database: 'OrderUpDB',
  user: 'entradbadmin',
  password: 'Killer99!',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    await client.connect();
    console.log("Successfully connected to the Azure PostgreSQL database!");
    
    // Query to list all tables in the public schema
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (result.rows.length === 0) {
      console.log("The database is connected, but there are NO TABLES created yet.");
    } else {
      console.log("Tables found:");
      console.table(result.rows);
      
      // If there are tables, let's describe columns for each table
      for (let row of result.rows) {
        const tableName = row.table_name;
        const columnsData = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1
        `, [tableName]);
        console.log(`\nColumns for table '${tableName}':`);
        console.table(columnsData.rows);
      }
    }
  } catch (err) {
    console.error("Connection failed! Error:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();
