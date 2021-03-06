import { InsteonDimmableDevice, InsteonRelayDevice } from './hub';
import { ISYDeviceAccessory } from './ISYDeviceAccessory';
import { Characteristic, Service } from './plugin';

export class ISYRelayAccessory<T extends InsteonRelayDevice> extends ISYDeviceAccessory<T> {
    public primaryService: HAPNodeJS.Service;

    constructor(log, device: T) {
        super(log, device);
        this.dimmable = device.isDimmable;
    }
    // Handles the identify command
    // Handles request to set the current powerstate from homekit. Will ignore redundant commands.
    public setPowerState(powerOn: boolean, callback) {
        this.logger(`Setting powerState=${powerOn}`);
        this.device.updateIsOn(powerOn).handleWith(callback);
    }
    // Mirrors change in the state of the underlying isj-js device object.
    public handleExternalChange(propertyName, value, formattedValue) {
        super.handleExternalChange(propertyName, value, formattedValue);
        this.primaryService.updateCharacteristic(Characteristic.On, this.device.isOn);
    }
    // Handles request to get the current on state
    // Handles request to get the current on state
    public getPowerState(callback) {
        callback(null, this.device.isOn);
    }
    // Handles request to set the brightness level of dimmable lights. Ignore redundant commands.
    public setBrightness(level, callback) {
        this.logger(`Setting brightness to ${level}`);
        this.device.updateBrightnessLevel(level).handleWith(callback);
    }
    // Handles a request to get the current brightness level for dimmable lights.
    public getBrightness(callback) {
        callback(null, this.device.brightnessLevel);
    }
    // Returns the set of services supported by this object.
    public getServices() {
        super.getServices();

        this.primaryService = new Service.Switch();
        this.primaryService.getCharacteristic(Characteristic.On).on('set', this.setPowerState.bind(this));
        this.primaryService.getCharacteristic(Characteristic.On).on('get', this.getPowerState.bind(this));

        return [this.informationService, this.primaryService];
    }
}
