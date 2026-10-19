import Homey from 'homey';

module.exports = class AuxAircoApp extends Homey.App {

  async onInit() {
    this.homey.flow.getActionCard('set_fan_speed').registerRunListener(async (args: { device: Homey.Device; aux_fan_speed: string }) => {
      await args.device.triggerCapabilityListener('aux_fan_speed', args.aux_fan_speed);
    });

    this.homey.flow.getActionCard('set_swing_vertical').registerRunListener(async (args: { device: Homey.Device; enabled: string }) => {
      await args.device.triggerCapabilityListener('aux_swing_vertical', args.enabled === 'true');
    });

    this.homey.flow.getActionCard('set_swing_horizontal').registerRunListener(async (args: { device: Homey.Device; enabled: string }) => {
      await args.device.triggerCapabilityListener('aux_swing_horizontal', args.enabled === 'true');
    });

    this.homey.flow.getConditionCard('fan_speed_is').registerRunListener(async (args: { device: Homey.Device; aux_fan_speed: string }) => {
      return args.device.getCapabilityValue('aux_fan_speed') === args.aux_fan_speed;
    });
  }

};
