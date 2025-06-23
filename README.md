# بوابة تقديم الشكاوى والبلاغات | Complaints Portal

## وصف المشروع | Project Description

**عربي:** نظام إلكتروني لتقديم ومعالجة الشكاوى مع واجهة عربية احترافية وخادم Node.js مع إرسال البريد الإلكتروني التلقائي.

**English:** An electronic system for submitting and processing complaints with a professional Arabic interface and Node.js backend with automatic email sending.

## المميزات | Features

- ✅ واجهة عربية احترافية | Professional Arabic Interface
- ✅ خادم Node.js مع Express | Node.js Server with Express
- ✅ إرسال البريد الإلكتروني التلقائي | Automatic Email Sending
- ✅ تأكيد استلام للمستخدم | User Confirmation Email
- ✅ تصميم متجاوب | Responsive Design
- ✅ نماذج HTML منسقة | Formatted HTML Email Templates
- ✅ معالجة الأخطاء | Error Handling
- ✅ تشفير البيانات الحساسة | Secure Data Handling

## التقنيات المستخدمة | Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript, Font Awesome
- **Backend:** Node.js, Express.js
- **Email:** Nodemailer (Gmail SMTP)
- **Styling:** Custom CSS with Arabic fonts (Cairo)

## متطلبات التشغيل | Requirements

- Node.js (v16 أو أحدث | v16 or newer)
- npm (Node Package Manager)
- Gmail account with App Password
- Internet connection

## التثبيت والتشغيل | Installation & Setup

### 1. تحميل المشروع | Download Project

```bash
# استنسخ المستودع أو حمل الملفات
# Clone repository or download files
```

### 2. تثبيت الحزم | Install Dependencies

```bash
npm install
```

### 3. إعداد متغيرات البيئة | Environment Setup

إنشاء ملف `.env` في المجلد الرئيسي وإضافة المعلومات التالية:

Create a `.env` file in the root directory and add the following:

```env
# Email Configuration - Gmail Settings
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. إعداد Gmail App Password | Gmail App Password Setup

**عربي:**

1. اذهب إلى إعدادات حساب Google
2. الأمان > التحقق بخطوتين
3. كلمات مرور التطبيقات > إنشاء كلمة مرور جديدة
4. اختر "تطبيق آخر" واكتب "Complaints Portal"
5. استخدم كلمة المرور المكونة من 16 حرف في ملف `.env`

**English:**

1. Go to Google Account settings
2. Security > 2-Step Verification
3. App passwords > Generate new app password
4. Select "Other" and type "Complaints Portal"
5. Use the 16-character password in your `.env` file

### 5. تشغيل الخادم | Start Server

```bash
# للتطوير | Development
npm run dev

# أو للإنتاج | Or for production
npm start
```

### 6. الوصول للموقع | Access Website

افتح المتصفح واذهب إلى: | Open browser and go to:

```
http://localhost:3000
```

## هيكل المشروع | Project Structure

```
project/
├── index.html          # الواجهة الأمامية | Frontend
├── server.js           # خادم Node.js | Node.js Server
├── package.json        # معلومات المشروع | Project Info
├── .env               # متغيرات البيئة | Environment Variables
├── README.md          # دليل الاستخدام | Usage Guide
└── img/               # الصور | Images
    ├── ar_moe_logo.png
    └── img 1.jpg
```

## نقاط النهاية API | API Endpoints

### POST `/send-complaint`

إرسال شكوى جديدة | Send new complaint

**Request Body:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "complaintType": "string",
  "subject": "string",
  "company": "string",
  "details": "string",
  "submissionTime": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "تم إرسال شكواكم بنجاح!",
  "messageId": "email-message-id"
}
```

### GET `/health`

فحص حالة الخادم | Server health check

### GET `/`

عرض الصفحة الرئيسية | Serve main page

## إعدادات البريد الإلكتروني | Email Configuration

البرنامج يرسل إلى: `miramaged124@gmail.com`

**نوعا البريد المرسل:**

1. **للإدارة:** شكوى مفصلة بتنسيق HTML
2. **للمستخدم:** رسالة تأكيد الاستلام

**Email Recipients:**

1. **Admin:** Detailed complaint in HTML format
2. **User:** Confirmation receipt message

## استكشاف الأخطاء | Troubleshooting

### خطأ تسجيل الدخول للبريد | Email Authentication Error

- تأكد من تفعيل التحقق بخطوتين في Gmail
- استخدم App Password وليس كلمة المرور العادية
- تأكد من صحة البريد الإلكتروني في `.env`

### خطأ الاتصال بالخادم | Server Connection Error

- تأكد من تشغيل `npm install`
- تحقق من أن المنفذ 3000 غير مستخدم
- تأكد من وجود ملف `.env`

### رسائل البريد لا تصل | Emails Not Received

- تحقق من مجلد الرسائل الغير مرغوب فيها
- تأكد من صحة إعدادات Gmail
- راجع سجلات الخادم في وحدة التحكم

## الأمان | Security

- ✅ استخدام متغيرات البيئة للبيانات الحساسة
- ✅ التحقق من صحة البيانات المدخلة
- ✅ معالجة الأخطاء بشكل آمن
- ✅ حماية من CORS attacks
- ✅ تشفير اتصالات SMTP

## التطوير | Development

لتطوير المشروع أكثر:

```bash
# تشغيل بوضع التطوير مع إعادة التحميل التلقائي
npm run dev

# لإضافة مكتبات جديدة
npm install package-name

# لتحديث المكتبات
npm update
```

## الترخيص | License

MIT License - يمكن استخدام المشروع مجاناً

## الدعم | Support

للدعم التقني أو الاستفسارات:

- 📧 Email: godfather422@gmail.com
- 📞 Phone: 04-2223456

---

**ملاحظة:** تأكد من إعداد Gmail App Password بشكل صحيح قبل التشغيل

**Note:** Make sure to set up Gmail App Password correctly before running
