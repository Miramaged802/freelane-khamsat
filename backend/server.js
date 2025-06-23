const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

// For Node.js versions without built-in fetch
global.fetch = global.fetch || require("node-fetch");

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

// Email sending endpoint using external Railway API
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

    // Prepare data for external API
    const complaintData = {
      firstName,
      lastName,
      email,
      phone,
      complaintType,
      subject,
      company,
      details,
      submissionTime: submissionTime || new Date().toLocaleString("ar-SA"),
    };

    console.log("📤 إرسال البيانات إلى خدمة البريد الخارجية...");

    // Call external Railway nodemailer API
    const response = await fetch(
      "https://freelane-khamsat-production.up.railway.app/send-complaint",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(complaintData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ تم إرسال البريد بنجاح عبر الخدمة الخارجية:", result);

    // Success response
    res.status(200).json({
      success: true,
      message: "تم إرسال شكواكم بنجاح! سيتم التواصل معكم قريباً.",
      messageId: result.messageId || "external-service",
      externalResponse: result,
    });
  } catch (error) {
    console.error("❌ خطأ في إرسال البريد عبر الخدمة الخارجية:", error);

    // Fallback to local email sending if external service fails
    try {
      console.log("🔄 محاولة الإرسال المحلي كبديل...");

      const transporter = createTransporter();

      // Simple fallback email
      const mailOptions = {
        from: `"بوابة الشكاوى والبلاغات" <${
          process.env.EMAIL_USER || "noreply@complaints.com"
        }>`,
        to: "godfather422@gmail.com",
        subject: `🔔 شكوى جديدة من ${req.body.firstName} ${req.body.lastName} - ${req.body.subject}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif;">
            <h2>شكوى جديدة من بوابة الشكاوى والبلاغات</h2>
            <p><strong>الاسم:</strong> ${req.body.firstName} ${
          req.body.lastName
        }</p>
            <p><strong>البريد الإلكتروني:</strong> ${req.body.email}</p>
            <p><strong>الهاتف:</strong> ${req.body.phone}</p>
            <p><strong>نوع الشكوى:</strong> ${
              req.body.complaintType || "غير محدد"
            }</p>
            <p><strong>الموضوع:</strong> ${req.body.subject}</p>
            <p><strong>الشركة:</strong> ${req.body.company || "غير محدد"}</p>
            <p><strong>التفاصيل:</strong></p>
            <div style="border: 1px solid #ccc; padding: 10px; background: #f9f9f9;">
              ${req.body.details.replace(/\n/g, "<br>")}
            </div>
          </div>
        `,
        replyTo: req.body.email,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ تم إرسال البريد بنجاح محلياً:", info.messageId);

      res.status(200).json({
        success: true,
        message: "تم إرسال شكواكم بنجاح! (تم استخدام النظام المحلي)",
        messageId: info.messageId,
        fallback: true,
      });
    } catch (fallbackError) {
      console.error("❌ خطأ في الإرسال المحلي أيضاً:", fallbackError);
      res.status(500).json({
        success: false,
        message: "حدث خطأ في إرسال الشكوى. يرجى المحاولة مرة أخرى.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
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
