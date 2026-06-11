import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (email, username, tempPassword) => {
  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const info = await transporter.sendMail({
      from: '"Task Management System" <no-reply@tms-project.com>',
      to: email,
      subject: "Welcome to Task Management System - Your Account Details",
      text: `Hello ${username},\n\nYour account has been created successfully.\n\nUsername: ${email}\nTemporary Password: ${tempPassword}\n\nPlease login and change your password immediately.\n\nBest,\nTMS Team`,
      html: `
        <h3>Welcome to Task Management System</h3>
        <p>Hello ${username},</p>
        <p>Your account has been created successfully.</p>
        <ul>
          <li><b>Username:</b> ${email}</li>
          <li><b>Temporary Password:</b> ${tempPassword}</li>
        </ul>
        <p>Please login and change your password immediately.</p>
        <br/>
        <p>Best,<br/>TMS Team</p>
      `,
    });

    console.log("Welcome Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
};
