const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

const testimonialSection = html.match(/<section class="testimonials-section"[\s\S]*?<\/section>/)?.[0] || '';
assert.ok(testimonialSection, 'Testimonials section is missing');
assert.equal((testimonialSection.match(/<article class="testimonial-card">/g) || []).length, 4);

for (const name of ['Rita Braz', 'Pantelis Petrou', 'Miguel Ângelo', 'Natalia Ioannou']) {
  assert.match(testimonialSection, new RegExp(`<h3>${name}</h3>`));
}

assert.match(testimonialSection, /Owner of 100Pratos/);
assert.match(testimonialSection, /Founder of Miguel Labs/);
assert.match(testimonialSection, /href="https:\/\/www\.100pratos\.pt\/"/);
assert.match(testimonialSection, /href="https:\/\/www\.trustpilot\.com\/reviews\/69bd096cfa469b4a641ef444"/);
assert.match(testimonialSection, /href="https:\/\/miguellabs\.xyz\/"/);
assert.doesNotMatch(testimonialSection, /Client name|Approved client feedback|\/wip\?for=testimonials/);
assert.match(css, /\.testimonial-card \{[^}]*display:\s*flex;[^}]*height:\s*294px;/);

console.log('Homepage testimonial content tests passed.');
