const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true only for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ VERIFY CONNECTION (important)
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || "ShopVerse"}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email failed:", error);
    throw new Error("Email failed");
  }
};

module.exports = sendEmail;