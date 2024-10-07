/*
 * Copyright © 2024 ThingsBoard, Inc.
 */
const STATIC_SERVE_CONFIG = {
  '/static/gateway/thingsboard-gateway-extension.js': {
    'target': 'dist/gateway-extension/system/thingsboard-gateway-extension.js'
  },
  '/static/gateway/thingsboard-gateway-extension.js.map': {
    'target': `dist/gateway-extension/system/thingsboard-gateway-extension.js.map`
  }
}

module.exports = STATIC_SERVE_CONFIG;
