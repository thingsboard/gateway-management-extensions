///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { TranslateService } from '@ngx-translate/core';
import enUS from './locale.constant-en_US.json';
import arAE from './locale.constant-ar_AE.json';
import caES from './locale.constant-ca_ES.json';
import csCZ from './locale.constant-cs_CZ.json';
import daDK from './locale.constant-da_DK.json';
import esES from './locale.constant-es_ES.json';
import koKR from './locale.constant-ko_KR.json';
import ltLT from './locale.constant-lt_LT.json';
import nlBE from './locale.constant-nl_BE.json';
import plPL from './locale.constant-pl_PL.json';
import ptBR from './locale.constant-pt_BR.json';
import slSI from './locale.constant-sl_SI.json';
import trTR from './locale.constant-tr_TR.json';
import zhCN from './locale.constant-zh_CN.json';
import zhTW from './locale.constant-zh_TW.json';

export default function addGatewayLocale(translate: TranslateService) {

  translate.setTranslation('en_US', enUS, true);
  translate.setTranslation('ar_AE', arAE, true);
  translate.setTranslation('ca_ES', caES, true);
  translate.setTranslation('cs_CZ', csCZ, true);
  translate.setTranslation('da_DK', daDK, true);
  translate.setTranslation('es_ES', esES, true);
  translate.setTranslation('ko_KR', koKR, true);
  translate.setTranslation('lt_LT', ltLT, true);
  translate.setTranslation('nl_BE', nlBE, true);
  translate.setTranslation('pl_PL', plPL, true);
  translate.setTranslation('pt_BR', ptBR, true);
  translate.setTranslation('sl_SI', slSI, true);
  translate.setTranslation('tr_TR', trTR, true);
  translate.setTranslation('zh_CN', zhCN, true);
  translate.setTranslation('zh_TW', zhTW, true);
}
