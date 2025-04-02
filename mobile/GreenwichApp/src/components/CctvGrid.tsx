import * as React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {TCctvCameraLocation} from '../resources/types';
import {VLCPlayer} from 'react-native-vlc-media-player';
import loadingImage from '../resources/images/loading.gif';
import loadingImageSmall from '../resources/images/loading_small.gif';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {vlcPlayerInitOptions} from '../resources/config';

const CctvGrid = ({
  useMainStream,
  screensPerRow,
  cctvCameraLocationList,
  cctvSelectedList,
}: {
  useMainStream: boolean;
  screensPerRow: number;
  cctvCameraLocationList: TCctvCameraLocation[];
  cctvSelectedList: number[];
}) => {
  const [focusedCamera, setFocusedCamera] = React.useState<number | null>(null);
  const [errorCount, setErrorCount] = React.useState(0);

  return (
    <View style={styles.cctvAccessContainer}>
      {focusedCamera !== null && (
        <View style={styles.cctvContainer}>
          <View style={styles.focusedCameraContainer}>
            <View style={styles.focusedCameraTitleContainer}>
              <TouchableOpacity onPress={() => setFocusedCamera(null)}>
                <MaterialIcons name="arrow-back-ios" size={25} color="black" />
              </TouchableOpacity>
              <View>
                <View style={styles.cctvHeader}>
                  <MaterialCommunityIcons name="cctv" size={22} color="black" />
                  <Text style={styles.cctvNumber}>{`[${focusedCamera}]`}</Text>
                </View>
                <Text style={styles.cctvName}>
                  {
                    cctvCameraLocationList.find(
                      v => v.cameraId === focusedCamera,
                    )?.cameraName
                  }
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={{
                flex: 1,
              }}
              onPress={() => setFocusedCamera(null)}>
              <ImageBackground
                source={loadingImage}
                resizeMode="center"
                style={styles.playerBackgroundImage}>
                <VLCPlayer
                  style={styles.backgroundVideo}
                  muted={true}
                  autoAspectRatio={true}
                  source={{
                    uri: useMainStream
                      ? cctvCameraLocationList.find(
                          v => v.cameraId === focusedCamera,
                        )?.mainStream
                      : cctvCameraLocationList.find(
                          v => v.cameraId === focusedCamera,
                        )?.subStream,
                    initOptions: vlcPlayerInitOptions,
                  }}
                  onError={(error: any) => {
                    setErrorCount(value => value + 1);
                    console.debug(error);
                  }}
                />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {focusedCamera === null && (
        <View
          style={[
            styles.cctvContainer,
            focusedCamera !== null && {display: 'none'},
          ]}>
          {Array.from(
            Array(
              Math.floor((cctvSelectedList.length - 1) / screensPerRow) + 1,
            ).keys(),
          ).map(rowIndex => (
            <View
              key={rowIndex}
              style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
              {Array.from(Array(screensPerRow).keys()).map(colIndex => {
                const cctvIndex = rowIndex * screensPerRow + colIndex;
                const camera = cctvCameraLocationList.find(
                  v => v.cameraId === cctvSelectedList[cctvIndex],
                );
                const videoUrl = useMainStream
                  ? camera?.mainStream
                  : camera?.subStream;
                return videoUrl ? (
                  <TouchableOpacity
                    key={`${cctvIndex}-${errorCount}`}
                    style={{
                      flex: 1,
                      position: 'relative',
                      borderColor: 'black',
                      borderWidth: 2,
                      borderStyle: 'solid',
                    }}
                    onPress={() =>
                      setFocusedCamera(cctvSelectedList[cctvIndex])
                    }>
                    <ImageBackground
                      source={loadingImageSmall}
                      resizeMode="contain"
                      style={styles.gridPlayerBackgroundImage}>
                      <VLCPlayer
                        style={styles.backgroundVideo}
                        muted={true}
                        autoAspectRatio={true}
                        source={{
                          uri: videoUrl,
                          initOptions: vlcPlayerInitOptions,
                        }}
                      />
                    </ImageBackground>
                  </TouchableOpacity>
                ) : (
                  <View
                    key={`${cctvIndex}-${errorCount}`}
                    style={[
                      styles.backgroundVideo,
                      {
                        flex: 1,
                        position: 'relative',
                        backgroundColor: 'black',
                      },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  gridPlayerBackgroundImage: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ccc',
    position: 'relative',
  },
  playerBackgroundImage: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    position: 'relative',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  focusedCameraContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  focusedCameraTitleContainer: {
    // backgroundColor: 'yellow',
    height: 50,
    paddingLeft: 20,
    paddingRight: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cctvHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cctvNumber: {
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 16,
  },
  cctvName: {
    fontWeight: '600',
    fontSize: 18,
  },
});

export default CctvGrid;
