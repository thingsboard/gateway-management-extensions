///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getRpcTemplateArrayView',
  standalone: true,
})
export class RpcTemplateArrayViewPipe implements PipeTransform {

  transform(values: {value: string | boolean | number}[]): string {
    return values.map(({value}) => value.toString()).join(', ');
  }
}
