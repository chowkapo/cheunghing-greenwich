import {
  acsBaseUrl,
  doorAccessQueryCount,
  imsBaseUrl,
  sensorRecordQueryCount,
} from './config';

export const api = {
  loginUrl: `${imsBaseUrl}Operator/Login`,
  transactionUrl: (minTransId = 0, limit = doorAccessQueryCount) =>
    `${acsBaseUrl}Transact?TransID=${minTransId}&Limit=${limit}`,
  transactionPollUrl: (minTransId = 0, limit = doorAccessQueryCount) =>
    `${acsBaseUrl}Transact/LongPoll?TransID=${minTransId}&Limit=${limit}`,
  inputPointStatusUrl: `${imsBaseUrl}InputPoint/Status`,
  imsTransactUrl: (transId = 0, limit = sensorRecordQueryCount) =>
    `${imsBaseUrl}Transact/?TransID=${transId}&Limit=${limit}`,
  modbusChannelQueryUrl: (channelIds: number[]) => {
    const channelIdList = channelIds
      .map(id => `ModbusChannelID=${id}`)
      .join('&');
    return `${imsBaseUrl}ModbusChannel?${channelIdList}`;
  },
  modbusChannelStatusUrl: (channelIds: number[]) => {
    const channelIdList = channelIds
      .map(id => `ModbusChannelID=${id}`)
      .join('&');
    return `${imsBaseUrl}ModbusChannel/Status?${channelIdList}`;
  },
  getCameraListUrl: () => `${imsBaseUrl}Camera`,
};
