import * as React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableHighlight,
  Modal,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Dialog from 'react-native-dialog';
import { useAppSelector, useAppDispatch } from '../store';
import { useConfirmation } from '../contexts/ConfirmationService';
import {
  updateLocationMask,
  updateRefreshFrequency,
  changeDemoMode,
  changeVideoStream,
  changeSelectedCamera,
  logout,
} from '../features/user/userSlice';
import { clearAcknowledgments } from '../features/event/eventSlice';
import ScreenTitle from '../components/ScreenTitle';
import type { TNavigationProp, TRootStackParamList } from '../resources/types';
import type { NavigationProp } from '@react-navigation/native';
import { useLogger } from '../contexts/CustomLoggerService';
import { maskToLocations } from '../utils/helper';

// type TNavigationProp = NavigationProp<TRootStackParamList, 'Settings'>;

const SettingsScreen = ({ navigation }: { navigation: TNavigationProp }) => {
  const user = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const confirm = useConfirmation();
  const logger = useLogger();
  const [refreshFrequencyDialogOpen, setRefreshFrequencyDialogOpen] =
    React.useState(false);
  const [refreshFrequencyForEdit, setRefreshFrequencyForEdit] =
    React.useState('');
  const [locationMaskDialogOpen, setLocationMaskDialogOpen] =
    React.useState(false);
  const [locationMaskForEdit, setLocationMaskForEdit] = React.useState('');
  const [cctvDialogOpen, setCctvDialogOpen] = React.useState(false);
  const [cctvDelimitedList, setCctvDelimitedList] = React.useState('');

  const handleLogout = () => {
    return confirm({
      variant: 'danger',
      title: '登出',
      description: '是否確認登出？',
      agreeButtonText: '是的，確認登出',
      cancelButtonText: '取消登出',
      catchOnCancel: true,
    })
      .then(() => {
        logger.debug(`logout`);
        dispatch(logout());
      })
      .catch(error => {
        logger.debug(`logout error or canceled`);
        logger.debug(error?.message);
      });
  };

  const handleLocationMaskEdit = () => {
    setLocationMaskForEdit(user.locationMask.toString());
    setLocationMaskDialogOpen(true);
  };

  const handleLocationMaskUpdate = (newLocationMask: string) => {
    setLocationMaskForEdit(newLocationMask.replace(/\D+/g, ''));
  };

  const handleLocationMaskConfirmChange = () => {
    const value = parseInt(locationMaskForEdit, 10);
    logger.debug(`value = ${value}`);
    if (!isNaN(value)) {
      dispatch(updateLocationMask(value));
      setLocationMaskDialogOpen(false);
    }
  };

  const handleLocationMaskDialogClose = () => {
    setLocationMaskDialogOpen(false);
  };

  const handleRefreshFrequencyEdit = () => {
    setRefreshFrequencyForEdit(user.refreshFrequency.toString());
    setRefreshFrequencyDialogOpen(true);
  };

  const handleRefreshFrequencyUpdate = (newRefreshFrequency: string) => {
    setRefreshFrequencyForEdit(newRefreshFrequency.replace(/\D+/g, ''));
  };

  const handleRefreshFrequencyConfirmChange = () => {
    const value = parseInt(refreshFrequencyForEdit, 10);
    logger.debug(`value = ${value}`);
    if (!isNaN(value)) {
      dispatch(updateRefreshFrequency(value));
      setRefreshFrequencyDialogOpen(false);
    }
  };

  const handleRefreshFrequencyDialogClose = () => {
    setRefreshFrequencyDialogOpen(false);
  };

  const handleDemoModeToggle = () => {
    dispatch(changeDemoMode(!user.demoMode));
    if (!user.demoMode) {
      dispatch(clearAcknowledgments());
    }
  };

  const handleVideoStreamToggle = () => {
    dispatch(changeVideoStream(!user.useMainStream));
  };

  const handleCctvEdit = () => {
    setCctvDelimitedList(user.selectedCameras?.join(',') ?? '');
    setCctvDialogOpen(true);
  };

  const handleCctvListEdit = (list: string) => {
    setCctvDelimitedList(list);
  };

  const handleCctvDialogClose = () => {
    setCctvDialogOpen(false);
  };

  const handleCctvConfirmChange = () => {
    dispatch(
      changeSelectedCamera(
        cctvDelimitedList.split(',').map(v => parseInt(v, 10) ?? []),
      ),
    );
    setCctvDialogOpen(false);
  };

  return (
    <View style={styles.sectionContainer}>
      <ScreenTitle title="設定" />
      <View style={styles.contentsContainer}>
        <View>
          <View style={styles.itemContainer}>
            <View style={styles.heading}>
              <Text style={styles.headingText}>帳戶</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.contentText}>{user.username}</Text>
            </View>
          </View>

          {user.adminMode && (
            <View style={styles.itemContainer}>
              <View style={styles.heading}>
                <Text style={styles.headingText}>Location Mask</Text>
              </View>
              <View style={styles.content}>
                <TouchableOpacity
                  onPress={handleLocationMaskEdit}
                  style={{ flex: 1 }}>
                  <Text style={styles.contentText}>{`${user.locationMask
                    } ${JSON.stringify(
                      maskToLocations(user.locationMask),
                    )}`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLocationMaskEdit}
                  style={{
                    marginLeft: 24,
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                  }}>
                  <Icon name={'playlist-edit'} size={24} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.itemContainer}>
            <View style={styles.heading}>
              <Text style={styles.headingText}>更新頻率 (ms)</Text>
            </View>
            <View style={styles.content}>
              <TouchableOpacity
                onPress={handleRefreshFrequencyEdit}
                style={{ flex: 1 }}>
                <Text style={styles.contentText}>{user.refreshFrequency}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRefreshFrequencyEdit}
                style={{
                  marginLeft: 24,
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}>
                <Icon name={'playlist-edit'} size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {user.adminMode && (
            <View style={styles.itemContainer}>
              <View style={styles.heading}>
                <Text style={styles.headingText}>演示模式</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.contentText}>
                  {user.demoMode ? '開啟' : '關閉'}
                </Text>
                <Switch
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={user.demoMode ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={handleDemoModeToggle}
                  value={user.demoMode}
                />
              </View>
            </View>
          )}

          <View style={styles.itemContainer}>
            <View style={styles.heading}>
              <Text style={styles.headingText}>啟動 CCTV 高清影像</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.contentText}>
                {user.useMainStream ? '啟動' : '關閉'}
              </Text>
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={user.useMainStream ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={handleVideoStreamToggle}
                value={user.useMainStream}
              />
            </View>
          </View>
          <View style={styles.itemContainer}>
            <View style={styles.heading}>
              <Text style={styles.headingText}>主畫面監控鏡頭</Text>
            </View>
            <View style={styles.content}>
              <TouchableOpacity onPress={handleCctvEdit} style={{ flex: 1 }}>
                <Text style={styles.contentText}>
                  {user.selectedCameras?.join(',') ?? ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCctvEdit}
                style={{
                  marginLeft: 24,
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}>
                <Icon name={'playlist-edit'} size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableHighlight style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>登出</Text>
        </TouchableHighlight>
        {/*
        <View style={styles.itemContainer}>
          <View style={styles.heading}>
            <Text>主畫面監控鏡頭</Text>
          </View>
          <View style={styles.content}>
            <TouchableOpacity onPress={handleCctvEdit} style={{ flex: 1 }}>
              <Text style={{ flexWrap: 'wrap' }}>{selectedCameras.join(",")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCctvEdit} style={{ marginLeft: 24, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              <Icon
                name={'playlist-edit'}
                size={24}
              />
            </TouchableOpacity>
          </View>
  </View>*/}
      </View>
      <Dialog.Container
        supportedOrientations={['landscape', 'portrait']}
        contentStyle={{ width: 400 }}
        visible={locationMaskDialogOpen}
        onBackdropPress={handleLocationMaskDialogClose}>
        <Dialog.Title>{'修改 Location Mask'}</Dialog.Title>
        <Dialog.Input
          onChangeText={handleLocationMaskUpdate}
          value={locationMaskForEdit}
        />
        <Dialog.Button label={'取消'} onPress={handleLocationMaskDialogClose} />
        <Dialog.Button
          label={'確認'}
          onPress={handleLocationMaskConfirmChange}
        />
      </Dialog.Container>
      <Dialog.Container
        supportedOrientations={['landscape', 'portrait']}
        contentStyle={{ width: 400 }}
        visible={refreshFrequencyDialogOpen}
        onBackdropPress={handleRefreshFrequencyDialogClose}>
        <Dialog.Title>{'修改更新頻率 (ms)'}</Dialog.Title>
        <Dialog.Input
          onChangeText={handleRefreshFrequencyUpdate}
          value={refreshFrequencyForEdit}
        />
        <Dialog.Button
          label={'取消'}
          onPress={handleRefreshFrequencyDialogClose}
        />
        <Dialog.Button
          label={'確認'}
          onPress={handleRefreshFrequencyConfirmChange}
        />
      </Dialog.Container>
      <Dialog.Container
        supportedOrientations={['landscape', 'portrait']}
        contentStyle={{ width: 400 }}
        visible={cctvDialogOpen}
        onBackdropPress={handleCctvDialogClose}
        onRequestClose={handleCctvDialogClose}>
        <Dialog.Title>{'修改監控鏡頭列表'}</Dialog.Title>
        <Dialog.Input
          multiline={true}
          numberOfLines={3}
          onChangeText={handleCctvListEdit}
          value={cctvDelimitedList}
        />
        <Dialog.Button label={'取消'} onPress={handleCctvDialogClose} />
        <Dialog.Button label={'確認'} onPress={handleCctvConfirmChange} />
      </Dialog.Container>
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
  contentsContainer: {
    flex: 1,
    backgroundColor: 'ivory',
    justifyContent: 'space-between',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 55, 20, 0.9)',
    // borderRadius: 15,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: 20
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 3,
    borderBottomColor: 'lightgrey',
    alignItems: 'center',
  },
  heading: {
    flex: 3,
    padding: 10,
    paddingLeft: 30,
    borderRightWidth: 1,
    borderRightColor: 'rgb(200,200,200)',
  },
  headingText: {
    fontFamily: 'AvenirNextCondensed-Bold',
    fontWeight: 'bold',
    fontSize: 20,
  },
  content: {
    flex: 2,
    padding: 10,
    paddingLeft: 24,
    paddingRight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentText: {
    flexWrap: 'wrap',
    fontSize: 20,
  },
});

export default SettingsScreen;
