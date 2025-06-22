const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gohildhruvi168529@gmail.com",
    pass: "ervhuwomdouxvert", 
  },
});

exports.sendMail = async (receiverEmail, otp) => {
  try {
    await transporter.sendMail({
      from: '"Gohil Dhruvi" <gohildhruvi168529@gmail.com>',
      to: receiverEmail,
      subject: "Reset Password OTP ✔",
      html: `
        <h3>Hello,</h3>
        <p>Your reset password OTP is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });
    console.log("OTP email sent to:", receiverEmail);
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
  }
};
