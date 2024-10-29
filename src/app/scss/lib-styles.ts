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
import { Component, Type, ViewEncapsulation, ɵComponentDef, ɵNG_COMP_DEF } from '@angular/core';

export const addLibraryStyles = (target: string) => {
  addStyleFromComponent(LibStylesEntryComponent, target);
}

@Component({
  selector: 'tb-lib-styles-entry',
  template: '',
  styleUrls: ['./style.comp.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None
})
class LibStylesEntryComponent {

  constructor() { }

}

const addStyleFromComponent = (type: Type<any>, target: string)=> {
  const def: ɵComponentDef<any> = type[ɵNG_COMP_DEF];
  const style = def.styles[0];
  let targetStyle: HTMLStyleElement = document.getElementById(target) as any;
  if (!targetStyle) {
    targetStyle = document.createElement('style');
    targetStyle.id = target;
    const head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(targetStyle);
  }
  targetStyle.innerHTML = style;
}
