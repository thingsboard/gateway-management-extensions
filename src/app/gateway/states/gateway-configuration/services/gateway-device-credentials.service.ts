import { DestroyRef, Injectable } from '@angular/core';
import { GatewayConfigSecurity, SecurityTypes } from '../models/gateway-configuration.models';
import { DeviceCredentials, DeviceCredentialsType, DeviceId } from '@shared/public-api';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DeviceService } from '@core/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class GatewayDeviceCredentialsService {

  private initialCredentialsSubject = new BehaviorSubject<DeviceCredentials>(null);

  constructor(private deviceService: DeviceService, private destroyRef: DestroyRef) {
  }

  get initialCredentials(): DeviceCredentials {
    return this.initialCredentialsSubject.value;
  }

  get initialCredentials$(): Observable<DeviceCredentials> {
    return this.initialCredentialsSubject.asObservable();
  }

  updateCredentials(securityConfig: GatewayConfigSecurity): Observable<DeviceCredentials> {
    let newCredentials: Partial<DeviceCredentials> = {};

    switch (securityConfig.type) {
      case SecurityTypes.USERNAME_PASSWORD:
        if (this.shouldUpdateCredentials(securityConfig)) {
          newCredentials = this.generateMqttCredentials(securityConfig);
        }
        break;

      case SecurityTypes.ACCESS_TOKEN:
      case SecurityTypes.TLS_ACCESS_TOKEN:
        if (this.shouldUpdateAccessToken(securityConfig)) {
          newCredentials = {
            credentialsType: DeviceCredentialsType.ACCESS_TOKEN,
            credentialsId: securityConfig.accessToken,
            credentialsValue: null
          };
        }
        break;
    }

    return Object.keys(newCredentials).length
      ? this.deviceService.saveDeviceCredentials({ ...this.initialCredentials, ...newCredentials })
      : of(null);
  }

  setInitialCredentials(deviceId: DeviceId): void {
    this.deviceService.getDeviceCredentials(deviceId.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(credentials => {
      this.initialCredentialsSubject.next({...credentials, version: null} as DeviceCredentials);
    });
  }

  shouldUpdateSecurityConfig(securityConfig: GatewayConfigSecurity): boolean {
    switch (securityConfig.type) {
      case SecurityTypes.USERNAME_PASSWORD:
        return this.shouldUpdateCredentials(securityConfig);
      case SecurityTypes.ACCESS_TOKEN:
      case SecurityTypes.TLS_ACCESS_TOKEN:
        return this.shouldUpdateAccessToken(securityConfig);
    }
  }

  credentialsToSecurityConfig(credentials: DeviceCredentials): GatewayConfigSecurity {
    const securityConfig = {
      type: credentials.credentialsType === DeviceCredentialsType.MQTT_BASIC ? SecurityTypes.USERNAME_PASSWORD : SecurityTypes.ACCESS_TOKEN,
      accessToken: credentials.credentialsId,
    }
    if (credentials.credentialsValue) {
      const { clientId, userName, password } = JSON.parse(credentials.credentialsValue);
      return { ...securityConfig, clientId, username: userName, password } as GatewayConfigSecurity;
    }
    return securityConfig;
  }

  private shouldUpdateCredentials(securityConfig: GatewayConfigSecurity): boolean {
    if (this.initialCredentials.credentialsType !== DeviceCredentialsType.MQTT_BASIC) {
      return true;
    }
    const parsedCredentials = JSON.parse(this.initialCredentials.credentialsValue);
    return !(
      parsedCredentials.clientId === securityConfig.clientId &&
      parsedCredentials.userName === securityConfig.username &&
      parsedCredentials.password === securityConfig.password
    );
  }

  private shouldUpdateAccessToken(securityConfig: GatewayConfigSecurity): boolean {
    return this.initialCredentials.credentialsType !== DeviceCredentialsType.ACCESS_TOKEN ||
      this.initialCredentials.credentialsId !== securityConfig.accessToken;
  }

  private generateMqttCredentials(securityConfig: GatewayConfigSecurity): Partial<DeviceCredentials> {
    const { clientId, username, password } = securityConfig;

    const credentialsValue = {
      ...(clientId && { clientId }),
      ...(username && { userName: username }),
      ...(password && { password }),
    };

    return {
      credentialsType: DeviceCredentialsType.MQTT_BASIC,
      credentialsValue: JSON.stringify(credentialsValue)
    };
  }
}