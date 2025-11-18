import { createTransport } from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log("\n🧪 Testing Email Configuration...\n");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "✅ Set (hidden)" : "❌ Not set"
);
console.log("\n");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS not configured in .env file");
  process.exit(1);
}

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const testEmail = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to yourself
  subject: "Test Email from Campus HUB",
  text: "If you receive this email, your email configuration is working correctly! ✅",
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>✅ Email Configuration Test Successful!</h2>
      <p>Your Campus HUB email service is configured correctly.</p>
      <p><strong>Configuration:</strong></p>
      <ul>
        <li>Email: ${process.env.EMAIL_USER}</li>
        <li>Service: Gmail</li>
      </ul>
      <p>You can now send OTP emails to users!</p>
    </div>
  `,
};

console.log("📧 Sending test email to:", process.env.EMAIL_USER);
console.log("⏳ Please wait...\n");

transporter
  .sendMail(testEmail)
  .then((info) => {
    console.log("✅ SUCCESS! Test email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("\n📬 Check your inbox:", process.env.EMAIL_USER);
    console.log("(Also check spam folder if you don't see it)\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ FAILED to send test email\n");
    console.error("Error:", error.message);
    console.error("\nCommon issues:");
    console.error("1. Invalid App Password - Generate a new one");
    console.error("2. 2-Step Verification not enabled");
    console.error("3. Wrong email address");
    console.error("4. App Password has spaces (remove them)");
    console.error("\nFull error details:");
    console.error(error);
    process.exit(1);
  });
