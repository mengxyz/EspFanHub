type FanConfig = {
  V?: number;

  V1?: number;
  V2?: number;
  V3?: number;

  V4?: number;
  V5?: number;
  V6?: number;

  F1?: number;
  F2?: number;
  F3?: number;
  F4?: number;
  F5?: number;
  D1?: number;
  D2?: number;
  D3?: number;
  D4?: number;
  D5?: number;

  L1?: number;
  L2?: number;
  L3?: number;

  L4?: number;
  L5?: number;
  L6?: number;
};

type Device = {
  uid: string;
  ip: string;
  name: string;
  userName: string;
  password: string;
  autoConnect?: boolean;
};

interface Data {
  boardTemp?: BoardTempData;
  thermistor: Thermistor;
  voltage: Voltage;
  fanSource: number[];
  argbSource: number;
  fanData: FanData;
}

interface BoardTempData {
  temp: number;
  humi: number;
}

interface Thermistor {
  ch0Adc?: number;
  ch0Resistance?: number;
  ch0Voltage?: number;
  ch0Temp?: number;
  ch1Adc?: number;
  ch1Resistance?: number;
  ch1Voltage?: number;
  ch1Temp?: number;
}

interface Voltage {
  twelveVolt: TwelveVolt;
  fiveVolt: FiveVolt;
}

interface TwelveVolt {
  current: number;
  voltage: number;
  power: number;
}

interface FiveVolt {
  current: number;
  voltage: number;
  power: number;
}

interface FanInputSource {
  ch1: number;
  ch2: number;
  ch3: number;
  ch4: number;
  ch5: number;
  argb: number;
}

interface FanData {
  freqs: number[];
  duties: number[];
  rpms: number[];
}
