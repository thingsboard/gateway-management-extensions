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
import { GatewayConfigCommand } from '../../../shared/models/public-api';
import * as echarts from 'echarts/core';
import {
  DataZoomComponent,
  GridComponent,
  MarkLineComponent,
  PolarComponent,
  RadarComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components';
import { BarChart, CustomChart, LineChart, PieChart, RadarChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

export interface EditCustomCommandDialogData {
  command: GatewayConfigCommand;
  existingCommands: string[];
  titleText: string;
  buttonText: string;
}

export interface EditCustomCommandDialogResult {
  current: GatewayConfigCommand;
  prev: GatewayConfigCommand;
}

class EChartsModule {
  private initialized = false;

  init() {
    if (!this.initialized) {
      echarts.use([
        TooltipComponent,
        GridComponent,
        VisualMapComponent,
        DataZoomComponent,
        MarkLineComponent,
        PolarComponent,
        RadarComponent,
        LineChart,
        BarChart,
        PieChart,
        RadarChart,
        CustomChart,
        LabelLayout,
        CanvasRenderer,
        SVGRenderer
      ]);
      this.initialized = true;
    }
  }
}

export const gatewayEchartsModule = new EChartsModule();
