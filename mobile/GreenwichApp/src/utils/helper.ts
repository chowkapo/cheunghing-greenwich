import inputPoints from '../resources/data/input-point.json';
import {
  TCctvCameraLocation,
  TCctvFloor,
  TCctvFloorGroup,
  THierarchicalMenu,
  TInputPoint,
  TSignalTypeSuffixHandling,
} from '../resources/types';

/* Bitwise mask to location
  Carpark: 1
  Retail: 2
  CH: 4
  T8&TL: 8
  T6&T7: 16
  T3&T5: 32
  T1&T2: 64
  EMO: 128
*/

const locationMaskMapping = [
  'EMO', // 1
  'Commercial', // 2
];

export const maskToLocations = (locationMask: number) => {
  let locations: string[] = [];
  for (let i = 0; i < locationMaskMapping.length; i++) {
    locations = locations.concat(
      // eslint-disable-next-line no-bitwise
      locationMask & (2 ** i) ? [locationMaskMapping[i]] : [],
    );
  }
  return Array.from(new Set(locations));
};

export const orderTier1 = [
  'B2/F',
  'B1/F',
  'G/F',
  '1/F',
  '2/F',
  '3/F',
  'R/F',
  'UR1/F',
  'UR2/F',
];

export const orderTier2 = [
  '1-3座',
  '5-6座',
  '7-8座',
  'B2/F',
  'B1/F',
  'G/F',
  '1/F',
  '2/F',
  'R/F',
  'UR1/F',
  'UR2/F',
];

// const orderTier2 = [];
export const orderTier3 = [];

export const partialSort = (arr: string[], orderingArray: string[]) => {
  if (!arr || arr.length === 0) {
    return [];
  }
  const size = arr.length;
  const indexed = arr.map((v, index) => {
    // console.debug(`partialSort: v = ${v}`);
    const orderedIndex = orderingArray.findIndex(p => p === v);
    // console.debug(`partialSort: orderedIndex = ${orderedIndex}`);
    if (orderedIndex < 0) {
      return {
        value: v,
        index,
      };
    } else {
      return {
        value: v,
        index: size + orderedIndex,
      };
    }
  });
  // console.debug(`partialSort: indexed = ${JSON.stringify(indexed)}`);
  return indexed.sort((a, b) => a.index - b.index).map(v => v.value);
};

export const customSort = (input: string[], subOrder: string[]) => {
  const subOrderSet = new Set(subOrder);
  const beforeSubOrder: string[] = [];
  const inSubOrder: string[] = [];
  const afterSubOrder: string[] = [];

  let foundFirstSubOrder = false;

  input.forEach(item => {
    if (subOrderSet.has(item)) {
      inSubOrder.push(item);
      foundFirstSubOrder = true;
    } else if (!foundFirstSubOrder) {
      beforeSubOrder.push(item);
    } else {
      afterSubOrder.push(item);
    }
  });

  const sortedInSubOrder = inSubOrder.sort(
    (a, b) => subOrder.indexOf(a) - subOrder.indexOf(b)
  );

  return [...beforeSubOrder, ...sortedInSubOrder, ...afterSubOrder];
};

export const sortSignals = (a: string, b: string) => {
  const matchA = /^(\d*)(\D*)(\d*)$/.exec(a);
  const matchB = /^(\d*)(\D*)(\d*)$/.exec(b);
  if (!matchA || !matchB) {
    return a.localeCompare(b);
  } else {
    return (
      parseInt(matchA[1], 10) - parseInt(matchB[1], 10) ||
      matchA[2].localeCompare(matchB[2]) ||
      parseInt(matchA[3], 10) - parseInt(matchB[3], 10)
    );
  }
};

export const alertTypeMap: {
  [system: string]: string;
} = {
  水缸監察系統: 'watertank',
  水滲漏監察系統: 'leakage',
  門磁感應監察系統: 'door',
  緊急召喚監察系統: 'emergency',
  升降機監察系統: 'lift',
  減壓閥監察系統: 'valve',
  電氣監察系統: 'electric',
  供水監察系統: 'water',
};

export const classifyAlert = ({
  controllerID = 0,
  ioType = -1,
  pointID = -1,
}) => {
  let alertType = '';
  if (ioType === 0 && pointID > 0) {
    const inputPointRecord = inputPoints.find(v => v.id === pointID);
    alertType = alertTypeMap[inputPointRecord?.type ?? ''] ?? '';
  } else if (ioType === 6) {
    if (controllerID >= 1 && controllerID <= 170) {
      alertType = 'lift';
    } else {
      alertType = '';
    }
  }
  return alertType;
};

const alertSystemName: {
  [id: string]: string;
} = {
  leakage: '水滲漏',
  door: '門磁感應',
  emergency: '緊急召喚',
  watertank: '水缸',
  valve: '減壓閥',
  lift: '電梯',
  electric: '電氣',
  water: '供水',
};

export const getAlertSystemName = (alertCode: string) =>
  alertSystemName[alertCode] ?? '';

export const makeHierarchicalMenu = ({
  targetType,
  inputPointData,
  signalTypes,
  locations,
}: {
  targetType: string;
  inputPointData: TInputPoint[];
  signalTypes: TSignalTypeSuffixHandling[];
  locations?: string[];
}) => {
  const reSuffix = new RegExp(/^\s*(.*?)\s*(\S+)\s*$/);
  const hierarchicalMenu: THierarchicalMenu = {};
  inputPointData
    .filter(
      (v: TInputPoint) =>
        v.type === targetType &&
        (typeof locations === 'undefined' ||
          haveCommonElements(v.allowedLocations, locations)),
    )
    .forEach((v: TInputPoint) => {
      if (v.sub_type2) {
        hierarchicalMenu[v.sub_type] = hierarchicalMenu[v.sub_type] || {};
        hierarchicalMenu[v.sub_type][v.sub_type2 ?? ''] =
          hierarchicalMenu[v.sub_type][v.sub_type2 ?? ''] || [];
      } else {
        hierarchicalMenu[v.sub_type] = hierarchicalMenu[v.sub_type] || [];
      }

      const match = reSuffix.exec(v.name);
      const canonicalName = (match && match[1])?.replace(/\s+/, ' ');
      let suffix = ((match && match[2]) || '').replace(' ', '');
      let signalType = signalTypes.find(v2 => v2.suffix === suffix);
      const newInputPoint = {
        ...v,
        canonicalName,
        suffix: signalType?.replace ? signalType?.replace?.suffix : suffix,
        signalType: signalType?.replace
          ? signalType?.replace?.signalType
          : signalType?.signalType,
      };
      if (v.sub_type2) {
        hierarchicalMenu[v.sub_type][v.sub_type2 ?? ''].push(newInputPoint);
      } else {
        if (hierarchicalMenu[v.sub_type] instanceof Array) {
          (hierarchicalMenu[v.sub_type] as TInputPoint[]).push(newInputPoint);
        }
      }
    });
  return hierarchicalMenu;
};

export const haveCommonElements = (array1: string[], array2: string[]) => {
  // Create a set from the first array
  const set1 = new Set(array1);

  // Iterate over the second array
  for (const element of array2) {
    // Check if any element exists in the set
    if (set1.has(element)) {
      return true; // Common element found
    }
  }

  return false; // No common elements found
};

const expandLocations = (locations: string[]) => {
  let expanded = [];
  locations.forEach(l => {
    if (l.includes('&')) {
      expanded = expanded.concat(l.split('&'));
    } else {
      expanded.push(l);
    }
  });
  console.log(`locations = ${JSON.stringify(locations)}`);
  console.log(`expanded = ${JSON.stringify(expanded)}`);
  return expanded;
};

export const getCctvCameraList = ({
  cctvCameraLocationList,
  mapId,
  chainLabels,
  locations,
}: {
  cctvCameraLocationList: TCctvCameraLocation[];
  mapId: string;
  chainLabels: string[];
  locations?: string[];
}) => {
  const list = cctvCameraLocationList
    .filter(cctv => {
      return (
        cctv.mapid === mapId &&
        cctv.x &&
        cctv.y &&
        chainLabels
          .map(label => label.toUpperCase())
          .includes(cctv.floor?.toUpperCase())
      );
    })
    .map(cctv => ({
      ...cctv,
      enabled:
        !locations ||
        haveCommonElements(cctv.monitor, expandLocations(locations)),
    }));
  return list;
};

export const getCctvMenuSelectedChainLabels = ({
  cctvMultiLevelMenus,
  selected,
}: {
  cctvMultiLevelMenus: TCctvFloorGroup[];
  selected: number[];
}) => {
  const newSelectedChainLabels: string[] = [];
  let currentLevel = cctvMultiLevelMenus;
  selected.forEach(selectedItem => {
    newSelectedChainLabels.push(currentLevel[selectedItem].label);
    // setSelectedMapId((currentLevel[selectedItem] as TCctvFloor).mapid ?? null);
    currentLevel = (currentLevel[selectedItem] as TCctvFloorGroup).floors ?? [];
  });
  return newSelectedChainLabels;
};

export const getTargetMap = ({
  cctvMultiLevelMenus,
  selected,
}: {
  cctvMultiLevelMenus: TCctvFloorGroup[];
  selected: number[];
}) => {
  let newSelectedMap = null;
  let currentLevelFloors: (TCctvFloorGroup | TCctvFloor)[] =
    cctvMultiLevelMenus;
  let targetFloor: TCctvFloor | null = null;
  selected.forEach(level => {
    if ((currentLevelFloors[level] as TCctvFloorGroup).floors) {
      currentLevelFloors =
        ((currentLevelFloors as TCctvFloorGroup[])[level] as TCctvFloorGroup)
          .floors ?? [];
    } else {
      targetFloor = currentLevelFloors[level] as TCctvFloor;
    }
  });
  if (targetFloor && (targetFloor as TCctvFloor).mapid) {
    newSelectedMap = targetFloor;
  }
  return newSelectedMap;
};
