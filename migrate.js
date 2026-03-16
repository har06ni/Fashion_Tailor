require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

// 1. LOCAL CONNECTION
const LOCAL_URI = 'mongodb://localhost:27017/tailorShop';

// 2. CLOUD CONNECTION (Replace this with your Atlas URI)
const CLOUD_URI = process.argv[2];

if (!CLOUD_URI) {
    console.error('ERROR: Please provide your MongoDB Atlas URI as an argument.');
    console.log('Usage: node migrate.js "mongodb+srv://..."');
    process.exit(1);
}

async function migrate() {
    try {
        console.log('--- STARTING MIGRATION ---');

        // Connect to local
        console.log('Connecting to Local DB...');
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        const LocalCustomer = localConn.model('Customer', Customer.schema);
        const LocalOrder = localConn.model('Order', Order.schema);

        // Fetch local data
        const customers = await LocalCustomer.find({});
        const orders = await LocalOrder.find({});
        console.log(`Found ${customers.length} customers and ${orders.length} orders locally.`);

        // Connect to Cloud
        console.log('Connecting to Cloud DB...');
        await mongoose.connect(CLOUD_URI);
        console.log('Connected to Cloud!');

        // Clear existing (Optional - but safer for a clean start)
        const confirm = await new Promise(resolve => {
            console.log('WARNING: This will overwrite cloud data if it exists. (Type "yes" to continue)');
            process.stdin.once('data', (data) => resolve(data.toString().trim().toLowerCase()));
        });

        if (confirm !== 'yes') {
            console.log('Migration cancelled.');
            process.exit(0);
        }

        console.log('Clearing old cloud data...');
        await Customer.deleteMany({});
        await Order.deleteMany({});

        // Upload to Cloud
        console.log('Uploading customers...');
        await Customer.insertMany(customers);
        
        console.log('Uploading orders...');
        await Order.insertMany(orders);

        console.log('--- MIGRATION COMPLETED SUCCESSFULLY! ---');
        console.log('Your old records are now in MongoDB Atlas.');
        process.exit(0);
    } catch (err) {
        console.error('MIGRATION FAILED:', err);
        process.exit(1);
    }
}

migrate();
