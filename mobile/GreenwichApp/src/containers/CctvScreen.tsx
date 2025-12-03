import * as React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
// import ImageZoom from 'react-native-image-pan-zoom-fix';
import cctvImage from '../resources/images/cctv.png';
import cctvDisabledImage from '../resources/images/cctv_disabled.png';
import CctvModal from '../components/CctvModal';
import cctvMapData from '../resources/data/cctv-map-data';
import cctvData from '../resources/data/cctv-data.json';
import cctvMenu from '../resources/data/cctv-menu.json';
import {
  TCctvCameraLocation,
  TCctvFloor,
  TCctvFloorGroup,
  TNavigationProp,
} from '../resources/types';
import ScreenTitle from '../components/ScreenTitle';
import { useAppSelector } from '../store';
import CctvMenu from '../components/CctvMenu';
import {
  getCctvCameraList,
  getTargetMap,
  maskToLocations,
} from '../utils/helper';
import { ReactNativeZoomableView, ZoomableViewEvent } from '@openspacelabs/react-native-zoomable-view';

const cctvMultiLevelMenus: TCctvFloorGroup[] = cctvMenu;

const defaultImageScale = 1;

interface IOnMove {
  positionX: number;
  positionY: number;
  scale: number;
}

const CctvScreen = ({ navigation }: { navigation: TNavigationProp }) => {
  const zoomableViewRef = React.createRef<ReactNativeZoomableView>();
  const [cctvCameraLocationList, setCctvCameraLocationList] = React.useState<
    TCctvCameraLocation[]
  >([]);
  const useMainStream = useAppSelector(state => state.user?.useMainStream);
  const locationMask = useAppSelector(state => state.user?.locationMask);
  const [imageUrl, setImageUrl] = React.useState(null);
  const [selectedChain, setSelectedChain] = React.useState<number[]>([]);
  const [selectedChainLabels, setSelectedChainLabels] = React.useState<
    string[]
  >([]);
  const [mapContainerWidth, setMapContainerWidth] = React.useState(800);
  const [mapContainerHeight, setMapContainerHeight] = React.useState(600);
  const [initialImageSize, setInitialImageSize] = React.useState<{
    width: number;
    height: number;
  }>({ width: 800, height: 600 });
  const [initialImageScale, setInitialImageScale] = React.useState(defaultImageScale);
  const [initialOrigin, setInitialOrigin] = React.useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const [mapDimensionsObtained, setMapDimensionsObtained] =
    React.useState(false);
  const [imageSize, setImageSize] = React.useState<{
    width: number;
    height: number;
  }>({
    width: 800,
    height: 600,
  });
  const [onMoveResult, setOnMoveResult] = React.useState<IOnMove | null>(null);
  const [selectedCctv, setSelectedCctv] =
    React.useState<TCctvCameraLocation | null>(null);
  const [focused, setFocused] = React.useState(false);
  const [selectedMapId, setSelectedMapId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCctvCameraLocationList(cctvData as TCctvCameraLocation[]);
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.debug('CCTV screen back in focus');
      setFocused(true);
      setSelectedChain([]);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.debug('CCTV screen blurred');
      setFocused(false);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    if (!focused) {
      console.debug('CCTV blurred, clear selected CCTV');
      setSelectedCctv(null);
      setSelectedMapId(null);
    }
  }, [focused]);

  const updateSelectedChain = (selected: number[]) => {
    setSelectedChain(selected);
    const newSelectedChainLabels: string[] = [];
    let currentLevel = cctvMultiLevelMenus;
    selected.forEach(selectedItem => {
      newSelectedChainLabels.push(currentLevel[selectedItem].label);
      setSelectedMapId(
        (currentLevel[selectedItem] as TCctvFloor).mapid ?? null,
      );
      currentLevel =
        (currentLevel[selectedItem] as TCctvFloorGroup).floors ?? [];
    });
    setSelectedChainLabels(newSelectedChainLabels);
  };

  const selectedMap = React.useMemo(() => {
    setInitialImageScale(defaultImageScale);
    setInitialOrigin({ x: 0, y: 0 });
    setOnMoveResult(null);
    setMapDimensionsObtained(false);
    const newSelectedMap = getTargetMap({
      cctvMultiLevelMenus,
      selected: selectedChain,
    });
    return newSelectedMap;
  }, [selectedChain]);

  const cctvMapImageData = React.useMemo(() => {
    const newCctvMapImageData = selectedMapId && cctvMapData[selectedMapId];
    console.debug(`selectedMapId updated: ${selectedMapId}, new map image data: ${JSON.stringify(newCctvMapImageData)}`);
    return newCctvMapImageData;
  }, [selectedMapId]);

  React.useEffect(() => {
    if (!cctvMapImageData || !cctvMapImageData.src) {
      setImageUrl(null);
      setMapDimensionsObtained(false);
      return;
    }
    setImageUrl(cctvMapImageData.src);
    setImageSize({
      width: cctvMapImageData.width,
      height: cctvMapImageData.height,
    });
    console.debug(`cctvMapImageData updated: imageSize=${JSON.stringify({
      width: cctvMapImageData.width,
      height: cctvMapImageData.height,
    })}`);
  }, [cctvMapImageData]);

  const cameraUrl = React.useMemo(() => {
    if (!selectedCctv || !selectedCctv.cameraId) {
      return null;
    }
    const cameraData = cctvData?.find(
      v => v.cameraId === selectedCctv?.cameraId,
    );
    const { mainStream, subStream } = cameraData ?? {};
    console.debug(`mainStream=${mainStream}, subStream=${subStream}`);
    if (mainStream || subStream) {
      console.debug(`cameraUrl=${useMainStream ? mainStream : subStream}`);
      return useMainStream ? mainStream : subStream;
    } else {
      return null;
    }
  }, [selectedCctv, useMainStream]);

  const filteredList = React.useMemo(() => {
    console.debug(`selectedChainLabels=${JSON.stringify(selectedChainLabels)}`);
    const list = getCctvCameraList({
      cctvCameraLocationList,
      mapId: selectedMap?.mapid ?? '',
      chainLabels: selectedChainLabels,
      locations: maskToLocations(locationMask),
    });
    return list;
  }, [cctvCameraLocationList, locationMask, selectedChainLabels, selectedMap]);

  const setUpScale = React.useCallback((viewWidth: number, viewHeight: number) => {
    console.debug(`setUpScale: viewWidth=${viewWidth}, viewHeight=${viewHeight}, cctvMapImageData=${JSON.stringify(cctvMapImageData)}`);
    if (cctvMapImageData) {
      const hScale = viewWidth / cctvMapImageData.width;
      const vScale = viewHeight / cctvMapImageData.height;
      const scaleFactor = Math.min(hScale, vScale);
      // console.debug(`imageSize=${JSON.stringify(imageSize)}`);
      console.debug(`hScale=${hScale}, vScale=${vScale}`);
      console.debug(`scaleFactor=${scaleFactor}`);
      setInitialImageScale(scaleFactor);
      setInitialImageSize({
        width: cctvMapImageData.width * scaleFactor,
        height: cctvMapImageData.height * scaleFactor,
      });
      if (hScale > vScale) {
        // North and South touching boundary
        const origin = {
          x: (viewWidth - cctvMapImageData.width * scaleFactor) / 2,
          y: 0,
        };
        console.debug(`origin=${JSON.stringify(origin)}`);
        setInitialOrigin(origin);
      } else {
        // West and East touching boundary
        const origin = {
          x: 0,
          y: (viewHeight - cctvMapImageData.height * scaleFactor) / 2,
        };
        console.debug(`origin=${JSON.stringify(origin)}`);
        setInitialOrigin(origin);
      }
    }
  }, [cctvMapImageData]);

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleTransform = React.useCallback((event: ZoomableViewEvent) => {
    console.debug(`onTransform: ${JSON.stringify(event)}, initialOrigin: ${JSON.stringify(initialOrigin)}, initialImageScale: ${initialImageScale}, imageSize: ${JSON.stringify(imageSize)}`);
    const { zoomLevel, offsetX, offsetY } = event;
    setOnMoveResult({
      scale: zoomLevel,
      positionX: offsetX,
      positionY: offsetY,
    });
    const newWidth = imageSize.width * initialImageScale * zoomLevel;
    const newHeight = imageSize.height * initialImageScale * zoomLevel;
    const x = (mapContainerWidth - newWidth) / 2 / zoomLevel;
    const y = (mapContainerHeight - newHeight) / 2 / zoomLevel;
    const newOrigin = {
      x: x + offsetX,
      y: y + offsetY,
    };
    console.debug(`onMove: newOrigin=${JSON.stringify(newOrigin)}`);
    setInitialOrigin(newOrigin);
  }, [initialOrigin, initialImageScale, imageSize, mapContainerWidth, mapContainerHeight]);

  const onTransform = React.useMemo(
    () => debounce(handleTransform, 5),
    [handleTransform]
  );

  return (
    <View style={styles.sectionContainer}>
      <ScreenTitle title="閉路電視" />
      <View style={styles.sectionContentsContainer}>
        <CctvMenu
          cctvMenuData={cctvMultiLevelMenus}
          onUpdate={updateSelectedChain}
          selectedChain={selectedChain}
        />
        {cctvMapImageData && focused && (
          // eslint-disable-next-line react-native/no-inline-styles
          <View style={{ padding: 20, width: '100%', flex: 1 }}>
            <View
              key={`${JSON.stringify(selectedChain)}`}
              style={styles.MapCCTVLocationContainer}
              onLayout={event => {
                const { width, height } = event.nativeEvent.layout;
                console.debug(`onLayout event: width=${width}, height=${height}`);
                // const adjustedHeight = height > 30 ? height - 30 : height
                // const adjustedHeight = height;
                if (width && height && !mapDimensionsObtained) {
                  setMapContainerWidth(width);
                  // setMapContainerHeight(adjustedHeight);
                  setMapContainerHeight(height);
                  setMapDimensionsObtained(true);
                  setUpScale(width, height);
                  // const hScale = width / imageSize.width;
                  // const vScale = adjustedHeight / imageSize.height;
                  // const scaleFactor = Math.min(hScale, vScale);
                  // console.debug(`imageSize=${JSON.stringify(imageSize)}`);
                  // console.debug(`hScale=${hScale}, vScale=${vScale}`);
                  // console.debug(`scaleFactor=${scaleFactor}`);
                  // setInitialImageScale(scaleFactor);
                  // setInitialImageSize({
                  //   width: imageSize.width * scaleFactor,
                  //   height: imageSize.height * scaleFactor,
                  // });
                  // if (hScale > vScale) {
                  //   // North and South touching boundary
                  //   const origin = {
                  //     x: (width - imageSize.width * scaleFactor) / 2,
                  //     y: 0,
                  //   };
                  //   console.debug(`origin=${JSON.stringify(origin)}`);
                  //   setInitialOrigin(origin);
                  // } else {
                  //   // West and East touching boundary
                  //   const origin = {
                  //     x: 0,
                  //     y: (adjustedHeight - imageSize.height * scaleFactor) / 2,
                  //   };
                  //   console.debug(`origin=${JSON.stringify(origin)}`);
                  //   setInitialOrigin(origin);
                  // }
                } else {
                  setInitialImageScale(defaultImageScale);
                  setInitialOrigin({ x: 0, y: 0 });
                  setOnMoveResult(null);
                }
              }}>
              {imageUrl && (
                <ReactNativeZoomableView
                  ref={zoomableViewRef}
                  contentWidth={mapContainerWidth}
                  contentHeight={mapContainerHeight}
                  onTransform={onTransform}
                  // imageWidth={initialImageSize.width}
                  // imageHeight={initialImageSize.height}
                  // onMove={moveResult => {
                  //   console.debug(`onMove: ${JSON.stringify(moveResult)}`);
                  //   if (moveResult) {
                  //     setOnMoveResult(moveResult);
                  //     const newWidth =
                  //       imageSize.width * initialImageScale * moveResult.scale;
                  //     const newHeight =
                  //       imageSize.height * initialImageScale * moveResult.scale;
                  //     const x = (mapContainerWidth - newWidth) / 2 / moveResult.scale;
                  //     const y = (mapContainerHeight - newHeight) / 2 / moveResult.scale;
                  //     const newOrigin = {
                  //       x: x + moveResult.positionX,
                  //       y: y + moveResult.positionY,
                  //     };
                  //     console.debug(`onMove: newOrigin=${JSON.stringify(newOrigin)}`);
                  //     setInitialOrigin(newOrigin);
                  //   }
                  // }}
                  minZoom={0.5}
                  initialZoom={initialImageScale}
                  maxZoom={5}
                  bindToBorders={true}
                >
                  <Image
                    style={{
                      width: initialImageSize.width,
                      height: initialImageSize.height,
                    }}
                    source={imageUrl}
                  />
                </ReactNativeZoomableView>
              )}
              {imageUrl &&
                selectedMap &&
                filteredList.map((cctv, index) =>
                  cctv.enabled ? (
                    <TouchableOpacity
                      key={`${cctv.cameraId}-${index}`}
                      onPress={() => {
                        console.debug(
                          `eanbled: ${cctv.enabled
                          }, cctv clicked: ${JSON.stringify(cctv)}`,
                        );
                        cctv.enabled && setSelectedCctv(cctv);
                      }}
                      // eslint-disable-next-line react-native/no-inline-styles
                      style={{
                        top:
                          (cctv.y * initialImageScale + initialOrigin.y - 6) *
                          (onMoveResult?.scale ?? 1),
                        left:
                          (cctv.x * initialImageScale + initialOrigin.x - 6) *
                          (onMoveResult?.scale ?? 1),
                        position: 'absolute',
                      }}>
                      <Image
                        source={cctvImage}
                        style={[
                          styles.cctv,
                          {
                            width: 12 * (onMoveResult?.scale ?? 1),
                            height: 12 * (onMoveResult?.scale ?? 1),
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  ) : (
                    <Image
                      key={`${cctv.cameraId}-${index}`}
                      source={cctvDisabledImage}
                      style={[
                        styles.cctv,
                        {
                          top:
                            (cctv.y * initialImageScale + initialOrigin.y - 6) *
                            (onMoveResult?.scale ?? 1),
                          left:
                            (cctv.x * initialImageScale + initialOrigin.x - 6) *
                            (onMoveResult?.scale ?? 1),
                          position: 'absolute',
                          width: 12 * (onMoveResult?.scale ?? 1),
                          height: 12 * (onMoveResult?.scale ?? 1),
                        },
                      ]}
                    />
                  ),
                )}
            </View>
          </View>
        )}
      </View>
      {selectedCctv && focused && (
        <CctvModal
          visible={!!selectedCctv}
          cctvUrl={cameraUrl ?? ''}
          cctvId={selectedCctv.cameraId}
          title={`${selectedCctv.cameraName ?? selectedCctv.location ?? ''}`}
          onClose={() => setSelectedCctv(null)}
        />
      )}
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
  MapCCTVLocationContainer: {
    width: '100%',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  cctv: {
    width: 20,
    height: 20,
  },
});

export default CctvScreen;
