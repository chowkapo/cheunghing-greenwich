import * as React from 'react';
import SensorAlertList from './SensorAlertList';
import {TEvent, TInputPoint} from '../resources/types';
import inputPoints from '../resources/data/input-point.json';
import mapData from '../resources/data/map';
import ImageModal from './ImageModal';
import locator from '../resources/images/locator.png';
import ImageMarker, {ImageFormat} from 'react-native-image-marker';
import {locatorAdjustment} from '../resources/config';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {Button} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const reSuffix = new RegExp(/^\s*(.*?)\s*(\S+)\s*$/);

const EventAlert = ({
  title,
  maxHeight,
  onDismissAlerts,
  alerts,
}: {
  title: string;
  maxHeight: number;
  alerts: TEvent[];
  onDismissAlerts: () => void;
}) => {
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
          src: targetMap?.map,
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
    <Modal
      animationType="none"
      supportedOrientations={['landscape', 'portrait']}
      transparent={true}
      visible={true}
      presentationStyle="overFullScreen"
      onRequestClose={onDismissAlerts}>
      <View style={styles.curtain}>
        <View style={[styles.mapContainer, {minHeight: 480, maxHeight}]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeading}>{title ?? ''}</Text>
            <Button
              icon={<MaterialIcons name="cancel" size={25} color="blue" />}
              type="clear"
              onPress={onDismissAlerts}
              buttonStyle={styles.closeButton}
            />
          </View>
          <View style={styles.mapContent}>
            <SensorAlertList
              events={alerts}
              minHeight={240}
              maxHeight={maxHeight > 360 ? maxHeight - 100 : maxHeight}
              onInputPointView={inputPointViewHandler}
              popUp={true}
            />
          </View>
          {map && map.src && !loading && (
            <ImageModal
              imageUrl={imageUrl ?? ''}
              visible={!!(map && map.src && !loading)}
              title={map.name}
              onClose={() => setMap(null)}
            />
          )}
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
  mapContainer: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    // height: '90%',
    // padding: 50,
    paddingTop: 0,
    backgroundColor: 'white',
    // shadowOffset: {
    //   width: 0,
    //   height: 0,
    // },
    // shadowColor: 'blue',
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
    flex: 1,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'yellow'
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

export default EventAlert;
