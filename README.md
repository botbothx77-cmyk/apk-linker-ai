# License Manager — Starter

لوحة بداية لإدارة حسابات المسؤولين وأكواد التفعيل. الواجهة عربية ومتوافقة مع الهاتف.

## 1) إعداد Supabase
1. أنشئ مشروعاً جديداً في Supabase.
2. افتح SQL Editor ثم نفّذ محتوى `supabase/schema.sql`.
3. افتح Authentication > Users، وأنشئ حسابك الأول من الموقع بعد ضبط `config.js`، أو أنشئه من لوحة Supabase.
4. نفّذ أمر ترقية حسابك إلى Admin الموجود في آخر ملف `schema.sql` بعد وضع بريدك الحقيقي مكان `YOUR_ADMIN_EMAIL`.

## 2) إعداد الواجهة
1. افتح `config.js`.
2. ضع Project URL و anon/public key من Supabase > Project Settings > API.
3. ارفع ملفات الجذر (`index.html`, `style.css`, `app.js`, `config.js`) إلى مستودع GitHub.
4. فعّل GitHub Pages من Settings > Pages واختر الفرع ومجلد الجذر.

## 3) نشر Edge Functions
الدالتان ضروريتان لإنشاء المسؤولين والأكواد بأمان. لا تضع service_role key في ملفات الموقع.
من جهاز عليه Supabase CLI، اربط المشروع ثم انشر:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy create-admin
supabase functions deploy manage-license
```
تأكد من ضبط أسرار Supabase الخاصة بالدوال تلقائياً/ضمن بيئة Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. مفتاح service role سري ولا يشارك مع أي شخص.

## ملاحظات مهمة
- هذه نسخة تأسيسية: تعرض الأكواد وتنشئها، وتنشئ حسابات Sub Admin.
- لا يوجد حالياً ربط APK أو endpoint للتحقق من رخصة التطبيق؛ يلزم تصميم API للتحقق قبل ربط التطبيق.
- لا تستخدم بيانات حقيقية قبل اختبار RLS والدوال بحساب Admin وحساب Sub Admin منفصلين.
- غيّر كلمات المرور المؤقتة بعد تسليم الحسابات، ولا تشارك مفاتيح الخدمة.
