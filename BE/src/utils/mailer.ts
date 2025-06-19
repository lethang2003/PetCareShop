import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const verifyUrl = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"PetWell" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Xác thực email của bạn',
    html: `
  <h2>Chào mừng bạn đến với PetWell! 🐶🐱</h2>
  <p>Vui lòng nhấn vào nút dưới đây để xác thực email:</p>
  <a href="${verifyUrl}" style="
    display: inline-block;
    padding: 10px 20px;
    background-color: #f97316;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: bold;
    margin-top: 10px;
  ">
    Xác thực email
  </a>
  <p>Nếu bạn không đăng ký, vui lòng bỏ qua email này.</p>
`

  });
};

export const sendNewPasswordEmail = async (to: string, newPassword: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"PetWell" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Mật khẩu mới từ hệ thống PetWell',
    html: `
      <h3>Xin chào,</h3>
      <p>Hệ thống đã tạo một mật khẩu mới cho tài khoản của bạn:</p>
      <p><strong>Mật khẩu mới: ${newPassword}</strong></p>
      <p>Hãy đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản.</p>
      <hr/>
      <p>PetWell - Đồng hành cùng thú cưng của bạn ❤️</p>
    `
  });
};

export const sendOtpEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"PetWell" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Mã xác thực đặt lại mật khẩu',
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9fafb;">
    <h2 style="color: #333;">🔐 Your OTP Code</h2>
    <p style="font-size: 16px; color: #555;">
      Hello, we received a request to reset your password. Please use the OTP code below:
    </p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="font-size: 28px; font-weight: bold; color: #1d4ed8; letter-spacing: 4px;">${otp}</span>
    </div>
    <p style="font-size: 14px; color: #666;">
      This OTP is valid for <strong>1 minute</strong>. If you did not request a password reset, you can ignore this email.
    </p>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
    <p style="font-size: 12px; color: #aaa; text-align: center;">
      PetWell - Companion of your pets ❤️
    </p>
  </div>
`

  });
};