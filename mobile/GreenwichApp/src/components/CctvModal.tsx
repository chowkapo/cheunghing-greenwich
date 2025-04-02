import React from 'react';
import {StyleSheet, View, Text, Modal, ImageBackground} from 'react-native';
import {Button} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {VLCPlayer} from 'react-native-vlc-media-player';
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
  return (
    <Modal
      animationType="none"
      supportedOrientations={['landscape', 'portrait']}
      transparent={true}
      visible={visible}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
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
              icon={<MaterialIcons name="cancel" size={25} color="blue" />}
              type="clear"
              onPress={onClose}
              buttonStyle={styles.closeButton}
            />
          </View>

          <View style={styles.cctvContainer}>
            <ImageBackground
              source={loadingImage}
              resizeMode="center"
              style={styles.playerBackgroundImage}>
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
                onProgress={({position}) => {
                  console.debug(`video stream onProgress`);
                  console.debug(`position = ${position}`);
                }}
              />
            </ImageBackground>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CctvModal;

const styles = StyleSheet.create({
  curtain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    height: '90%',
    paddingTop: 0,
    backgroundColor: 'white',
    // shadowOffset: {
    //   width: 0,
    //   height: 0
    // },
    // shadowOpacity: 0.7,
    // shadowRadius: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'lightgrey',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 24,
    paddingRight: 24,
  },
  cctvHeader: {
    display: 'flex',
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
    position: 'relative',
  },
  playerBackgroundImage: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  closeButton: {
    height: 40,
    marginTop: 10,
    marginBottom: 10,
  },
});
