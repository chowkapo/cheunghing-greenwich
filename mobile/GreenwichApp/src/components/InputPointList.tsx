import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { customSort, sortSignals } from '../utils/helper';
import { signalStatusList } from '../resources/config';
import { useAppSelector } from '../store';
import useRecursiveTimeout from '../utils/useRecursiveTimeout';
import { getInputPointStatus } from '../api/inputPointStatusApi';
import { TInputPoint, TSignalTypeSuffix } from '../resources/types';

const InputPointList = ({
  demoMode,
  inputPoints,
  signalTypesLabels,
  onInputPointPress,
  focused,
  refreshFrequency,
  customSignalPresentation,
  customCanonicalNameSortOrder = []
}: {
  demoMode: boolean;
  inputPoints?: TInputPoint[];
  signalTypesLabels: TSignalTypeSuffix[];
  onInputPointPress: (id: number) => void;
  focused: boolean;
  refreshFrequency: number;
  customSignalPresentation?: {
    [id: string]: {
      [id: string]: string;
    };
  };
  customCanonicalNameSortOrder?: string[];
}) => {
  // React.useEffect(
  //   () =>
  //     console.debug(
  //       `focused = ${focused}, customSignalPresentation = ${JSON.stringify(
  //         customSignalPresentation,
  //         null,
  //         2,
  //       )}`,
  //     ),
  //   [customSignalPresentation, focused],
  // );

  const onPress = (id: number | null) => {
    if (id) {
      onInputPointPress(id);
    }
  };

  const uniqueSignalTypes = React.useMemo(() => {
    // console.debug(`in InputPointList(), inputPoints:`);
    // console.debug(JSON.stringify(inputPoints));
    const extractedSignalTypes = inputPoints?.map(
      (v: TInputPoint) => v.signalType,
    );
    const uniqueList = (
      extractedSignalTypes ? [...new Set(extractedSignalTypes)] : []
    ) as string[];
    // console.debug(`uniqueList=${JSON.stringify(uniqueList)}`);
    return uniqueList;
  }, [inputPoints]);

  const filteredSignalTypesLabels = React.useMemo(() => {
    const filtered = signalTypesLabels.filter(signalType =>
      uniqueSignalTypes.includes(signalType.signalType),
    );
    // console.debug(`filteredSignalTypesLabels=${JSON.stringify(filtered)}`);
    return filtered;
  }, [signalTypesLabels, uniqueSignalTypes]);

  const uniqueCanonicalNames = React.useMemo(() => {
    const extractedCanonicalNames = inputPoints?.map(
      (v: TInputPoint) => v.canonicalName,
    );
    return (
      extractedCanonicalNames ? [...new Set(extractedCanonicalNames)] : []
    ) as string[];
  }, [inputPoints]);

  const pivotedInputPoints = React.useMemo(() => {
    const reformatted: any = {};
    uniqueCanonicalNames.forEach(canonicalName => {
      if (!canonicalName) {
        return;
      }
      reformatted[canonicalName] = {};
      uniqueSignalTypes.forEach(signalType => {
        if (!signalType) {
          return;
        }
        reformatted[canonicalName][signalType] = inputPoints?.find(
          (v: TInputPoint) => {
            return (
              v.canonicalName === canonicalName && v.signalType === signalType
            );
          },
        );
      });
    });

    inputPoints?.forEach((v: TInputPoint) => {
      if (v.canonicalName) {
        reformatted[v.canonicalName] = reformatted[v.canonicalName] || {};
        if (v.signalType) {
          reformatted[v.canonicalName][v.signalType] = v;
        } else {
          reformatted[v.canonicalName] = v;
        }
      }
    });
    // console.debug(
    //   `pivotedInputPoints = ${JSON.stringify(reformatted, null, 2)}`,
    // );
    return reformatted;
  }, [inputPoints, uniqueSignalTypes, uniqueCanonicalNames]);

  if (!inputPoints) {
    return <View />;
  }
  return (
    <View style={styles.inputPointsContainer}>
      <PivotedInputPointHeader
        signalTypes={uniqueSignalTypes}
        signalTypesLabels={filteredSignalTypesLabels}
      />
      {uniqueCanonicalNames &&
        customSort(uniqueCanonicalNames
          .sort(sortSignals), customCanonicalNameSortOrder)
          .map((canonicalName: string, index: number) => (
            <PivotedInputPointRow
              demoMode={demoMode}
              key={canonicalName}
              index={index}
              canonicalName={canonicalName}
              data={pivotedInputPoints[canonicalName]}
              signalTypes={uniqueSignalTypes}
              onPress={onPress}
              focused={focused}
              refreshFrequency={refreshFrequency}
              customSignalPresentation={customSignalPresentation}
            />
          ))}
    </View>
  );
};

const PivotedInputPointHeader = ({
  signalTypes,
  signalTypesLabels,
}: {
  signalTypes: string[];
  signalTypesLabels: TSignalTypeSuffix[];
}) => {
  return (
    <View style={styles.inputPointRowContainer}>
      <View style={styles.index} />
      <View style={signalTypes.length >= 3 ? styles.name : styles.name2} />
      {signalTypes.map((signalType: string) => {
        const thisLabel = signalTypesLabels.find(
          (v: { suffix: string; signalType: string }) =>
            v.signalType === signalType,
        );
        return (
          <View key={signalType} style={styles.signalType}>
            <Text style={styles.signalHeadingText}>
              {thisLabel?.heading ?? thisLabel?.suffix ?? ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const PivotedInputPointRow = ({
  demoMode,
  canonicalName,
  data,
  onPress,
  signalTypes,
  index,
  focused,
  refreshFrequency,
  customSignalPresentation,
}: {
  demoMode: boolean;
  canonicalName: string | undefined;
  data?: {
    [key: string]: TInputPoint;
  };
  signalTypes: string[];
  onPress: (id: number) => void;
  index: number;
  focused: boolean;
  refreshFrequency: number;
  customSignalPresentation?: {
    [id: string]: {
      [id: string]: string;
    };
  };
}) => {
  const authenticationToken = useAppSelector(
    state => state.user.authenticationToken,
  );
  const [inputPointStatus, setInputPointStatus] = React.useState<{
    [inputPointID: string]: number;
  }>({});
  const [pollId, setPollId] = React.useState(0);
  const [fetchedOnce, setFetchedOnce] = React.useState(false);

  const firstSignalType = React.useMemo(
    () =>
      signalTypes.find(signalType => typeof data?.[signalType] !== 'undefined'),
    [data, signalTypes],
  );

  React.useEffect(() => {
    setPollId(value => (value + 1) % 65535);
  }, [refreshFrequency, focused, demoMode]);

  const fetchSignalData = React.useCallback(
    () =>
      demoMode
        ? new Promise<void>(async resolve => {
          const mockStatus: any = {};
          signalTypes.forEach(
            signalType =>
            (mockStatus[data?.[signalType]?.id ?? ''] = Math.floor(
              Math.random() * 7,
            )),
          );
          // console.debug(
          //   `in PivotedInputPointRow(), mockStatus = ${JSON.stringify(
          //     mockStatus,
          //   )}`,
          // );
          setInputPointStatus(mockStatus);
          resolve();
        })
        : new Promise<void>(async resolve => {
          const inputPointIdList = signalTypes
            .map(signalType => data?.[signalType]?.id)
            .filter(v => !!v) as number[];
          if (inputPointIdList.length === 0) {
            return;
          }
          // console.debug(
          //   `inputPointIdList = ${JSON.stringify(inputPointIdList)}`,
          // );
          try {
            const newStatus = await getInputPointStatus(
              inputPointIdList,
              authenticationToken,
            );
            setInputPointStatus(newStatus);
          } catch (error) {
            console.error(error);
          } finally {
            resolve();
          }
        }),
    [authenticationToken, data, demoMode, signalTypes],
  );

  React.useEffect(() => {
    const callFetch = async () => await fetchSignalData();
    if (focused && !fetchedOnce) {
      callFetch();
      setFetchedOnce(true);
    }
  }, [fetchedOnce, fetchSignalData, focused]);

  useRecursiveTimeout(
    fetchSignalData,
    focused && fetchedOnce ? refreshFrequency : null,
    pollId,
  );

  return (
    <View style={styles.inputPointRowContainer}>
      <View style={styles.index}>
        <Text>{`${index + 1}.`}</Text>
      </View>
      <View style={signalTypes.length >= 3 ? styles.name : styles.name2}>
        <Text style={styles.signalNameText}>{`${canonicalName}`}</Text>
      </View>
      {signalTypes.map((signalType: string) => {
        const currentStatus = signalStatusList.find(
          (v: { value: number; text: string; color: string }) =>
            v.value === inputPointStatus[data?.[signalType]?.id + ''],
        );
        // console.debug(`signalType=${signalType}`);
        // console.debug(
        //   `inputPointStatus=${JSON.stringify(
        //     inputPointStatus,
        //   )}, inputPointId = ${
        //     data?.[signalType]?.id
        //   }, status = ${JSON.stringify(currentStatus)}`,
        // );
        // console.debug(`customSignalPresentation?.[currentStatus?.value + '' ?? '']?.[
        //   signalType
        // ] = ${
        //   customSignalPresentation?.[currentStatus?.value ?? '']?.[signalType]
        // }`);
        return (
          <View key={signalType} style={styles.signalType}>
            {!!data?.[signalType]?.id &&
              customSignalPresentation?.[currentStatus?.value ?? '']?.[
              signalType
              ] ? (
              <Text style={styles.signalValueText}>
                {customSignalPresentation?.[currentStatus?.value ?? '']?.[
                  signalType
                ] || '-'}
              </Text>
            ) : (
              <Icon
                name="circle"
                size={18}
                color={currentStatus ? currentStatus.color : 'lightgrey'}
              />
            )}
          </View>
        );
      })}
      <View style={styles.viewButton}>
        {firstSignalType && (
          <Button
            icon={<Icon name="location-pin" size={24} color="blue" />}
            type="clear"
            onPress={() =>
              data?.[firstSignalType]?.id &&
              onPress(data?.[firstSignalType]?.id)
            }
          />
        )}
        {!firstSignalType && <Text>No Map</Text>}
      </View>
    </View>
  );
};

export default InputPointList;

const styles = StyleSheet.create({
  inputPointsContainer: {
    flexGrow: 1,
    paddingTop: 10,
  },
  inputPointRowContainer: {
    display: 'flex',
    flexDirection: 'row',
    margin: 4,
    alignItems: 'center',
  },
  index: {
    width: '5%',
    alignItems: 'center',
  },
  name: {
    width: '30%',
  },
  name2: {
    width: '45%',
  },
  suffix: {
    width: '20%',
  },
  signalType: {
    width: '10%',
    alignItems: 'center',
  },
  floor: {
    width: '50%',
  },
  viewButton: {
    width: '10%',
    alignItems: 'center',
  },
  signalHeadingText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  signalNameText: {
    fontSize: 16,
  },
  signalValueText: {
    fontSize: 16,
  },
});
