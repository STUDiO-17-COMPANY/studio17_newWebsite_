import { next } from '@vercel/functions';
import languageRouting from './server/_language-routing.js';

const { legacyLanguageTarget, normaliseLocale } = languageRouting;

export default function proxy(request: Request) {
  const url = new URL(request.url);
  if (!url.searchParams.has('lang')) return next();

  const locale = normaliseLocale(url.searchParams.get('lang'));
  url.pathname = legacyLanguageTarget(url.pathname, locale);
  url.searchParams.delete('lang');

  return Response.redirect(url, 301);
}
