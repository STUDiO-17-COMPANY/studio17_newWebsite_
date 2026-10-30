const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'home.template.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

const testimonialSection = html.match(/<section class="testimonials-section"[\s\S]*?<\/section>/)?.[0] || '';
assert.ok(testimonialSection, 'Testimonials section is missing');
assert.equal((testimonialSection.match(/<article class="testimonial-card"/g) || []).length, 5);
assert.match(testimonialSection, /Yiannos Costi/);
assert.match(testimonialSection, /https:\/\/share.google\/uubw1oWLCdYN3xs2M/);
assert.doesNotMatch(testimonialSection, /quote-icon|Learn more/);

for (const name of ['Rita Braz', 'Cleopatra Guia', 'Miguel Ângelo', 'Natalia Ioannou']) {
  assert.match(testimonialSection, new RegExp(`<h3>${name}</h3>`));
}

assert.match(testimonialSection, /Owner of 100Pratos/);
assert.match(testimonialSection, /Founder of Miguel Labs/);
assert.match(testimonialSection, /href="https:\/\/www\.100pratos\.pt\/"/);
assert.match(testimonialSection, /href="https:\/\/share.google\/SKqCQxhCEHE5gDG5S"/);
assert.doesNotMatch(testimonialSection, /Pantelis Petrou/);
assert.match(testimonialSection, /href="https:\/\/miguellabs\.xyz\/"/);
assert.doesNotMatch(testimonialSection, /Client name|Approved client feedback|\/work#testimonials/);
assert.match(css, /\.testimonial-card \{[^}]*display:\s*flex;[^}]*height:\s*294px;/);
assert.match(css, /\.testimonial-action-arrow \{[^}]*width: 1em;[^}]*color: inherit;[^}]*background: transparent;/);
assert.match(css, /\.testimonial-section-link a \{ display: inline; white-space: nowrap;/);
assert.match(css, /\.testimonial-section-link a > \.testimonial-action-arrow \{[^}]*opacity: 0; visibility: hidden;/);

console.log('Homepage testimonial content tests passed.');
