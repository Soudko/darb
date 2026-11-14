// Quick government services guide. Every fact below comes from the Public Authority for Disability Affairs' own pages
// (pada.gov.kw, online.pada.gov.kw) or the e.gov.kw portal, checked on 2026-11-14. Where a requirement was not found,
// the field is left empty and the screen shows the "check with the authority" line instead. Nothing is invented.
export interface GovService {
  id: string;
  icon: 'file' | 'wallet' | 'car' | 'chair' | 'calendar' | 'clock' | 'heart' | 'school' | 'health' | 'briefcase';
  name: string;
  about: string;
  authority: string;
  eligibility: string[]; // empty = not known
  steps: string[]; // empty = not known
  website: string; // verified official page, or ''
  source: string; // the page the facts came from
}

const PADA = 'الهيئة العامة لشؤون ذوي الإعاقة';
const SITE = 'https://www.pada.gov.kw/ar/';
const INFO = 'https://online.pada.gov.kw/InfoServices.aspx?type=1';
const HQ = 'تقديم المستندات حضوريا من 8:00 إلى 13:00 في مقر الهيئة بحولي أو أحد فروعها.';

export const GOV_SERVICES: GovService[] = [
  {
    id: 'certificate', icon: 'file', name: 'شهادة إثبات الإعاقة وتجديدها',
    about: 'للحصول على شهادة إعاقة تفتح الهيئة ملفا طبيا جديدا. يحق للمواطنين والمقيمين التقدم. معلومات التجديد غير متوفرة هنا.',
    authority: PADA,
    eligibility: ['يحق للمواطنين والمقيمين التقدم لفتح ملف طبي.'],
    steps: [
      'جهّز المستندات: صورة شخصية، والبطاقة المدنية، وتقريرا طبيا حديثا لا يتجاوز عمره سنة (لا يلزم لبعض حالات الإعاقة السمعية أو البصرية).',
      HQ,
      'احضر موعد اللجنة الطبية.',
      'تصلك رسالة نصية بالنتيجة، وعند الموافقة تستلم الشهادة من الهيئة.',
    ],
    website: SITE, source: 'https://e.gov.kw/sites/kgoArabic/Pages/Services/GODP/MedicalFile.aspx',
  },
  {
    id: 'aid', icon: 'wallet', name: 'المساعدات والمخصصات المالية',
    about: 'تقدم الهيئة مساعدات اجتماعية لذوي الإعاقة. المعلومات هنا تخص المساعدة لمن تجاوز 21 عاما، ولا نذكر مبالغ.',
    authority: PADA,
    eligibility: [
      'أن يكون كويتيا أو في حكمه.',
      'أن تكون الإعاقة متوسطة أو شديدة.',
      'أن تكون شهادة الإعاقة سارية.',
    ],
    steps: [HQ, 'الرسوم 0 د.ك.', 'للمساعدات الأخرى (مثل ما دون 21 عاما) تواصل مع الهيئة.'],
    website: SITE, source: 'https://e.gov.kw/sites/kgoArabic/Pages/Services/GODP/SalaryAbove.aspx',
  },
  {
    id: 'traffic', icon: 'car', name: 'لوحات المرور والمواقف المخصصة',
    about: 'تمنح الهيئة الشخص ذا الإعاقة لوحة مرور. لم نجد معلومات عن المواقف المخصصة لدى الجهة.',
    authority: PADA,
    eligibility: ['شهادة إعاقة سارية المفعول.'],
    steps: ['جهّز صورة من البطاقة المدنية.', HQ, 'الرسوم 0 د.ك.'],
    website: SITE, source: 'https://e.gov.kw/sites/kgoArabic/Pages/Services/GODP/TrafficPanel.aspx',
  },
  {
    id: 'devices', icon: 'chair', name: 'طلب كرسي متحرك أو سماعة طبية',
    about: 'تقدر تتعرف على خدمة طلب الأجهزة المساعدة مثل الكراسي المتحركة والسماعات الطبية، حسب احتياجك وتقييم الجهة المختصة.',
    authority: PADA,
    eligibility: [
      'الكرسي المتحرك: شهادة إعاقة وتقرير لجنة يؤكد الحاجة إليه.',
      'السماعة الطبية: أن يكون كويتيا أو في حكمه، وشهادة إعاقة سمعية، وإعاقة متوسطة أو شديدة.',
    ],
    steps: [
      'الكرسي المتحرك: نسخة من البطاقة المدنية، وتفويض رسمي إن قدّم الطلب شخص آخر، وتقرير طبي حديث. للاستفسار عن خطوات التقديم اتصل بالهيئة.',
      'السماعة الطبية: نسخة من البطاقة المدنية للمعاق ولمقدم الطلب، وتفويض رسمي إن قدّم الطلب مندوب، وتخطيط سمع حديث لم يمض عليه سنة.',
    ],
    website: SITE, source: INFO,
  },
  {
    id: 'committee', icon: 'calendar', name: 'حجز موعد اللجنة الطبية',
    about: 'بعد تقديم مستندات فتح الملف الطبي، تحضر موعد اللجنة الطبية. لم نجد طريقة منشورة لحجز الموعد بشكل مستقل.',
    authority: PADA,
    eligibility: [],
    steps: ['قدّم مستندات فتح الملف الطبي في الهيئة.', 'احضر موعد اللجنة الطبية.', 'تصلك رسالة نصية بالنتيجة.'],
    website: SITE, source: 'https://e.gov.kw/sites/kgoArabic/Pages/Services/GODP/MedicalFile.aspx',
  },
  {
    id: 'hours', icon: 'clock', name: 'تخفيف ساعات العمل والإعفاء من البصمة',
    about: 'تعرض الهيئة طلب تخفيف ساعات العمل لمن يرعى شخصا من ذوي الإعاقة. لم نجد معلومات عن الإعفاء من البصمة.',
    authority: PADA,
    eligibility: [],
    steps: [
      'للأم: صورة البطاقة المدنية للأم، وصورة شهادة ميلاد المعاق.',
      'للأب: صورة البطاقة المدنية للأب، وصورة الهوية العسكرية إن كان يعمل في وزارة الدفاع.',
      'للأخ أو الأخت أو من يرعى معاقا: صورة البطاقة المدنية.',
      'يوجد نموذج للتنزيل على موقع الهيئة (تخفيف ساعات العمل).',
    ],
    website: SITE, source: INFO,
  },
  {
    id: 'caregiver', icon: 'heart', name: 'شهادة المكلف بالرعاية',
    about: 'شهادة المكلف بالرعاية (المادة 24) تخص من يكلَّف برعاية شخص من ذوي الإعاقة.',
    authority: PADA,
    eligibility: [],
    steps: [
      'جهّز نسخة من البطاقة المدنية للمكلف وللمعاق بشرط تطابق العنوان.',
      'جهّز شهادة ميلاد المعاق والمكلف إن كان من الإخوة أو الأبناء، وشهادة إعلام رسمي من وزارة العدل (استمرارية زواج).',
      'في حالات الانفصال أو الوفاة أو الحجر تلزم مستندات إضافية؛ الشهادات الرسمية لا يمر على إصدارها ثلاثة أشهر. التفاصيل الكاملة في صفحة الهيئة.',
    ],
    website: SITE, source: INFO,
  },
  {
    id: 'education', icon: 'school', name: 'الخدمات التعليمية والدعم الدراسي',
    about: 'قرار تعليمي أو تأهيلي من الهيئة يحيل الشخص إلى مدارس أو حضانات أو مراكز تأهيل مناسبة.',
    authority: PADA,
    eligibility: ['شهادة إعاقة سارية صادرة من الهيئة.'],
    steps: ['افتح ملفا تعليميا تأهيليا (أول مرة).', 'قدّم الطلب حضوريا من 8:00 إلى 13:00 في مقر الهيئة بحولي أو أحد فروعها.'],
    website: SITE, source: 'https://e.gov.kw/sites/kgoArabic/Pages/Services/GODP/EducationalSupport.aspx',
  },
  {
    id: 'health', icon: 'health', name: 'الخدمات الصحية والتأهيلية',
    about: 'تقدم الهيئة خدمات طبية وتعليمية وتأهيلية للأشخاص ذوي الإعاقة. نقطة البداية فتح ملف طبي.',
    authority: PADA,
    eligibility: [],
    steps: ['ابدأ بفتح ملف طبي (انظر «شهادة إثبات الإعاقة»).', 'للتفاصيل تواصل مع الهيئة أو زر موقعها.'],
    website: SITE, source: SITE,
  },
  {
    id: 'employment', icon: 'briefcase', name: 'التوظيف وحقوق ذوي الإعاقة',
    about: 'يتضمن موقع الهيئة قسما لحقوق ذوي الإعاقة وأسئلة عن شروط التقديم على وظيفة. لا نعرض شروطا محددة.',
    authority: PADA,
    eligibility: [],
    steps: [],
    website: SITE, source: 'https://www.pada.gov.kw/ar/information-center/faq/',
  },
];
