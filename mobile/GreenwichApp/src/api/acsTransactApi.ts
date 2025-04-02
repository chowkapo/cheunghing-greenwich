import {api} from '../resources/api';
import {TACSTransactResponse} from '../resources/types';

export interface IAcsTransactApi {
  transactionId?: number;
  authenticationToken: string;
}

export const acsTransactApi = ({
  transactionId,
  authenticationToken,
}: IAcsTransactApi) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authenticationToken ?? ''}`,
    },
  };
  const url = api.transactionUrl(transactionId);
  // console.debug(
  //   `### ACS transact API url = ${url}, authenticationToken=${authenticationToken}`,
  // );
  return fetch(url, options)
    .then(res => {
      // console.debug(`### ACS transact API res = ${JSON.stringify(res)}`);
      const contentType = res.headers.get('Content-Type');
      if (
        !res.ok ||
        !contentType ||
        !contentType.includes('application/json')
      ) {
        // console.debug(`### ACS transact API: no records received`);
        throw new TypeError('No transact records received');
      }
      return res.json();
    })
    .then(data => data as TACSTransactResponse[]);
};
