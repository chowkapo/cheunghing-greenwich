import {api} from '../resources/api';
import {TInputPointStatusResponse} from '../resources/types';

export const inputPointStatusApi = (
  inputPointIds: number[],
  authenticationToken: string | null,
) => {
  const inputPointIdList = inputPointIds
    .map(id => `InputPointID=${id}`)
    .join('&');
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authenticationToken ?? ''}`,
    },
  };
  const url = `${api.inputPointStatusUrl}?${inputPointIdList}`;
  // console.debug(`authenticationToken=${authenticationToken}, url = ${url}`);
  return fetch(url, options)
    .then(res => res.json())
    .then(data => data as TInputPointStatusResponse[]);
};

export const getInputPointStatus = async (
  inputPointIds: number[],
  authenticationToken: string | null,
) => {
  try {
    const result = await inputPointStatusApi(
      inputPointIds,
      authenticationToken,
    );
    // console.debug(result);
    const newStatus: {
      [inputPointID: string]: number;
    } = {};
    result.forEach((v: TInputPointStatusResponse) => {
      newStatus[v.inputPointID] = v.status;
    });
    // console.debug(`newStatus = ${JSON.stringify(newStatus)}`);
    return newStatus;
  } catch (err) {
    console.error('Error in getInputPointStatus(), %o', err);
    // throw err;
    return {};
  }
};
