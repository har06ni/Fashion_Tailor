# Fashion Tailor - Deployment Guide

This guide will help you deploy your Tailor Shop Management System to the cloud so it works on any device (Mobile, Tablet, Desktop).

## 1. Prerequisites
You will need accounts for:
- **GitHub**: To host your code.
- **Vercel**: To host your website.
- **MongoDB Atlas**: To host your database.
- **Cloudinary**: To host your cloth images.
- **Twilio**: To send SMS notifications.

---

## 2. Setup MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Free Cluster**.
3. Under **Network Access**, click "Add IP Address" and select **Allow Access from Anywhere** (0.0.0.0/0).
4. Under **Database Access**, create a user with a username and password.
5. Click **Connect** -> **Drivers** -> Copy the **Connection String**.
   - It will look like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`
   - **Important**: Replace `<password>` with your actual password.

---

## 3. Setup Cloudinary (Image Storage)
1. Go to [Cloudinary](https://cloudinary.com/).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the Dashboard.

---

## 4. Setup Twilio (SMS)
1. Go to [Twilio Console](https://www.twilio.com/console).
2. Copy your **Account SID**, **Auth Token**, and **Twilio Phone Number**.

---

## 5. Deploy to Vercel
1. Go to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository: `har06ni/Fashion_Tailor`.
4. In the **Environment Variables** section, add the following:

| Key | Value |
| :--- | :--- |
| `MONGODB_URI` | Your MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API Secret |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio Phone Number |
| `NODE_ENV` | `production` |

5. Click **Deploy**.

---

## 6. Accessing the App
Once deployed, Vercel will give you a link (e.g., `https://fashion-tailor.vercel.app`).
You can open this link on your phone or any computer to manage your shop!

AmaZing!
