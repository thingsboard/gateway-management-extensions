///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  MappingType,
  OPCBasicConfig_v3_5_2,
  OPCLegacyBasicConfig,
  ServerConfig,
  GatewayConnectorBasicConfigDirective,
  OpcVersionMappingUtil
} from '../../../../../shared/public-api';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';
import { MappingTableComponent } from '../../mapping-table/mapping-table.component';
import {
  SecurityConfigComponent
} from '../../security-config/security-config.component';
import {
  OpcServerConfigComponent
} from '../opc-server-config/opc-server-config.component';

@Component({
  selector: 'tb-opc-ua-legacy-basic-config',
  templateUrl: './opc-ua-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OpcUaLegacyBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => OpcUaLegacyBasicConfigComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SecurityConfigComponent,
    MappingTableComponent,
    OpcServerConfigComponent,
  ],
  styleUrls: ['./opc-ua-basic-config.component.scss']
})
export class OpcUaLegacyBasicConfigComponent extends GatewayConnectorBasicConfigDirective<OPCBasicConfig_v3_5_2, OPCLegacyBasicConfig> {

  mappingTypes = MappingType;
  isLegacy = true;

  protected override initBasicFormGroup(): FormGroup {
    return this.fb.group({
      mapping: [],
      server: [],
    });
  }

  protected override mapConfigToFormValue(config: OPCLegacyBasicConfig): OPCBasicConfig_v3_5_2 {
    return {
      server: config.server ? OpcVersionMappingUtil.mapServerToUpgradedVersion(config.server) : {} as ServerConfig,
      mapping: config.server?.mapping ? OpcVersionMappingUtil.mapMappingToUpgradedVersion(config.server.mapping) : [],
    };
  }

  protected override getMappedValue(value: OPCBasicConfig_v3_5_2): OPCLegacyBasicConfig {
    return {
      server: OpcVersionMappingUtil.mapServerToDowngradedVersion(value),
    };
  }
}
