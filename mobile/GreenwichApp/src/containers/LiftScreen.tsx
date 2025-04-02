import * as React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableHighlight,
  Modal,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../store';
import ScreenTitle from '../components/ScreenTitle';
import type {
  TChannelValue,
  TLiftChannelData,
  TLiftSignalConversion,
  TRootStackParamList,
} from '../resources/types';
import liftChannelData from '../resources/data/lift-data.json';
import liftSignalConversionData from '../resources/data/lift-signal-data.json';
import {getModbusChannelValues} from '../api/modbusChannelApi';
import useRecursiveTimeout from '../utils/useRecursiveTimeout';
import {changeAlertMode} from '../features/user/userSlice';
import type {NavigationProp} from '@react-navigation/native';

const targetType = '電梯監察系統';
const alertType = 'lift';
const liftLevels = ['L1', 'L2', 'L3', 'L4'];
type TNavigationProp = NavigationProp<TRootStackParamList, 'Lift'>;

const LiftScreen = ({navigation}: {navigation: TNavigationProp}) => {
  const {demoMode, authenticationToken, refreshFrequency} = useAppSelector(
    state => state.user,
  );
  const [focused, setFocused] = React.useState(false);
  const [channelValues, setChannelValues] = React.useState<{
    [modbusChannelID: string]: TChannelValue;
  }>({});
  const [pollId, setPollId] = React.useState(0);
  const [fetchedOnce, setFetchedOnce] = React.useState(false);
  const dispatch = useAppDispatch();
  const alertEnabled = useAppSelector(state => state.user.alertEnabled);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.debug('Lift screen back in focus');
      setFocused(true);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.debug('Lift screen blurred');
      setFocused(false);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    setPollId(value => (value + 1) % 65535);
  }, [refreshFrequency, demoMode, focused]);

  const fetchSignalData = React.useCallback(
    () =>
      demoMode
        ? new Promise<void>(async resolve => {
            const liftChannelIds: number[] = [];

            for (const lift in liftChannelData as TLiftChannelData) {
              liftChannelIds.push(
                (liftChannelData as TLiftChannelData)[
                  lift as keyof TLiftChannelData
                ].modbusChannelID,
              );
            }

            const mockValues: {
              [modbusChannelID: string]: TChannelValue;
            } = {};

            for (const lift in liftChannelData as TLiftChannelData) {
              const modbusChannelID = (liftChannelData as TLiftChannelData)[
                lift as keyof TLiftChannelData
              ].modbusChannelID;

              const mockChannelValue: TChannelValue = {
                badTerminal: false,
                digitalStatus: Math.random() > 0.5 ? 1 : 0,
                engineeringValue: Math.ceil(Math.random() * 5),
              };
              mockValues[modbusChannelID] = mockChannelValue;
            }
            setChannelValues(mockValues);

            resolve();
          })
        : new Promise<void>(async resolve => {
            const liftChannelIds: number[] = [];

            for (const lift in liftChannelData as TLiftChannelData) {
              liftChannelIds.push(
                (liftChannelData as TLiftChannelData)[
                  lift as keyof TLiftChannelData
                ].modbusChannelID,
              );
            }
            try {
              const newChannelValues = await getModbusChannelValues(
                liftChannelIds,
                authenticationToken,
              );
              console.debug(
                `liftChannelIds = ${JSON.stringify(
                  liftChannelIds,
                )}, newChannelValues = ${JSON.stringify(newChannelValues)}`,
              );
              setChannelValues({
                ...channelValues,
                ...newChannelValues,
              });
            } catch (error) {
              console.error(error);
            } finally {
              resolve();
            }
          }),
    [authenticationToken, channelValues, demoMode],
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

  const handleAlertToggle = () => {
    dispatch(
      changeAlertMode({
        system: alertType,
        enabled: !alertEnabled?.[alertType],
      }),
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <ScreenTitle
        title={targetType}
        showAlertToggle={true}
        enabled={!!alertEnabled?.[alertType]}
        onValueChange={handleAlertToggle}
      />
      <ScrollView style={styles.table}>
        <LiftHeader levels={liftLevels} />
        <LiftPositionRow
          levels={liftLevels}
          liftInputChannelData={liftChannelData}
          liftSignalConversion={liftSignalConversionData}
          channelValues={channelValues}
        />
      </ScrollView>
    </View>
  );
};

const LiftHeader = ({levels}: {levels: string[]}) => {
  return (
    <View style={styles.liftDataRow}>
      <View style={styles.tableHeaderLabel}>
        <Text style={styles.liftNumberHeader}>升降機編號</Text>
      </View>
      {levels.map(level => (
        <View key={level} style={styles.tableHeader}>
          <Text style={styles.liftNumberHeader}>{level}</Text>
        </View>
      ))}
    </View>
  );
};

const LiftPositionRow = ({
  levels,
  liftInputChannelData,
  liftSignalConversion,
  channelValues,
}: {
  levels: string[];
  liftInputChannelData: TLiftChannelData;
  liftSignalConversion: TLiftSignalConversion;
  channelValues: {
    [modbusChannelID: string]: TChannelValue;
  };
}) => {
  const levelDisplay = React.useMemo(() => {
    const levelConversion: {
      [value: number]: String;
    } = {};
    liftSignalConversion.forEach(level => {
      levelConversion[level.value] = level.displayValue;
    });
    return levelConversion;
  }, [liftSignalConversion]);
  return (
    <View style={styles.liftDataRow}>
      <View style={[styles.tableHeaderLabel, styles.tableRowLabel]}>
        <Text style={{fontSize: 16}}>樓層位置</Text>
      </View>
      {levels.map(level => {
        const {modbusChannelID} = liftInputChannelData[level];
        return (
          <View key={level} style={[styles.tableHeader, styles.tableRow]}>
            <Text style={{fontSize: 16}}>
              {channelValues[modbusChannelID]?.engineeringValue
                ? levelDisplay[
                    channelValues[modbusChannelID].engineeringValue ?? 0
                  ]
                : '-'}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    height: '100%',
    flexDirection: 'column',
  },
  sectionContentsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  legendContainer: {
    height: 80,
  },
  inputPointAndMapContainer: {
    overflow: 'scroll',
  },
  table: {
    flex: 1,
    width: '95%',
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
  },
  liftDataRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
  },
  tableHeaderLabel: {
    flex: 2,
    backgroundColor: '#FFD580',
    paddingLeft: 10,
    paddingRight: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderColor: '#FFD580',
    borderStyle: 'solid',
    borderWidth: 1,
    height: '100%',
  },
  liftNumberHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableHeader: {
    flex: 1,
    backgroundColor: '#FFD580',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFD580',
    borderStyle: 'solid',
    borderWidth: 1,
    height: '100%',
  },
  tableRowLabel: {
    backgroundColor: 'white',
    borderColor: 'cyan',
  },
  tableRow: {
    backgroundColor: 'white',
    borderColor: 'cyan',
  },
});

export default LiftScreen;
