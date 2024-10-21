///
/// Copyright © 2016-2024 The Thingsboard Authors
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
export const ModbusFunctionCodeTranslationsMap = new Map<number, string>([
  [1, 'gateway.function-codes.read-coils'],
  [2, 'gateway.function-codes.read-discrete-inputs'],
  [3, 'gateway.function-codes.read-multiple-holding-registers'],
  [4, 'gateway.function-codes.read-input-registers'],
  [5, 'gateway.function-codes.write-single-coil'],
  [6, 'gateway.function-codes.write-single-holding-register'],
  [15, 'gateway.function-codes.write-multiple-coils'],
  [16, 'gateway.function-codes.write-multiple-holding-registers']
]);

export enum ConfigurationModes {
  BASIC = 'basic',
  ADVANCED = 'advanced'
}

export enum ReportStrategyType {
  OnChange = 'ON_CHANGE',
  OnReportPeriod = 'ON_REPORT_PERIOD',
  OnChangeOrReportPeriod = 'ON_CHANGE_OR_REPORT_PERIOD',
  OnReceived = 'ON_RECEIVED'
}

export enum ReportStrategyDefaultValue {
  Gateway = 60000,
  Connector = 60000,
  Device = 30000,
  Key = 15000
}

export const ReportStrategyTypeTranslationsMap = new Map<ReportStrategyType, string>(
  [
    [ReportStrategyType.OnChange, 'gateway.report-strategy.on-change'],
    [ReportStrategyType.OnReportPeriod, 'gateway.report-strategy.on-report-period'],
    [ReportStrategyType.OnChangeOrReportPeriod, 'gateway.report-strategy.on-change-or-report-period'],
    [ReportStrategyType.OnReceived, 'gateway.report-strategy.on-received'],
  ]
);

export interface ReportStrategyConfig {
  type: ReportStrategyType;
  reportPeriod?: number;
}
