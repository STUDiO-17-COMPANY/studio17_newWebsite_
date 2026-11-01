'use strict';

// Build the support directory from the header's actual destinations and labels.
// Keep the existing single-repository translation bundles and crawlable HTML.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const source = read('script.js');
const extract = (name, end) => vm.runInNewContext(`(${source.slice(source.indexOf(`  const ${name} = `) + `  const ${name} = `.length, source.indexOf(end)).trim().replace(/;$/, '')})`);
const groups = extract('servicesMegaMenu', '  const visibilityMegaMenu =');
const headerTranslations = extract('headerMenuTranslations', '  const getHeaderMenuTranslation =');
const copy = {
  en: ['Services for your business', 'Explore every service', 'Browse the same service areas as our header. Open a category to find the right next step, or talk to our team about the scope you need.', ['Build, redesign and maintain a website around your customers and goals.', 'Help customers discover your business through search, AI visibility and relevant content.', 'Plan, publish and improve your social presence with a clear strategy.', 'Turn your ideas into video, photography, design and platform-ready content.', 'Reach the right audience through focused campaigns and clear next actions.', 'Bring people together through in-person and online experiences.'], 'Explore services', 'services'],
  'pt-PT': ['Serviços para o seu negócio', 'Explore todos os serviços', 'Explore as mesmas áreas do menu. Abra uma categoria para encontrar o próximo passo ou fale connosco sobre o que precisa.', ['Crie, renove e mantenha um website pensado para os seus clientes e objetivos.', 'Ajude os clientes a encontrar o seu negócio na pesquisa e na IA com conteúdos relevantes.', 'Planeie, publique e melhore as suas redes sociais com uma estratégia clara.', 'Transforme ideias em vídeo, fotografia, design e conteúdos prontos a publicar.', 'Alcance o público certo com campanhas focadas e próximos passos claros.', 'Junte pessoas através de experiências presenciais e online.'], 'Explorar serviços', 'serviços'],
  es: ['Servicios para tu negocio', 'Explora todos los servicios', 'Explora las mismas áreas del menú. Abre una categoría o habla con nuestro equipo para definir lo que necesitas.', ['Crea, renueva y mantén un sitio web pensado para tus clientes y objetivos.', 'Ayuda a los clientes a encontrarte en buscadores y sistemas de IA con contenido relevante.', 'Planifica, publica y mejora tus redes sociales con una estrategia clara.', 'Convierte ideas en vídeo, fotografía, diseño y contenido listo para publicar.', 'Llega al público adecuado con campañas enfocadas y próximos pasos claros.', 'Conecta personas mediante experiencias presenciales y online.'], 'Explorar servicios', 'servicios'],
  el: ['Υπηρεσίες για την επιχείρησή σας', 'Δείτε όλες τις υπηρεσίες', 'Εξερευνήστε τους ίδιους τομείς με το μενού. Ανοίξτε μια κατηγορία ή μιλήστε με την ομάδα μας για όσα χρειάζεστε.', ['Δημιουργήστε, ανανεώστε και συντηρήστε μια ιστοσελίδα γύρω από τους πελάτες και τους στόχους σας.', 'Βοηθήστε τους πελάτες να σας βρίσκουν στην αναζήτηση και στην AI με σχετικό περιεχόμενο.', 'Σχεδιάστε, δημοσιεύστε και βελτιώστε τα social media με σαφή στρατηγική.', 'Μετατρέψτε ιδέες σε βίντεο, φωτογραφία, design και περιεχόμενο έτοιμο για δημοσίευση.', 'Προσεγγίστε το σωστό κοινό με στοχευμένες καμπάνιες και σαφή επόμενα βήματα.', 'Συνδέστε ανθρώπους μέσα από δια ζώσης και online εμπειρίες.'], 'Δείτε τις υπηρεσίες', 'υπηρεσίες'],
  ru: ['Услуги для вашего бизнеса', 'Все услуги', 'Здесь представлены те же направления, что и в меню. Откройте категорию или обсудите нужный объём работ с нашей командой.', ['Создавайте, обновляйте и поддерживайте сайт с учётом клиентов и целей бизнеса.', 'Помогите клиентам находить бизнес в поиске и ИИ с помощью полезного контента.', 'Планируйте, публикуйте и развивайте соцсети на основе понятной стратегии.', 'Превращайте идеи в видео, фотографии, дизайн и готовый к публикации контент.', 'Привлекайте нужную аудиторию с помощью целевых кампаний и понятных следующих шагов.', 'Объединяйте людей через очные и онлайн-мероприятия.'], 'Смотреть услуги', 'услуг'],
  he: ['שירותים לצורכי העסק שלכם', 'כל השירותים', 'כאן תמצאו את אותם תחומים שבתפריט. פתחו קטגוריה או דברו עם הצוות שלנו כדי להגדיר את הצעד הבא.', ['בנו, חדשו ותחזקו אתר סביב הלקוחות והמטרות שלכם.', 'עזרו ללקוחות למצוא את העסק בחיפוש ובמערכות AI בעזרת תוכן רלוונטי.', 'תכננו, פרסמו ושפרו את הרשתות החברתיות עם אסטרטגיה ברורה.', 'הפכו רעיונות לווידאו, צילום, עיצוב ותוכן מוכן לפרסום.', 'הגיעו לקהל הנכון באמצעות קמפיינים ממוקדים וצעדים ברורים.', 'חברו בין אנשים באמצעות אירועים פיזיים ומקוונים.'], 'לכל השירותים', 'שירותים']
};
const escape = text => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const arrow = '<i data-lucide="arrow-up-right" aria-hidden="true"></i>';
const values = locale => {
  const data = JSON.parse(read(`locales/${locale}.json`));
  const labels = headerTranslations[locale] || {};
  const c = copy[locale];
  const category = group => labels.serviceCategories?.[group.categoryKey] || data.services?.categoryLabels?.[group.categoryKey] || group.label;
  const item = ([key, label]) => labels.serviceItems?.[key] || data.services?.itemLabels?.[key] || label;
  return {
    familiesHeading: `<h2 class="design-heading" id="service-families-title"><span>${escape(c[0])}</span></h2>`,
    familiesGrid: groups.map((group, index) => `<a class="service-family-card reveal" href="#directory-${group.categoryKey}"><h3>${escape(category(group))}</h3><p>${escape(c[3][index])}</p><span>${escape(c[4])} ${arrow}</span></a>`).join(''),
    catalogueHeading: `<h2 class="design-heading" id="service-catalogue-title"><span>${escape(c[1])}</span></h2><p>${escape(c[2])}</p>`,
    catalogue: groups.map((group, index) => `<details class="service-category" id="directory-${group.categoryKey}"${index === 0 ? ' open' : ''}><summary><span><strong>${escape(category(group))}</strong><small>${group.items.length} ${escape(c[5])}</small></span><i data-lucide="plus" aria-hidden="true"></i></summary><div class="service-category-body"><p class="service-directory-intro">${escape(c[3][index])} <a href="${escape(group.href)}"${group.href.startsWith('/wip') ? ' rel="nofollow"' : ''}>${escape(c[4])} ${arrow}</a></p>${group.items.map(row => `<div class="service-row"><h3><a href="${escape(row[2])}"${row[2].startsWith('/wip') ? ' rel="nofollow"' : ''}>${escape(item(row))} ${arrow}</a></h3></div>`).join('')}</div></details>`).join('')
  };
};
const english = values('en');
const { document } = parseHTML(read('services.html'));
for (const [key, html] of Object.entries(english)) document.querySelector(`[data-service-key="${key}"]`).innerHTML = html;
document.querySelector('.page-hero-icon')?.remove();
document.querySelector('#services-page-title').innerHTML = '<span>Connected services</span> for your business needs';
document.querySelector('[data-service-key="heroHeading"]').textContent = 'Find the right support for your next step';
document.querySelector('meta[name="description"]').content = 'Explore Studio 17 services across websites, SEO and AI visibility, social media, content creation, paid advertising and events.';
fs.writeFileSync(path.join(root, 'services.html'), '<!doctype html>\n' + document.documentElement.outerHTML + '\n');
for (const locale of Object.keys(copy).filter(locale => locale !== 'en')) {
  const file = `service-locales/${locale}.json`;
  const data = JSON.parse(read(file));
  Object.assign(data.pages.services, values(locale));
  fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');
}
console.log('Updated Services directory from the six header categories in all six languages.');
