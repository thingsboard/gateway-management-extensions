/*
 * Copyright © 2024 ThingsBoard, Inc.
 */
const STATIC_SERVE_CONFIG = {
  '/static/gateway/gateway-management-extension.js': {
    'target': 'dist/gateway-extension/system/gateway-management-extension.js'
  },
  '/static/gateway/gateway-management-extension.js.map': {
    'target': `dist/gateway-extension/system/gateway-management-extension.js.map`
  }
}

module.exports = STATIC_SERVE_CONFIG;
