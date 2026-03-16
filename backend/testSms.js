require('dotenv').config();
const { sendSMS } = require('./services/smsService');

async function test() {
    console.log('Starting SMS Test...');
    console.log('Environment Variables Check:');
    console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID ? 'EXISTS' : 'MISSING');
    console.log('Auth Token:', process.env.TWILIO_AUTH_TOKEN ? 'EXISTS' : 'MISSING');
    console.log('Twilio Phone:', process.env.TWILIO_PHONE_NUMBER);
    
    // Testing with a dummy number first to see logs
    const testPhone = '7397390182'; // User's phone from previous logs
    const message = 'Test message from Fashion Tailor system.';
    
    console.log('Calling sendSMS...');
    const result = await sendSMS(testPhone, message);
    console.log('Result:', result);
}

test();
