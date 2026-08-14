'use strict';

const port = process.argv[2] || '9225';
const width = Number(process.argv[3] || 390);
const height = Number(process.argv[4] || 844);

(async () => {
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = pages.find(item => item.type === 'page');
  if (!page) throw new Error('No browser page found');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  const evaluate = () => socket.send(JSON.stringify({
    id: 2,
    method: 'Runtime.evaluate',
    params: {
      expression: `JSON.stringify({
        innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        title: document.title,
        packages: document.querySelectorAll('.website-package-card').length,
        serviceRows: document.querySelectorAll('.service-row').length,
        mobileLinks: [...document.querySelectorAll('.mobile-menu a')].map(link => link.textContent.trim()),
        offenders: [...document.querySelectorAll('body *')].map(element => {
          const rect = element.getBoundingClientRect();
          return { tag: element.tagName, cls: String(element.className?.baseVal || element.className || ''), left: rect.left, right: rect.right, width: rect.width };
        }).filter(item => item.left < -.5 || item.right > innerWidth + .5).slice(0, 20)
      })`,
      returnByValue: true
    }
  }));
  socket.onopen = () => socket.send(JSON.stringify({
    id: 1,
    method: 'Emulation.setDeviceMetricsOverride',
    params: { width, height, deviceScaleFactor: 1, mobile: true }
  }));
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id === 1) {
      setTimeout(evaluate, 150);
      return;
    }
    if (message.id !== 2) return;
    console.log(message.result.result.value);
    socket.close();
  };
})();
