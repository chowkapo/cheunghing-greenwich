import * as React from 'react';
import {StyleSheet, View} from 'react-native';
import {ButtonGroup} from 'react-native-elements';
import {TCctvFloor, TCctvFloorGroup} from '../resources/types';

const extractLabels = ({
  data,
  selectedChain,
}: {
  data?: (TCctvFloor | TCctvFloorGroup)[];
  selectedChain: number[];
}): string[] => {
  if (!data) {
    return [];
  }
  if (selectedChain.length < 1) {
    return data.map(v => v.label);
  }
  const item = data[selectedChain[0]];
  if (item && (item as TCctvFloorGroup).floors) {
    return extractLabels({
      data: (item as TCctvFloorGroup).floors,
      selectedChain: selectedChain.slice(1),
    });
  } else {
    return [item.label];
  }
};

const isFloorGroupSelected = ({
  data,
  selectedChain,
}: {
  data?: (TCctvFloor | TCctvFloorGroup)[];
  selectedChain: number[];
}): boolean => {
  if (!data) {
    return false;
  }
  const item = data[selectedChain[0]];
  if (item && (item as TCctvFloorGroup).floors) {
    if (selectedChain.length === 1) {
      return true;
    } else {
      return isFloorGroupSelected({
        data: (item as TCctvFloorGroup).floors,
        selectedChain: selectedChain.slice(1),
      });
    }
  } else {
    return false;
  }
};

const CctvMenu = ({
  cctvMenuData,
  onUpdate,
  selectedChain,
}: {
  cctvMenuData: TCctvFloorGroup[];
  onUpdate: (selected: number[]) => void;
  selectedChain: number[];
}) => {
  React.useEffect(() => {
    console.debug(`selectedChain=${JSON.stringify(selectedChain, null, 2)}`);
  }, [selectedChain]);

  const updateButtonGroupSelection = ({
    tier,
    selectedIndex,
  }: {
    tier: number;
    selectedIndex: number;
  }) => {
    let newSelectedChain = [...selectedChain];
    newSelectedChain[tier] = selectedIndex;
    newSelectedChain = newSelectedChain.slice(0, tier + 1);
    onUpdate(newSelectedChain);
  };

  const floorGroupSelected = React.useMemo(() => {
    return isFloorGroupSelected({
      data: cctvMenuData,
      selectedChain,
    });
  }, [cctvMenuData, selectedChain]);

  return (
    <View style={styles.root}>
      {selectedChain.map((thisSelected, tierIndex) => {
        console.debug(
          `tierIndex=${tierIndex},thisSelected=${JSON.stringify(
            thisSelected,
            null,
            2,
          )}`,
        );
        return (
          <ButtonGroup
            key={tierIndex}
            onPress={selectedIndex => {
              updateButtonGroupSelection({
                tier: tierIndex,
                selectedIndex,
              });
            }}
            selectedIndex={thisSelected}
            buttons={extractLabels({
              data: cctvMenuData,
              selectedChain: selectedChain.slice(0, tierIndex),
            })}
            containerStyle={[styles.buttonGroup, !tierIndex && styles.tier]}
            textStyle={styles.buttonGroupText}
          />
        );
      })}
      {(floorGroupSelected || !selectedChain.length) && (
        <ButtonGroup
          onPress={selectedIndex => {
            updateButtonGroupSelection({
              tier: selectedChain.length,
              selectedIndex,
            });
          }}
          selectedIndex={-1}
          buttons={extractLabels({
            data: cctvMenuData,
            selectedChain: selectedChain.slice(0, selectedChain.length),
          })}
          containerStyle={[
            styles.buttonGroup,
            selectedChain.length === 0 && styles.tier,
          ]}
          textStyle={styles.buttonGroupText}
        />
      )}
    </View>
  );
};

export default CctvMenu;

const styles = StyleSheet.create({
  root: {
    paddingBottom: 4,
  },
  buttonGroup: {
    marginTop: 0,
    marginBottom: 2,
    height: 30,
    width: '90%',
  },
  tier: {
    marginTop: 4,
  },
  buttonGroupText: {
    fontFamily: 'AvenirNextCondensed-Bold',
  },
});
