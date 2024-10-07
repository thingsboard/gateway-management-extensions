ThingsBoard Gateway Extension
=====================
The project is an extension of the ThingsBoard platform, designed to facilitate gateway configurations and connector management with a modular and component-based approach.
# Steps to Run the ThingsBoard Gateway Extension

## 1. Access Files
- Navigate to the `dist` branch of the [Gateway Extension Repository](https://github.com/thingsboard/thingsboard-gateway-extension).

## 2. Upload the Resource
- In ThingsBoard, upload the `thingsboard-gateway-extension.js` file as a resource with the following details:
  - **Type**: JS Module
  - **Title**: Gateway
  - **Resource File**: Upload the downloaded `thingsboard-gateway-extension.js` file.

## 3. Add/Update Selected Widgets
- Update the following files in the `application/src/main/data/json/system/widget_types` folder:
  - Gateway Configuration (`gateway_configuration.json`)
  - Gateway Configuration for Single Device (`gateway_configuration__single_device_.json`)
  - Gateway Connectors (`gateway_connectors.json`)
  - Gateway Custom Statistics (`gateway_custom_statistics.json`)
  - Gateway General Chart Statistics (`gateway_general_chart_statistics.json`)
  - Gateway General Configuration (`gateway_general_configuration.json`)
  - Gateway Logs (`gateway_logs.json`)
  - Service RPC (`service_rpc.json`)

## 4. Update the Gateways Dashboard
- Update the Gateways Dashboard (`gateways.json` - dashboard file) in the `application/src/main/data/json/tenant/dashboards` folder.

## 5. Update the Resource ID in All Added/Updated Widgets
- Replace `"${GATEWAY_RESOURCE_ID}"` with the actual resource ID:
```json
{ 
  "url": { 
    "entityType": "TB_RESOURCE", 
    "id": "${GATEWAY_RESOURCE_ID}", 
    "isModule": true 
  } 
}
```
## 6. Add to Custom Resources
- Update the Gateways Dashboard (`gateways.json` - dashboard file) for the launch command at line `1922` to update the resource ID in the `"customResources"`.
