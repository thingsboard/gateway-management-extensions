ThingsBoard Gateway Extension
=====================
## ThingsBoard Dependencies
To add some of ThingsBoard dependencies imports to your "extension" Angular component,
please use this import structure:

```
import { <dependency> } from '<TB-module>/public-api';
```
"TB-module" - any of the following modules:
```
@app/*
@core/*
@shared/*
@modules/*
@home/*
```
"dependency" - name of dependency/type located in "TB-module".
Refer to [modules-map](https://github.com/thingsboard/thingsboard-pe-ui-types/blob/master/src/app/modules/common/modules-map.ts)
to see what you can use.

Example:

```
import { WidgetConfig } from '@shared/public-api';
```
## External Dependencies
In case you want to use your own dependencies package from the npm registry (unless you have specified another one in your package.json), you can easily add them to yarn packet manager running the next command:
```
yarn add <package-name>
```

Example:

```
yarn add lodash
```
If it's not the npm/yarn registry, and you want to add it in another way, please refer to [yarn docs](https://classic.yarnpkg.com/en/docs/cli/add).

## Run project in development mode
```
cd ${TB_GATEWAY_EXTENSION_DIR}
yarn install
yarn start
```
In widgets library create a new widget and in the resources tab of the widget editor add this file path:

```
http://localhost:4201/static/gateway/thingsboard-gateway-extension.js
```
You must also check "Is module"

## Build project

```
cd ${TB_GATEWAY_EXTENSION_DIR}
yarn build
```

You can find the compiled file at the following path:
```
${TB_GATEWAY_EXTENSION_DIR}/target/generated-resources/thingsboard-gateway-extension.js
```
