import * as React from 'react';
import inputPoints from '../resources/data/input-point.json';
import {StyleSheet, ScrollView, View} from 'react-native';
import TypeHierarchicalMenu from '../components/TypeHierarchicalMenu';
import SignalStatusLegend from '../components/SignalStatusLegend';
import {useAppSelector, useAppDispatch} from '../store';
import ScreenTitle from '../components/ScreenTitle';
import type {
  TSignalTypeSuffix,
  TRootStackParamList,
  THierarchicalMenu,
  TNavigationProp,
} from '../resources/types';
import {changeAlertMode} from '../features/user/userSlice';
import type {NavigationProp} from '@react-navigation/native';
import {makeHierarchicalMenu} from '../utils/helper';
import InputPointInspectionWithMap from '../components/InputPointInspectionWithMap';

const targetType = '電氣監察系統';
const alertType = 'electric';
// type TNavigationProp = NavigationProp<TRootStackParamList, 'Electricity'>;

const signalTypes: TSignalTypeSuffix[] = [
  {suffix: '正常', signalType: 'normalOrMalfunction', heading: '正常/故障'},
  {suffix: '故障', signalType: 'malFunction'},
  {suffix: '運行', signalType: 'runOrStop', heading: '運行/停止'},
  {suffix: '', signalType: 'default'},
];

const customSignalPresentation = {
  '0': {
    runOrStop: '停止',
    normalOrMalfunction: '故障',
  },
  '1': {
    runOrStop: '運行',
    normalOrMalfunction: '正常',
  },
  '2': {
    runOrStop: '運行',
    normalOrMalfunction: '正常',
  },
  '3': {
    runOrStop: '停止',
    normalOrMalfunction: '故障',
  },
  '4': {
    runOrStop: '停止',
    normalOrMalfunction: '故障',
  },
  '5': {
    runOrStop: '通訊中斷',
    normalOrMalfunction: '通訊中斷',
  },
  '6': {
    runOrStop: '停止',
    normalOrMalfunction: '故障',
  }
};

const ElectricityScreen = ({navigation}: {navigation: TNavigationProp}) => {
  const [hierarchy, setHierarchy] = React.useState<THierarchicalMenu>({});
  const [selectedChain, setSelectedChain] = React.useState<number[]>([]);
  const [focused, setFocused] = React.useState(false);
  const demoMode = useAppSelector(state => state.user.demoMode);
  const dispatch = useAppDispatch();
  const alertEnabled = useAppSelector(state => state.user.alertEnabled);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.debug('Electricity screen back in focus');
      setFocused(true);
      setSelectedChain([]);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.debug('Electricity screen blurred');
      setFocused(false);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const menu = makeHierarchicalMenu({
      inputPointData: inputPoints,
      targetType,
      signalTypes,
    });
    setHierarchy(menu);
  }, []);

  const singleDefaultItem = React.useMemo(() => {
    const tier1 = Object.keys(hierarchy);
    const singleFirstLevel = tier1.length === 1 && tier1[0] === ''
    console.log(`singleFirstLevel = ${singleFirstLevel}`)
    return singleFirstLevel;
  }, [hierarchy]);

  React.useEffect(() => {
    if (focused) {
      if (singleDefaultItem) {
        setSelectedChain([0]);
      }
    }
  }, [singleDefaultItem, focused]);

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
        {!singleDefaultItem && (
          <TypeHierarchicalMenu
            hierarchy={hierarchy}
            selectedChain={selectedChain}
            onUpdate={updateSelectedChain}
          />
        )}
        <ScrollView style={styles.inputPointAndMapContainer}>
          <InputPointInspectionWithMap
            focused={focused}
            demoMode={demoMode}
            hierarchy={hierarchy}
            selectedChain={selectedChain}
            signalTypes={signalTypes}
            customSignalPresentation={customSignalPresentation}
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

export default ElectricityScreen;
