import * as React from 'react';
import inputPoints from '../resources/data/input-point.json';
import {StyleSheet, ScrollView, View} from 'react-native';
import TypeHierarchicalMenu from '../components/TypeHierarchicalMenu';
import SignalStatusLegend from '../components/SignalStatusLegend';
import {useAppDispatch, useAppSelector} from '../store';
import ScreenTitle from '../components/ScreenTitle';
import {
  TSignalTypeSuffix,
  TRootStackParamList,
  THierarchicalMenu,
  TNavigationProp,
} from '../resources/types';
import {changeAlertMode} from '../features/user/userSlice';
import type {NavigationProp} from '@react-navigation/native';
import InputPointInspectionWithMap from '../components/InputPointInspectionWithMap';
import {makeHierarchicalMenu, maskToLocations} from '../utils/helper';

const targetType = '水滲漏監察系統';
const alertType = 'leakage';
// type TNavigationProp = NavigationProp<TRootStackParamList, 'Leakage'>;

const signalTypes: TSignalTypeSuffix[] = [
  {suffix: '自動/手動', signalType: 'autoOrManual'},
  {
    suffix: '開啟/關閉',
    signalType: 'openOrClose',
  },
  {suffix: '故障', signalType: 'malFunction'},
  {suffix: '電源故障', signalType: 'powerMalFunction'},
  {suffix: '運行', signalType: 'inOperationOrStop'},
  {suffix: '警報', signalType: 'alarm'},
  {suffix: '切換', signalType: 'switchOver'},
  {suffix: '低電壓警報', signalType: 'lowVoltageAlarm'},
  {suffix: '低水位', signalType: 'lowWaterLevel'},
  {suffix: '高水位', signalType: 'highWaterLevel'},
  {suffix: '過壓', signalType: 'overPressure'},
  {suffix: '', signalType: 'default'},
];

const LeakageScreen = ({navigation}: {navigation: TNavigationProp}) => {
  const [hierarchy, setHierarchy] = React.useState<THierarchicalMenu>({});
  const [selectedChain, setSelectedChain] = React.useState<number[]>([]);
  const [focused, setFocused] = React.useState(false);
  const demoMode = useAppSelector(state => state.user.demoMode);
  const dispatch = useAppDispatch();
  const alertEnabled = useAppSelector(state => state.user.alertEnabled);
  const locationMask = useAppSelector(state => state.user.locationMask);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.debug('Leakage screen back in focus');
      setFocused(true);
      setSelectedChain([]);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.debug('Leakage screen blurred');
      setFocused(false);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const locations = maskToLocations(locationMask);
    const menu = makeHierarchicalMenu({
      inputPointData: inputPoints,
      targetType,
      signalTypes,
      locations
    });
    setHierarchy(menu);
  }, [locationMask]);

  const updateSelectedChain = (selected: number[]) => {
    console.debug(`selected = ${JSON.stringify(selected)}`);
    setSelectedChain(selected);
  };

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
      <View style={styles.sectionContentsContainer}>
        <TypeHierarchicalMenu
          hierarchy={hierarchy}
          selectedChain={selectedChain}
          onUpdate={updateSelectedChain}
        />
        <ScrollView style={styles.inputPointAndMapContainer}>
          <InputPointInspectionWithMap
            focused={focused}
            demoMode={demoMode}
            hierarchy={hierarchy}
            selectedChain={selectedChain}
            signalTypes={signalTypes}
          />
        </ScrollView>
      </View>
      <View style={styles.legendContainer}>
        <SignalStatusLegend />
      </View>
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
});

export default LeakageScreen;
