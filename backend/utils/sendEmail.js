const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT) === 465, // 465 true, 587 false
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `${process.env.APP_NAME || "ShopVerse"} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: message,
  });
};

module.exports = sendEmail;