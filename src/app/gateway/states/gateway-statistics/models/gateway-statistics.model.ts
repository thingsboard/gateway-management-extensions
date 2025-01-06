import { GatewayConfigCommand } from '../../../shared/models/public-api';

export interface EditCustomCommandDialogData {
  command: GatewayConfigCommand;
  existingCommands: string[];
}

export interface EditCustomCommandDialogResult {
  current: GatewayConfigCommand;
  prev: GatewayConfigCommand;
}
