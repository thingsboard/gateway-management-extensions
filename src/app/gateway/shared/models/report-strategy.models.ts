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
