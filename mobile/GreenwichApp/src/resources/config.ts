export const acsBaseUrl = 'http://113.212.233.23:8080/CHECOLACS/';
export const imsBaseUrl = 'http://113.212.233.23:8081/CHECOLIMS/';

export const screensPerRow = 4;
export const doorAccessQueryCount = 10;
export const doorAccessRecordDisplayLimit = 10;
export const sensorRecordQueryCount = 100;
export const sensorRecordCountLimit = 200;
export const sensorRecordDisplayCount = 50;
export const minSensorRecordCount = 20;

export const signalStatusList: {
  value: number;
  text: string;
  color: string;
}[] = [
    {
      value: 0,
      text: '正常',
      color: 'blue',
    },
    {
      value: 1,
      text: '警報',
      color: 'red',
    },
    {
      value: 2,
      text: '已確認',
      color: 'yellow',
    },
    {
      value: 3,
      text: '未確認',
      color: 'green',
    },
    {
      value: 4,
      text: '未清除警報',
      color: 'purple',
    },
    {
      value: 5,
      text: '通訊中斷',
      color: 'gray',
    },
    {
      value: 6,
      text: '手動停止警報',
      color: 'brown',
    },
  ];

export const locatorAdjustment = {
  x: 32,
  y: 64,
};

export const defaultRefreshFrequency = 1000;

export const vlcPlayerInitOptions = ['--rtsp-tcp=true'];
// export const vlcPlayerInitOptions = [];
