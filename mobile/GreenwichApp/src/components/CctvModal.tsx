import React from 'react';
import { StyleSheet, View, Text, Modal, ImageBackground, Animated } from 'react-native';
import { Button } from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { VLCPlayer } from 'react-native-vlc-media-player';
import loadingImage from '../resources/images/loading.gif';
import { vlcPlayerInitOptions } from '../resources/config';

const CctvModal = ({
  cctvUrl,
  cctvId,
  title,
  visible = false,
  onClose,
}: {
  visible?: boolean;
  cctvUrl: string;
  cctvId: number;
  title: string;
  onClose: () => void;
}) => {
  const [loading, setLoading] = React.useState(true);
  const fadeAnim = React.useState(new Animated.Value(1))[0]; // start fully visible
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      fadeAnim.stopAnimation();
    };
  }, [fadeAnim]);

  const hideLoader = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 3000, // fade-out duration
      useNativeDriver: true,
    }).start((finished) => {
      if (finished && isMounted.current) {
        setLoading(false);
      }
    });
  };

  return (
    <Modal
      animationType="none"
      supportedOrientations={['landscape', 'portrait']}
      transparent={true}
      visible={visible}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.curtain}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <View style={styles.cctvHeader}>
                <MaterialCommunityIcons name="cctv" size={22} color="black" />
                <Text style={styles.cctvNumber}>{`[${cctvId}]`}</Text>
              </View>
              <Text style={styles.modalHeading}>{title}</Text>
            </View>
            <Button
              icon={<MaterialIcons name="cancel" size={25} color="red" />}
              type="clear"
              onPress={onClose}
              buttonStyle={styles.closeButton}
            />
          </View>

          <View style={styles.cctvContainer}>
            <VLCPlayer
              style={styles.backgroundVideo}
              autoAspectRatio={true}
              muted={true}
              source={{
                uri: cctvUrl,
                initOptions: vlcPlayerInitOptions,
              }}
              onPlaying={() => {
                console.debug('video stream onPlaying');
                hideLoader();
              }}
              onOpen={() => {
                console.debug('video stream onOpen');
              }}
              onLoadStart={() => {
                console.debug('video streaming onLoadStart');
              }}
              onBuffering={() => {
                console.debug('video stream onBuffering');
              }}
              onProgress={({ position }) => {
                console.debug(`video stream onProgress`);
                console.debug(`position = ${position}`);
              }}
            />

            {loading && (
              <Animated.View
                style={[
                  styles.loadingOverlay,
                  { opacity: fadeAnim },
                ]}
              >
                <ImageBackground
                  source={loadingImage}
                  resizeMode="contain"
                  style={styles.loadingImage}
                />
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  curtain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '90%',
    height: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'lightgrey',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cctvHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cctvNumber: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 16,
  },
  modalHeading: {
    fontWeight: '600',
    fontSize: 24,
  },
  cctvContainer: {
    flex: 1,
    backgroundColor: 'lightgrey',
    position: 'relative', // so overlay is positioned relative to this
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // could also use 'rgba(255,255,255,0.8)'
  },
  loadingImage: {
    width: 100,
    height: 100,
  },
  closeButton: {
    height: 40,
    marginVertical: 10,
  },
});

export default CctvModal;
