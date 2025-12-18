///
/// Copyright © 2016-2025 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { TranslateService } from '@ngx-translate/core';
import enUS from '../../assets/locale/locale.constant-en_US.json';
import arAE from '../../assets/locale/locale.constant-ar_AE.json';
import caES from '../../assets/locale/locale.constant-ca_ES.json';
import csCZ from '../../assets/locale/locale.constant-cs_CZ.json';
import daDK from '../../assets/locale/locale.constant-da_DK.json';
import esES from '../../assets/locale/locale.constant-es_ES.json';
import koKR from '../../assets/locale/locale.constant-ko_KR.json';
import ltLT from '../../assets/locale/locale.constant-lt_LT.json';
import nlBE from '../../assets/locale/locale.constant-nl_BE.json';
import plPL from '../../assets/locale/locale.constant-pl_PL.json';
import ptBR from '../../assets/locale/locale.constant-pt_BR.json';
import slSI from '../../assets/locale/locale.constant-sl_SI.json';
import trTR from '../../assets/locale/locale.constant-tr_TR.json';
import zhCN from '../../assets/locale/locale.constant-zh_CN.json';
import zhTW from '../../assets/locale/locale.constant-zh_TW.json';
import { mergeDeep } from '@core/public-api';

enum AvailableLanguages {
  English = 'en-US',
  Arabic = 'ar-AE',
  Catalan = 'ca-ES',
  Czech = 'cs-CZ',
  Danish = 'da-DK',
  Spanish = 'es-ES',
  Korean = 'ko-KR',
  Lithuanian = 'lt-LT',
  Dutch = 'nl-BE',
  Polish = 'pl-PL',
  PortugueseBrazil = 'pt-BR',
  Slovenian = 'sl-SI',
  Turkish = 'tr-TR',
  ChineseSimplified = 'zh-CN',
  ChineseTraditional = 'zh-TW'
}

type LocaleData = Record<string, any>;

const languagesMap = new Map<AvailableLanguages, LocaleData>([
  [AvailableLanguages.English, enUS],
  [AvailableLanguages.Arabic, arAE],
  [AvailableLanguages.Catalan, caES],
  [AvailableLanguages.Czech, csCZ],
  [AvailableLanguages.Danish, daDK],
  [AvailableLanguages.Spanish, esES],
  [AvailableLanguages.Korean, koKR],
  [AvailableLanguages.Lithuanian, ltLT],
  [AvailableLanguages.Dutch, nlBE],
  [AvailableLanguages.Polish, plPL],
  [AvailableLanguages.PortugueseBrazil, ptBR],
  [AvailableLanguages.Slovenian, slSI],
  [AvailableLanguages.Turkish, trTR],
  [AvailableLanguages.ChineseSimplified, zhCN],
  [AvailableLanguages.ChineseTraditional, zhTW]
]);

export default function addGatewayLocale(translate: TranslateService): void {
  const currentLocale = translate.currentLang;
  const existingTranslations = translate.translations[currentLocale] || {};
  const gatewayTranslations = languagesMap.get(currentLocale as AvailableLanguages) ?? languagesMap.get(AvailableLanguages.English);
  const mergedTranslations = JSON.stringify(mergeDeep(existingTranslations, gatewayTranslations));
  translate.setTranslation(currentLocale, mergedTranslations, true);
}
