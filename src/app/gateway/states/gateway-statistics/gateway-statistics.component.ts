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

import { AfterViewInit, Component, DestroyRef, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AttributeScope,
  BaseData,
  EntityId,
  EntityType,
  DatasourceType,
  widgetType,
  NULL_UUID,
  SharedModule,
  defaultLegendConfig,
  DataSet,
} from '@shared/public-api';
import { WidgetContext } from '@home/models/widget-component.models';
import {
  UtilsService,
  SubscriptionInfo,
  WidgetSubscriptionOptions,
  AttributeService,
  DialogService,
} from '@core/public-api';
import { CommonModule } from '@angular/common';
import { TimeSeriesChartWidgetComponent, WidgetComponentsModule } from '@home/components/public-api';
import {
  CustomStatisticsTableComponent,
  EditCustomCommandDialogComponent,
  StatisticsCommandsAutocompleteComponent
} from './components/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap, takeWhile } from 'rxjs/operators';
import { GatewayConfigCommand } from '../../shared/models/public-api';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of, zip } from 'rxjs';
import { GatewayGeneralConfig } from '../gateway-configuration/models/public-api';
import { EditCustomCommandDialogData } from './models/gateway-statistics.model';

@Component({
  selector: 'tb-gateway-statistics',
  templateUrl: './gateway-statistics.component.html',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    StatisticsCommandsAutocompleteComponent,
    WidgetComponentsModule,
    CustomStatisticsTableComponent,
  ],
  styleUrls: ['./gateway-statistics.component.scss']
})
export class GatewayStatisticsComponent implements AfterViewInit {

  @ViewChild('statisticChart') statisticChart: TimeSeriesChartWidgetComponent;

  @Input() ctx: WidgetContext;

  subscriptionData: DataSet = [];
  statisticForm: FormGroup = this.fb.group({
    command: []
  });
  isNumericData = false;
  commands: GatewayConfigCommand[] = [];
  subscribed = false;

  private dataTypeDefined = false;
  private subscriptionInfo: SubscriptionInfo[];
  private subscriptionOptions: WidgetSubscriptionOptions = {
    callbacks: {
      onDataUpdated: () => this.ctx.ngZone.run(() => {
        this.isDataOnlyNumbers();
        if (this.isNumericData) {
          this.statisticChart?.onDataUpdated();
        }
      }),
      onDataUpdateError: (_, e) => this.ctx.ngZone.run(() => {
        this.onDataUpdateError(e);
      })
    },
    useDashboardTimewindow: false,
    legendConfig: defaultLegendConfig(widgetType.timeseries),
  };

  constructor(private fb: FormBuilder,
              private attributeService: AttributeService,
              private destroyRef: DestroyRef,
              private dialog: MatDialog,
              private dialogService: DialogService,
              private utils: UtilsService) {
    this.statisticForm.get('command').valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.subscribed = false;
        if (this.subscriptionInfo && value?.attributeOnGateway) {
          this.createSubscription(this.ctx.defaultSubscription.datasources[0].entity, value.attributeOnGateway);
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.ctx.defaultSubscription.datasources.length) {
      const gateway = this.ctx.defaultSubscription.datasources[0].entity;
      if (gateway.id.id === NULL_UUID) {
        return;
      }
      this.getGatewayGeneralConfig()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((gatewayConfig) => {
          this.commands = gatewayConfig.statistics.commands.reverse();
          if (this.commands.length) {
            this.statisticForm.get('command').setValue(this.commands[0]);
            this.createSubscription(gateway, this.commands[0].attributeOnGateway);
          }
        });
    }
  }

  openEditCommandDialog(): void {
    const value = this.statisticForm.get('command').value;
    const isCreate = typeof value === 'string' || !value;
    const command = typeof value === 'string' ? { attributeOnGateway: value } : value;
    let newValue: GatewayConfigCommand;
    this.dialog.open<EditCustomCommandDialogComponent, EditCustomCommandDialogData>(EditCustomCommandDialogComponent, {
      disableClose: true,
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      data: {
        titleText: isCreate ? 'gateway.statistics.create-command' : 'gateway.statistics.edit-command',
        buttonText: isCreate ? 'action.add' : 'action.apply',
        command,
        existingCommands: this.commands.map(item => item.attributeOnGateway),
      }
    }).afterClosed().pipe(
      switchMap(result => zip(this.getGatewayGeneralConfig(), of(result))),
      switchMap(([generalConfig, result]) => {
        this.commands = [
          ...generalConfig.statistics.commands.filter(item => item.attributeOnGateway !== result?.prev?.attributeOnGateway),
          ...(result?.current ? [{ ...result.current }] : []),
        ];
        newValue = result?.current;
        return this.updateStatisticsCommands(generalConfig, this.commands);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      if (newValue) {
        this.statisticForm.get('command').patchValue(newValue);
      }
    });
  }

  onDeleteClick(): void {
    const deletedCommand = this.statisticForm.get('command').value.attributeOnGateway;
    this.dialogService.confirm(
      this.ctx.translate.instant('gateway.statistics.delete-command', { command: deletedCommand }),
      this.ctx.translate.instant('gateway.statistics.delete-command-data'),
      this.ctx.translate.instant('action.cancel'),
      this.ctx.translate.instant('action.confirm'),
    )
      .pipe(
        takeWhile(Boolean),
        switchMap(() => this.getGatewayGeneralConfig()),
        switchMap((generalConfig) => {
          this.commands = [
            ...generalConfig.statistics.commands.filter(item => item.attributeOnGateway !== deletedCommand),
          ];
          return this.updateStatisticsCommands(generalConfig, this.commands);
        }),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe()
  }

  private getGatewayGeneralConfig(): Observable<GatewayGeneralConfig> {
    const gateway = this.ctx.defaultSubscription.datasources[0].entity;
    if (gateway.id.id === NULL_UUID) {
      return of(null);
    }
    return this.attributeService.getEntityAttributes(gateway.id, AttributeScope.SHARED_SCOPE, ['general_configuration'])
      .pipe(map(resp => resp[0]?.value))
  }

  private updateStatisticsCommands(generalConfig: GatewayGeneralConfig, commands: GatewayConfigCommand[]): Observable<GatewayGeneralConfig> {
    const gateway = this.ctx.defaultSubscription.datasources[0].entity;
    if (gateway.id.id === NULL_UUID) {
      return of(null);
    }
    return this.attributeService.saveEntityAttributes(gateway.id, AttributeScope.SHARED_SCOPE, [{
      key: 'general_configuration',
      value: {
        ...generalConfig,
        statistics: {
          ...generalConfig.statistics,
          commands
        }
      }
    }])
  }

  private createSubscription(gateway: BaseData<EntityId>, attr: string): void {
    const subscriptionInfo = [{
      type: DatasourceType.entity,
      entityType: EntityType.DEVICE,
      entityId: gateway.id.id,
      entityName: gateway.name,
      timeseries: []
    }];

    subscriptionInfo[0].timeseries = [{ name: attr, label: attr, settings: {} }];
    this.subscriptionInfo = subscriptionInfo;
    this.changeSubscription(subscriptionInfo);
  }

  private onDataUpdateError(e: Error): void {
    const exceptionData = this.utils.parseException(e);
    let errorText = exceptionData.name;
    if (exceptionData.message) {
      errorText += ': ' + exceptionData.message;
    }
    console.error(errorText);
  }

  private isDataOnlyNumbers(): void {
    this.subscriptionData = this.ctx.defaultSubscription.data[0]?.data ?? [] as DataSet;
    if (this.subscriptionData.length && !this.dataTypeDefined) {
      this.isNumericData = this.subscriptionData.every(data => !isNaN(+data[1]));
      this.dataTypeDefined = true;
    }
    this.ctx.detectChanges();
  }

  private changeSubscription(subscriptionInfo: SubscriptionInfo[]): void {
    this.ctx.defaultSubscription?.unsubscribe();

    if (this.ctx.datasources[0].entity) {
      this.ctx.subscriptionApi.createSubscriptionFromInfo(widgetType.timeseries, subscriptionInfo, this.subscriptionOptions,
        false, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(subscription => {
        this.dataTypeDefined = false;
        this.ctx.defaultSubscription = subscription;
        this.ctx.settings.showLegend = false;
        this.ctx.data = subscription.data;
        this.ctx.datasources = subscription.datasources;
        this.isDataOnlyNumbers();
        this.subscribed = true;
      });
    }
  }
}
