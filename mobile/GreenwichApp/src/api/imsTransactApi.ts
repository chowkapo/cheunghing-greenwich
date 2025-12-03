import { api } from '../resources/api';
import { TIMSTransactRecord } from '../resources/types';

export interface IImsTransactApi {
  transactionId?: number;
  authenticationToken: string;
  locationMask?: number;
}

export const imsTransactApi = ({
  transactionId,
  authenticationToken,
  locationMask,
}: IImsTransactApi) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authenticationToken ?? ''}`,
    },
  };
  const url = api.imsTransactUrl({ transId: transactionId, locationMask });
  // console.debug(
  //   `### IMS transact API url = ${url}, authenticationToken=${authenticationToken}`,
  // );
  return fetch(url, options)
    .then(res => {
      // console.debug(`### IMS transact API res = ${JSON.stringify(res)}`);
      const contentType = res.headers.get('content-type');
      if (
        !res.ok ||
        !contentType ||
        !contentType.includes('application/json')
      ) {
        // console.debug(`### IMS transact API: no records received`);
        throw new TypeError('No sensor readings received');
      }
      return res.json();
    })
    .then(data => data as TIMSTransactRecord[]);
};
