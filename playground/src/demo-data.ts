import LZString from 'lz-string';

function createDemoSession(): string {
  const events = [
    { timestamp: 1700000000, type: 4, data: { href: 'https://example.com', width: 1280, height: 720 } },
    { timestamp: 1700000001, type: 2, data: { node: { type: 0, tagName: 'html', childNodes: [{ type: 1, tagName: 'body', childNodes: [{ type: 1, tagName: 'div', attributes: { id: 'app' }, childNodes: [{ type: 1, tagName: 'h1', childNodes: [{ type: 3, textContent: 'Welcome to Example' }] }, { type: 1, tagName: 'button', attributes: { id: 'login-btn', class: 'btn-primary' }, childNodes: [{ type: 3, textContent: 'Login' }] }, { type: 1, tagName: 'input', attributes: { id: 'search', type: 'text', placeholder: 'Search...' } }] }] }] }] }, initialOffset: { top: 0, left: 0 } } },
    { timestamp: 1700001000, type: 3, data: { source: 1, data: { type: 2, id: 3 }, position: { x: 500, y: 300, id: 3 } } },
    { timestamp: 1700002000, type: 3, data: { source: 2, data: { id: 0, x: 0, y: 200 }, position: { x: 0, y: 200, id: 0 } } },
    { timestamp: 1700003000, type: 3, data: { source: 4, data: { id: 4, text: 'hello', isChecked: false } } },
    { timestamp: 1700004000, type: 3, data: { source: 1, data: { type: 2, id: 3 }, position: { x: 520, y: 310, id: 3 } } },
    { timestamp: 1700005000, type: 3, data: { source: 0, data: { positions: [{ x: 600, y: 400, timeOffset: 0 }, { x: 650, y: 350, timeOffset: 100 }] }, position: { x: 650, y: 350, id: 0 } } },
    { timestamp: 1700006000, type: 3, data: { source: 1, data: { type: 2, id: 3 }, position: { x: 500, y: 300, id: 3 } } },
    { timestamp: 1700007000, type: 3, data: { source: 2, data: { id: 0, x: 0, y: 400 }, position: { x: 0, y: 400, id: 0 } } },
    { timestamp: 1700008000, type: 3, data: { source: 4, data: { id: 4, text: 'hello world', isChecked: false } } },
  ];
  return JSON.stringify(events);
}

export const DEMO_DATA_URI = LZString.compressToEncodedURIComponent(createDemoSession());
export const DEMO_DATA_UTF16 = LZString.compressToUTF16(createDemoSession());
export const DEMO_DATA_RAW = createDemoSession();
