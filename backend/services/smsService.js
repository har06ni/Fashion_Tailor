const twilio = require('twilio');
console.log('[SMS SERVICE] Initialized');

const sendSMS = async (phone, message) => {
    // Ensure phone number starts with +91 if not already present (Indian context based on previous code)
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
        console.warn('[SMS] Twilio credentials missing in .env. Falling back to mock.');
        console.log(`[SMS MOCK] To: ${formattedPhone}`);
        console.log(`[SMS MOCK] Content: ${message}`);
        return { success: false, message: 'Missing credentials' };
    }

    try {
        const client = twilio(accountSid, authToken);
        console.log(`[SMS ATTEMPT] To: ${formattedPhone}, Message: ${message.substring(0, 50)}...`);
        const response = await client.messages.create({
            body: message,
            from: fromPhone,
            to: formattedPhone
        });
        console.log(`[SMS SUCCESS] To: ${formattedPhone}, SID: ${response.sid}, Status: ${response.status}`);
        return { success: true, sid: response.sid, status: response.status };
    } catch (error) {
        console.error(`[SMS ERROR] Failed to send to ${formattedPhone}:`, error.message);
        if (error.code) console.error(`[SMS ERROR CODE]: ${error.code}`);
        return { success: false, error: error.message, code: error.code };
    }
};

module.exports = { sendSMS };
