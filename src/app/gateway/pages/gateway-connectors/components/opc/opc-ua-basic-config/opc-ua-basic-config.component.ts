///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  MappingType,
  OPCBasicConfig_v3_5_2,
  ServerConfig,
  GatewayConnectorBasicConfigDirective
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
  selector: 'tb-opc-ua-basic-config',
  templateUrl: './opc-ua-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OpcUaBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => OpcUaBasicConfigComponent),
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
export class OpcUaBasicConfigComponent extends GatewayConnectorBasicConfigDirective<OPCBasicConfig_v3_5_2, OPCBasicConfig_v3_5_2> {

  mappingTypes = MappingType;
  isLegacy = false;

  protected override initBasicFormGroup(): FormGroup {
    return this.fb.group({
      mapping: [],
      server: [],
    });
  }

  protected override mapConfigToFormValue(config: OPCBasicConfig_v3_5_2): OPCBasicConfig_v3_5_2 {
    return {
      server: config.server ?? {} as ServerConfig,
      mapping: config.mapping ?? [],
    };
  }

  protected override getMappedValue(value: OPCBasicConfig_v3_5_2): OPCBasicConfig_v3_5_2 {
    return {
      server: value.server,
      mapping: value.mapping,
    };
  }
}
