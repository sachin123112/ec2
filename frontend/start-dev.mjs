// Small dev starter that polyfills CustomEvent for Node environments
if (typeof global.CustomEvent === 'undefined') {
  global.CustomEvent = class CustomEvent {
    constructor(type, params = {}) {
      this.type = type;
      this.detail = params.detail === undefined ? null : params.detail;
    }
  };
}

import { createServer } from 'vite';

(async () => {
  const server = await createServer();
  await server.listen();
  server.printUrls();
})();
