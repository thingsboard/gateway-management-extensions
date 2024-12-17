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

import {
  ConfigurationModes,
  GatewayConnector,
  ReportStrategyConfig,
  GatewayLogLevel,
} from '../../../shared/public-api';

export interface GatewayConfigValue {
  mode: ConfigurationModes;
  thingsboard: GatewayGeneralConfig;
  storage: GatewayStorageConfig;
  grpc: GatewayGRPCConfig;
  connectors?: GatewayConnector[];
  logs: GatewayLogsConfig;
}

export interface GatewayGRPCConfig {
  enabled: boolean;
  serverPort: number;
  keepAliveTimeMs: number;
  keepAliveTimeoutMs: number;
  keepalivePermitWithoutCalls: boolean;
  maxPingsWithoutData: number;
  minTimeBetweenPingsMs: number;
  minPingIntervalWithoutDataMs: number;
}

export interface GatewayStorageConfig {
  type: StorageTypes;
  read_records_count?: number;
  max_records_count?: number;
  data_folder_path?: string;
  max_file_count?: number;
  max_read_records_count?: number;
  max_records_per_file?: number;
  data_file_path?: string;
  messages_ttl_check_in_hours?: number;
  messages_ttl_in_days?: number;
}

export interface GatewayGeneralConfig {
  host: string;
  port: number;
  remoteShell: boolean;
  remoteConfiguration: boolean;
  checkConnectorsConfigurationInSeconds: number;
  statistics: {
    enable: boolean;
    statsSendPeriodInSeconds: number;
    commands: GatewayConfigCommand[];
  };
  maxPayloadSizeBytes: number;
  minPackSendDelayMS: number;
  minPackSizeToSend: number;
  handleDeviceRenaming: boolean;
  checkingDeviceActivity: {
    checkDeviceInactivity: boolean;
    inactivityTimeoutSeconds?: number;
    inactivityCheckPeriodSeconds?: number;
  };
  security: GatewayConfigSecurity;
  qos: number;
  reportStrategy: ReportStrategyConfig;
}

export interface GatewayLogsConfig {
  dateFormat: string;
  logFormat: string;
  type?: string;
  logLevel?: GatewayLogLevel;
  local: LocalLogs;
}

export interface GatewayConfigSecurity extends GatewayUsernamePasswordConfig {
  type: SecurityTypes;
  accessToken?: string;
  caCert?: string;
  cert?: string;
  privateKey?: string;
}

export interface GatewayUsernamePasswordConfig {
  clientId?: string;
  username?: string;
  password?: string;
}

export interface GatewayConfigCommand {
  attributeOnGateway: string;
  command: string;
  timeout: number;
}

export interface LogConfig {
  logLevel: GatewayLogLevel;
  filePath: string;
  backupCount: number;
  savingTime: number;
  savingPeriod: LogSavingPeriod;
}

export type LocalLogs = Record<LocalLogsConfigs, LogConfig>;

interface LogFormatterConfig {
  class: string;
  format: string;
  datefmt: string;
}

interface StreamHandlerConfig {
  class: string;
  formatter: string;
  level: string | number;
  stream: string;
}

interface FileHandlerConfig {
  class: string;
  formatter: string;
  filename: string;
  backupCount: number;
  encoding: string;
}

interface LoggerConfig {
  handlers: string[];
  level: string;
  propagate: boolean;
}

interface RootConfig {
  level: string;
  handlers: string[];
}

export interface LogAttribute {
  version: number;
  disable_existing_loggers: boolean;
  formatters: {
    LogFormatter: LogFormatterConfig;
  };
  handlers: {
    consoleHandler: StreamHandlerConfig;
    databaseHandler: FileHandlerConfig;
  };
  loggers: {
    database: LoggerConfig;
  };
  root: RootConfig;
  ts: number;
}

export enum GatewayBasicConfigTab {
  general,
  logs,
  storage,
  grpc,
  statistics,
  other
}

export type GatewayBasicConfigTabKey = keyof typeof GatewayBasicConfigTab;

export enum StorageTypes {
  MEMORY = 'memory',
  FILE = 'file',
  SQLITE = 'sqlite'
}

export enum LocalLogsConfigs {
  service = 'service',
  connector = 'connector',
  converter = 'converter',
  tb_connection = 'tb_connection',
  storage = 'storage',
  extension = 'extension'
}

export const LocalLogsConfigTranslateMap = new Map<LocalLogsConfigs, string>([
  [LocalLogsConfigs.service, 'Service'],
  [LocalLogsConfigs.connector, 'Connector'],
  [LocalLogsConfigs.converter, 'Converter'],
  [LocalLogsConfigs.tb_connection, 'TB Connection'],
  [LocalLogsConfigs.storage, 'Storage'],
  [LocalLogsConfigs.extension, 'Extension']
]);

export const StorageTypesTranslationMap = new Map<StorageTypes, string>(
  [
    [StorageTypes.MEMORY, 'gateway.storage-types.memory-storage'],
    [StorageTypes.FILE, 'gateway.storage-types.file-storage'],
    [StorageTypes.SQLITE, 'gateway.storage-types.sqlite']
  ]
);

export enum LogSavingPeriod {
  days = 'D',
  hours = 'H',
  minutes = 'M',
  seconds = 'S'
}

export const LogSavingPeriodTranslations = new Map<LogSavingPeriod, string>(
  [
    [LogSavingPeriod.days, 'gateway.logs.days'],
    [LogSavingPeriod.hours, 'gateway.logs.hours'],
    [LogSavingPeriod.minutes, 'gateway.logs.minutes'],
    [LogSavingPeriod.seconds, 'gateway.logs.seconds']
  ]
);

export enum SecurityTypes {
  ACCESS_TOKEN = 'accessToken',
  USERNAME_PASSWORD = 'usernamePassword',
  TLS_ACCESS_TOKEN = 'tlsAccessToken',
  TLS_PRIVATE_KEY = 'tlsPrivateKey'
}

export const SecurityTypesTranslationsMap = new Map<SecurityTypes, string>(
  [
    [SecurityTypes.ACCESS_TOKEN, 'gateway.security-types.access-token'],
    [SecurityTypes.USERNAME_PASSWORD, 'gateway.security-types.username-password'],
    [SecurityTypes.TLS_ACCESS_TOKEN, 'gateway.security-types.tls-access-token']
  ]
);

export const numberInputPattern = new RegExp(/^\d{1,15}$/);

export const logsHandlerClass = 'thingsboard_gateway.tb_utility.tb_rotating_file_handler.TimedRotatingFileHandler';

export const logsLegacyHandlerClass = 'thingsboard_gateway.tb_utility.tb_handler.TimedRotatingFileHandler';
