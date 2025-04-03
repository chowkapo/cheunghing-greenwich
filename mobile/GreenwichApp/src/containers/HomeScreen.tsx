import * as React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableHighlight,
  Modal,
  Animated,
  Button,
  Dimensions,
  Alert,
} from 'react-native';
import type {NavigationProp} from '@react-navigation/native';
import ScreenTitle from '../components/ScreenTitle';
import SensorAlertList from '../components/SensorAlertList';
import DashboardAccessRecord from '../components/DashboardAccessRecord';
import sampleEventRecords from '../resources/data/sampleEventRecords.json';
import type {
  TInputPoint,
  TAccessRecord,
  TCctvCameraLocation,
  TEvent,
  TRootStackParamList,
  TNavigationProp,
} from '../resources/types';
import CctvGrid from '../components/CctvGrid';
import {useAppSelector} from '../store';
import cctvData from '../resources/data/cctv-data.json';
import {screensPerRow} from '../resources/config';
import inputPoints from '../resources/data/input-point.json';
import mapData from '../resources/data/map';
import locator from '../resources/images/locator.png';
import ImageMarker, {ImageFormat} from 'react-native-image-marker';
import {locatorAdjustment} from '../resources/config';
import ImageModal from '../components/ImageModal';

const windowHeight = Dimensions.get('window').height;
const reSuffix = new RegExp(/^\s*(.*?)\s*(\S+)\s*$/);

// type TNavigationProp = NavigationProp<TRootStackParamList, 'Home'>;

const HomeScreen = ({navigation}: {navigation: TNavigationProp}) => {
  const [loading, setLoading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [map, setMap] = React.useState<{
    name: string;
    src: string;
    width?: number;
    height?: number;
    x: number;
    y: number;
  } | null>(null);
  const doorAccessRecords =
    useAppSelector(state => state.doorAccess?.doorAccessRecords) ??
    ([] as TAccessRecord[]);
  const events =
    useAppSelector(state => state.event?.events) ?? ([] as TEvent[]);
  const [cctvCameraLocationList, setCctvCameraLocationList] = React.useState<
    TCctvCameraLocation[]
  >([]);
  const useMainStream =
    useAppSelector(state => state.user?.useMainStream) ?? false;
  const cctvSelectedList =
    useAppSelector(state => state.user?.selectedCameras) ?? [];
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    setCctvCameraLocationList(cctvData as TCctvCameraLocation[]);
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setFocused(true);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setFocused(false);
    });
    return unsubscribe;
  }, [navigation]);

  const inputPointViewHandler = React.useCallback(
    (id: number) => {
      const inputPointPressed = inputPoints.find(
        (v: TInputPoint) => v.id === id,
      );
      if (inputPointPressed && !loading) {
        const targetMap = mapData.find(v => v.id === inputPointPressed.mapId);
        const match = reSuffix.exec(inputPointPressed.name);
        const canonicalName = (match && match[1])?.replace(/\s+/, ' ');
        const mapInfo = {
          name: `${canonicalName} @ ${targetMap?.name ?? '-'}`,
          src: targetMap?.map ?? '',
          width: targetMap?.map_width,
          height: targetMap?.map_height,
          x: inputPointPressed.x,
          y: inputPointPressed.y,
        };
        setMap(mapInfo);
      }
    },
    [loading],
  );

  React.useEffect(() => {
    if (!map || !map.src) {
      return;
    }

    setLoading(true);
    try {
      ImageMarker.markImage({
        backgroundImage: {
          src: map.src,
          scale: 1,
        },
        watermarkImages: [
          {
            src: locator,
            scale: 1,
            position: {
              X:
                map.x - locatorAdjustment.x < 0
                  ? 0
                  : map.x - locatorAdjustment.x, // left
              Y:
                map.y - locatorAdjustment.y < 0
                  ? 0
                  : map.y - locatorAdjustment.y, // top
            },
          },
        ],
        quality: 100, // quality of image
        saveFormat: ImageFormat.png,
      })
        .then(res => {
          setImageUrl(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      console.error(err);
    }
  }, [map]);

  return (
    <View style={styles.sectionContainer}>
      <ScreenTitle title="主畫面" />
      <View style={styles.cctvAccessContainer}>
        <View style={styles.cctvContainer}>
          {focused && (
            <CctvGrid
              useMainStream={useMainStream}
              screensPerRow={screensPerRow}
              cctvCameraLocationList={cctvCameraLocationList}
              cctvSelectedList={cctvSelectedList}
            />
          )}
        </View>
        <View style={styles.accessContainer}>
          <DashboardAccessRecord accessRecords={doorAccessRecords} />
        </View>
      </View>
      <SensorAlertList
        maxHeight={windowHeight / 3}
        minHeight={windowHeight / 4}
        events={events}
        onInputPointView={inputPointViewHandler}
      />
      {map && map.src && !loading && (
        <ImageModal
          imageUrl={imageUrl ?? ''}
          visible={!!(map && map.src && !loading)}
          title={map.name}
          onClose={() => setMap(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fadingContainer: {
    padding: 20,
    backgroundColor: 'powderblue',
    position: 'absolute',
  },
  fadingText: {
    fontSize: 28,
  },
  buttonRow: {
    flexBasis: 100,
    justifyContent: 'space-evenly',
    marginVertical: 16,
  },
  cctvAccessContainer: {
    flexGrow: 1,
    backgroundColor: 'ivory',
    flexDirection: 'row',
  },
  cctvContainer: {
    flex: 7,
    backgroundColor: 'lightgrey',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  accessContainer: {
    flex: 2,
    // backgroundColor: 'lightgreen',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default HomeScreen;
