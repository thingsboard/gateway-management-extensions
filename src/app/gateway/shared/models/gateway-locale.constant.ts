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
import { isLiteralObject, mergeDeep } from '@core/public-api';

export enum AvailableLanguages {
  English = 'en_US',
  Arabic = 'ar_AE',
  Catalan = 'ca_ES',
  Czech = 'cs_CZ',
  Danish = 'da_DK',
  Spanish = 'es_ES',
  Korean = 'ko_KR',
  Lithuanian = 'lt_LT',
  Dutch = 'nl_BE',
  Polish = 'pl_PL',
  PortugueseBrazil = 'pt_BR',
  Slovenian = 'sl_SI',
  Turkish = 'tr_TR',
  ChineseSimplified = 'zh_CN',
  ChineseTraditional = 'zh_TW'
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

export const addGatewayLocale = (translate: TranslateService) => {
  const EN = AvailableLanguages.English;
  const lang = (translate.currentLang as AvailableLanguages) ?? EN;

  const currentLocale = translate.translations[lang]?.gateway ? lang : EN;
  const gatewayLocale = languagesMap.get(lang)?.gateway ? lang : EN;

  const sources = [
    translate.translations[currentLocale]?.gateway,
    gatewayLocale === EN ? undefined : languagesMap.get(EN)?.gateway,
    languagesMap.get(gatewayLocale)?.gateway
  ].filter(isNonEmptyObject);

  if (!sources.length) return;
  const merged = sources.length === 1 ? sources[0] : mergeDeep({}, ...sources);
  translate.setTranslation(currentLocale, { gateway: merged }, true);
};

const isNonEmptyObject = (v: any) =>
  isLiteralObject(v) && Object.keys(v).length !== 0;
