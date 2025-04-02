import {api} from '../resources/api';
import {TUserLoginResponse} from '../resources/types';

export type TLoginApi = {
  username: string;
  password: string;
  signal: AbortSignal;
};

export const loginApi = ({username, password, signal}: TLoginApi) =>
  fetch(api.loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: `operatorname=${encodeURI(username)}&password=${encodeURI(password)}`,
    signal,
  }).then(res => res.json() as unknown as TUserLoginResponse);
