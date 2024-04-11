export class Utils {
  static parseConfig = (input: string): FanConfig => {
    const config: FanConfig = {};
    input.split(';').forEach((item) => {
      const [key, value] = item.split(':');
      config[key as keyof FanConfig] = parseFloat(value);
    });
    return config;
  };
}
