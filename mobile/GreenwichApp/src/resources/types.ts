import type { NavigationProp } from '@react-navigation/native';
// import type {MaterialTopTabNavigationProp} from '@react-navigation/material-top-tabs';

export type TSignalTypeSuffix = {
  suffix: string;
  signalType: string;
  heading?: string;
};

export type TSignalTypeSuffixHandling = TSignalTypeSuffix & {
  replace?: TSignalTypeSuffix;
};

export type TInputPoint = {
  id: number;
  ioModuleId?: string | number;
  controllerId?: string | number;
  type: string;
  sub_type: string;
  sub_type2?: string;
  name: string;
  mapId: string;
  x: number;
  y: number;
  allowedLocations: string[];
  canonicalName?: string;
  suffix?: string;
  signalType?: string;
  location: string;
};

export type TUserLoginResponse = {
  success: boolean;
  locationMask: number;
  remark: string;
};

export type TCctvCameraLocation = {
  cameraId: number;
  cameraName?: string;
  location?: string;
  mainStream: string;
  subStream: string;
  floor: string;
  mapid: string;
  x: number;
  y: number;
  monitor: string[];
};

export type TModbusChannelQueryResponse = {
  modbusChannelID: number;
  channelName: string;
  digitalStatus: number;
  engineeringValue: number;
};

export type TModbusChannelStatusResponse = {
  modbusChannelID: number;
  channelName: string;
  badTerminal: boolean;
};

export type TChannelValue = {
  badTerminal?: boolean;
  digitalStatus?: number;
  engineeringValue?: number;
};

export type TInputPointStatusResponse = {
  inputPointID: number;
  enabled: boolean;
  name: string;
  status: number;
};

export type TLiftChannel = {
  modbusChannelId: number;
  channelName: string;
  liftNumber: string;
  signalType: string;
  locationMask: number;
};

export type TLiftChannelData = {
  [liftName: string]: TLiftChannel;
};

export type TLiftSignalConversion = {
  value: number;
  displayValue: string;
}[];

export type TEventType = {
  eventTypeID: number;
  description: string;
};

export type TIMSTransactRecord = {
  transID: number;
  controllerID: number;
  controllerName: string;
  ioModuleID: number;
  moduleName: string;
  ioType: number;
  moduleType: string;
  pointID: number;
  pointName: string;
  dayOfWeek: string;
  transDateTime: string; //2023-04-29 14:33:24
  eventID: number;
  event: string;
  alertType?: string;
};

export type TReaderResponse = {
  readerID: number;
  readerName: string;
};

export type TCardResponse = {
  cardID: number;
  cardNo: number;
};

export type TACSTransactResponse = {
  transID: number;
  field1: string;
  field2: string;
  // location: string;
  transDateTime: string;
  // status: string;
  card: TCardResponse;
  reader: TReaderResponse;
  eventType: TEventType;
};

export type TACSTransactLongPollResponse = {
  transID: number;
  cardID: number;
  cardNo: string;
  doorID: number;
  field1: string;
  field2: string;
  readerID: number;
  transDateTime: number;
  eventTypeID: number;
};

export type TAccessRecord = {
  id: number;
  cardNo: string;
  name: string;
  unit: string;
  location: string;
  accessTime: number;
  status: string;
};

export type TUserState = {
  username: string | null;
  locationMask: number;
  authenticationToken: string | null;
  authenticating: boolean;
  error: string | null;
  refreshFrequency: number;
  selectedCameras: number[];
  useMainStream: boolean;
  demoMode: boolean;
  adminMode: boolean;
  alertEnabled: {
    [alertType: string]: boolean;
  };
};
export type TUserData = {
  username: string;
  locationMask: number;
  authenticationToken: string | null;
  refreshFrequency: number;
  selectedCameras: number[];
  useMainStream: boolean;
  demoMode: boolean;
  adminMode: boolean;
  alertEnabled: {
    [alertType: string]: boolean;
  };
};

export type TDoorAccessState = {
  isRetrieving: boolean;
  lastTransactionId: number | null;
  doorAccessRecords: TAccessRecord[];
  // retrievingUpdates: boolean;
  error: string | null;
};

export type TEvent = {
  system: string;
  record: TIMSTransactRecord;
  acknowledged: boolean;
};

export type TEventState = {
  isRetrieving: boolean;
  lastTransactionId: number | null;
  events: TEvent[];
  error: string | null;
};

export type TRootStackParamList = {
  Home: undefined;
  CCTV: undefined;
  DoorAccess: undefined;
  Electricity: undefined;
  Water: undefined;
  Leakage: undefined;
  AirFlow: undefined;
  WaterTank: undefined;
  Valve: undefined;
  Door: undefined;
  EmergencyAlarm: undefined;
  Lift: undefined;
  Settings: undefined;
};

export type TNavigationProp = NavigationProp<
  TRootStackParamList,
  keyof TRootStackParamList
>;

export type THierarchicalMenu = {
  [type: string]:
    | TInputPoint[]
    | {
        [type: string]: TInputPoint[];
      };
};

export type TCustomSignalPresentation = {
  [level: string]: {
    [signalType: string]: string;
  };
};

export type TMapData = {
  id: string;
  name: string;
  map: string;
  map_width: number;
  map_height: number;
};

export type TCctvFloor = {
  id: string;
  label: string;
  mapid?: string;
};

export type TCctvFloorGroup = {
  id: string;
  label: string;
  floors?: (TCctvFloor | TCctvFloorGroup)[];
};

export type TCctvFloorOrGroup = TCctvFloor | TCctvFloorGroup;
