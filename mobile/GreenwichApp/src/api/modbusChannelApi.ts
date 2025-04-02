import {api} from '../resources/api';
import {
  TChannelValue,
  TModbusChannelQueryResponse,
  TModbusChannelStatusResponse,
} from '../resources/types';

export const getModbusChannelValues = async (
  channelIds: number[],
  authenticationToken: string | null,
) => {
  const modbusChannelQueryApiEndpoint = api.modbusChannelQueryUrl(channelIds);
  const modbusChannelStatusApiEndpoint = api.modbusChannelStatusUrl(channelIds);

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authenticationToken ?? ''}`,
    },
  };

  const modbusChannelValues: {
    [modbusChannelID: string]: TChannelValue;
  } = {};

  try {
    const modbusStatusValues = await fetch(
      modbusChannelStatusApiEndpoint,
      options,
    )
      .then(res => res.json())
      .then(data => data as TModbusChannelStatusResponse[]);

    modbusStatusValues.forEach(v => {
      modbusChannelValues[v.modbusChannelID] = {
        badTerminal: v.badTerminal,
      };
    });

    const modbusQueryValues = await fetch(
      modbusChannelQueryApiEndpoint,
      options,
    )
      .then(res => res.json())
      .then(data => data as TModbusChannelQueryResponse[]);

    modbusQueryValues.forEach(v => {
      modbusChannelValues[v.modbusChannelID] = {
        ...modbusChannelValues[v.modbusChannelID],
        digitalStatus: v.digitalStatus,
        engineeringValue: v.engineeringValue,
      };
    });

    return modbusChannelValues;
  } catch (err) {
    throw err;
  }
};
