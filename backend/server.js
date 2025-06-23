const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from parent directory (frontend)
app.use(express.static(path.join(__dirname, "..")));

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Nodemailer configuration
const createTransporter = () => {
  // Try Gmail configuration first
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
      },
    });
  }

  // Fallback to SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "your-email@gmail.com",
      pass: process.env.SMTP_PASS || "your-app-password",
    },
  });
};

// Email sending endpoint
app.post("/send-complaint", async (req, res) => {
  try {
    console.log("📧 تم استلام طلب إرسال شكوى:", req.body);

    const {
      firstName,
      lastName,
      email,
      phone,
      complaintType,
      subject,
      company,
      details,
      submissionTime,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !subject || !details) {
      return res.status(400).json({
        success: false,
        message: "يرجى تعبئة جميع الحقول المطلوبة",
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Email content in Arabic
    const emailContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; direction: rtl; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #c4a052 0%, #2d2e2e 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-right: 4px solid #c4a052; }
        .label { font-weight: bold; color: #2d2e2e; margin-bottom: 8px; }
        .value { color: #555; line-height: 1.6; }
        .details { background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; background: #2d2e2e; color: white; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 شكوى جديدة من بوابة الشكاوى والبلاغات</h1>
            <p>تم استلام شكوى جديدة بتاريخ: ${
              submissionTime || new Date().toLocaleString("ar-SA")
            }</p>
        </div>

        <div class="section">
            <h2 style="color: #c4a052; margin-bottom: 15px;">📋 معلومات المشتكي</h2>
            <div class="label">الاسم الكامل:</div>
            <div class="value">${firstName} ${lastName}</div>
            <br>
            <div class="label">البريد الإلكتروني:</div>
            <div class="value">${email}</div>
            <br>
            <div class="label">رقم الهاتف:</div>
            <div class="value">${phone}</div>
        </div>

        <div class="section">
            <h2 style="color: #c4a052; margin-bottom: 15px;">📝 تفاصيل الشكوى</h2>
            <div class="label">نوع الشكوى:</div>
            <div class="value">${complaintType || "غير محدد"}</div>
            <br>
            <div class="label">موضوع الشكوى:</div>
            <div class="value">${subject}</div>
            <br>
            <div class="label">الشركة/المؤسسة:</div>
            <div class="value">${company || "غير محدد"}</div>
        </div>

        <div class="section">
            <h2 style="color: #c4a052; margin-bottom: 15px;">📄 تفاصيل الشكوى</h2>
            <div class="details">
                ${details.replace(/\n/g, "<br>")}
            </div>
        </div>

        <div class="footer">
            <p>هذه رسالة تلقائية من نظام بوابة الشكاوى والبلاغات</p>
            <p>يرجى التواصل مع المشتكي عبر البريد الإلكتروني أو الهاتف المذكور أعلاه</p>
        </div>
    </div>
</body>
</html>
        `;

    // Email options
    const mailOptions = {
      from: `"بوابة الشكاوى والبلاغات" <${
        process.env.EMAIL_USER || "noreply@complaints.com"
      }>`,
      to: "godfather422@gmail.com",
      subject: `🔔 شكوى جديدة من ${firstName} ${lastName} - ${subject}`,
      html: emailContent,
      replyTo: email,
    };

    // Send email
    console.log("📤 محاولة إرسال البريد الإلكتروني...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ تم إرسال البريد بنجاح:", info.messageId);

    // Send confirmation email to the user
    const confirmationEmail = {
      from: `"بوابة الشكاوى والبلاغات" <${
        process.env.EMAIL_USER || "noreply@complaints.com"
      }>`,
      to: email,
      subject: "تأكيد استلام شكواكم - بوابة الشكاوى والبلاغات",
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; direction: rtl; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #c4a052 0%, #2d2e2e 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .content { padding: 20px 0; line-height: 1.8; color: #333; }
        .footer { text-align: center; margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ تم استلام شكواكم بنجاح</h1>
        </div>
        <div class="content">
            <p>عزيزي/عزيزتي ${firstName} ${lastName},</p>
            <p>نشكركم لتواصلكم معنا من خلال بوابة الشكاوى والبلاغات.</p>
            <p><strong>موضوع الشكوى:</strong> ${subject}</p>
            <p>تم استلام شكواكم وسيتم مراجعتها والرد عليكم في أقرب وقت ممكن عبر البريد الإلكتروني أو الهاتف.</p>
            <p>المدة المتوقعة للرد: <strong>7 أيام عمل</strong></p>
            <p>نقدر لكم ثقتكم ونعتذر عن أي إزعاج قد تكونوا تعرضتم له.</p>
        </div>
        <div class="footer">
            <p>مع تحيات فريق بوابة الشكاوى والبلاغات</p>
            <p>البريد الإلكتروني: godfather422@gmail.com | الهاتف: 04-2223456</p>
        </div>
    </div>
</body>
</html>
            `,
    };

    // Send confirmation email (don't wait for it to avoid blocking the response)
    transporter.sendMail(confirmationEmail).catch((err) => {
      console.error("⚠️ خطأ في إرسال رسالة التأكيد:", err.message);
    });

    // Success response
    res.status(200).json({
      success: true,
      message: "تم إرسال شكواكم بنجاح! سيتم التواصل معكم قريباً.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("❌ خطأ في إرسال البريد:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في إرسال الشكوى. يرجى المحاولة مرة أخرى.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "الخادم يعمل بشكل طبيعي",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint for debugging
app.post("/test", (req, res) => {
  console.log("🧪 طلب اختبار:", req.body);
  res.json({
    success: true,
    message: "تم استلام الطلب بنجاح",
    receivedData: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 خطأ في الخادم:", err.stack);
  res.status(500).json({
    success: false,
    message: "حدث خطأ في الخادم",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "الصفحة غير موجودة",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
  console.log(`🌐 قم بزيارة: http://localhost:${PORT}`);
  console.log(
    `📧 إعدادات البريد الإلكتروني: ${
      process.env.EMAIL_USER ? "تم التكوين" : "غير مكون - يرجى تعديل ملف .env"
    }`
  );
});
