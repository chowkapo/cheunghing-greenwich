import * as React from 'react';
import {StyleSheet, View, Text, Image, Modal} from 'react-native';
import {Button} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ImageModal = ({
  imageUrl,
  title,
  visible = false,
  onClose,
}: {
  imageUrl?: string | null;
  title?: string;
  visible: boolean;
  onClose: () => void;
}) =>
  visible ? (
    <Modal
      animationType="none"
      supportedOrientations={['landscape', 'portrait']}
      transparent={true}
      visible={true}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
      <View style={styles.curtain}>
        <View style={styles.mapContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeading}>{title ?? ''}</Text>
            <Button
              icon={<MaterialIcons name="cancel" size={25} color="red" />}
              type="clear"
              onPress={onClose}
              buttonStyle={styles.closeButton}
            />
          </View>
          <View style={styles.mapContent}>
            {imageUrl && <Image source={{uri: imageUrl}} style={styles.map} />}
          </View>
        </View>
      </View>
    </Modal>
  ) : null;

export default ImageModal;

const styles = StyleSheet.create({
  curtain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mapContainer: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    height: '90%',
    // padding: 50,
    paddingTop: 0,
    backgroundColor: 'white',
    // shadowOffset: {
    //   width: 0,
    //   height: 0,
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
    paddingLeft: 24,
    paddingRight: 24,
  },
  modalHeading: {
    fontWeight: '600',
    fontSize: 24,
  },
  mapContent: {
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    height: 40,
    marginTop: 10,
    marginBottom: 10,
  },
  map: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
});
