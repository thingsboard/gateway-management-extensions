///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { TranslateService } from '@ngx-translate/core';
import enUS from './locale.constant-en_US.json';

export default function addGatewayLocale(translate: TranslateService) {

  translate.setTranslation('en_US', enUS, true);
}
