# اختيار نسخة Node.js مستقرة
FROM node:18-alpine

# تحديد مجلد العمل داخل الحاوية
WORKDIR /usr/src/app

# نسخ ملفات الإعدادات وتثبيت المكتبات
COPY package*.json ./
RUN npm install

# نسخ بقية الكود
COPY . .

# بناء المشروع لتحويل TypeScript إلى JavaScript
RUN npm run build

# تشغيل التطبيق
EXPOSE 3000
CMD ["npm", "run", "start:prod"]