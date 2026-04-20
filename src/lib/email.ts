import nodemailer from "nodemailer";

// SMTP-транспорт (настраивается через .env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

// ===================== ГЕНЕРАЦИЯ КОДА =====================

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ===================== ОТПРАВКА КОДА ПОДТВЕРЖДЕНИЯ EMAIL =====================

export async function sendEmailVerificationCode(email: string, code: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"DropFilesKgpk" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Код подтверждения — DropFilesKgpk",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">📂 DropFilesKgpk</h2>
          <p>Ваш код подтверждения:</p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0a0a0a;">
            ${code}
          </div>
          <p style="color: #71717a; font-size: 14px;">Код действителен 10 минут.</p>
          <p style="color: #71717a; font-size: 12px;">Если вы не регистрировались, проигнорируйте это письмо.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

// ===================== ОТПРАВКА КОДА 2FA =====================

export async function sendTwoFactorCode(email: string, code: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"DropFilesKgpk" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Код двухфакторной аутентификации — DropFilesKgpk",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">🔐 Двухфакторная аутентификация</h2>
          <p>Ваш код входа:</p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0a0a0a;">
            ${code}
          </div>
          <p style="color: #71717a; font-size: 14px;">Код действителен 5 минут.</p>
          <p style="color: #71717a; font-size: 12px;">Если вы не пытались войти, немедленно смените пароль.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("2FA email send error:", err);
    return false;
  }
}

// ===================== ТЕСТОВЫЙ РЕЖИМ (без SMTP) =====================

// В режиме разработки коды просто логируются в консоль
export const TEST_MODE = !process.env.SMTP_HOST;
