import * as React from 'react';
import {StyleSheet, ScrollView, View, Text} from 'react-native';
import type {NavigationProp} from '@react-navigation/native';
import {useAppSelector} from '../store';
import ScreenTitle from '../components/ScreenTitle';
import type {TAccessRecord, TNavigationProp, TRootStackParamList} from '../resources/types';
import DoorAccessRecordTable from '../components/DoorAccessRecordTable';

// type TNavigationProp = NavigationProp<TRootStackParamList, 'DoorAccess'>;

const DoorAccessScreen = ({navigation}: {navigation: TNavigationProp}) => {
  const [focused, setFocused] = React.useState(false);
  // const demoMode = useSelector((state: any) => state.login.demoMode);
  // const userDetails = useSelector((state: any) => state.login.userDetails);

  const doorAccessRecords = useAppSelector(
    state => state.doorAccess.doorAccessRecords,
  ) as TAccessRecord[];
  const demoMode = useAppSelector(state => state.user.demoMode);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.debug('Door access screen back in focus');
      setFocused(true);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.debug('Door access screen blurred');
      setFocused(false);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.sectionContainer}>
      <ScreenTitle title="門禁系統" />
      <View style={styles.sectionContentsContainer}>
        <DoorAccessRecordTable accessRecords={doorAccessRecords} />
        {/*<Text>{JSON.stringify(doorAccessRecords, null, 2)}</Text>*/}
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
    width: '100%',
    height: '100%',
    position: 'relative',
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  legendContainer: {
    height: 80,
  },
  inputPointAndMapContainer: {
    overflow: 'scroll',
  },
});

export default DoorAccessScreen;
