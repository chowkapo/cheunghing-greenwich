import * as React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {ButtonGroup} from 'react-native-elements';
import {partialSort, orderTier1, orderTier2} from '../utils/helper';

const TypeHierarchicalMenu = ({hierarchy, onUpdate, selectedChain}: any) => {
  const allowed = React.useMemo(
    () => Object.keys(hierarchy).length > 0,
    [hierarchy],
  );

  const updateButtonGroupSelection = ({tier, selectedIndex}: any) => {
    let newSelectedChain = [...selectedChain];
    newSelectedChain[tier] = selectedIndex;
    newSelectedChain = newSelectedChain.slice(0, tier + 1);
    onUpdate(newSelectedChain);
  };

  const tier1 = React.useMemo(() => {
    const tier1Items = partialSort(Object.keys(hierarchy), orderTier1);
    // console.log(`tier1Items=${JSON.stringify(tier1Items)}`);
    return tier1Items;
  }, [hierarchy]);

  React.useEffect(() => {
    if (tier1.length === 1 && selectedChain.length === 0) {
      onUpdate([0]);
    }
  }, [tier1, selectedChain, onUpdate]);

  const tier2 = React.useMemo(() => {
    const raw =
      typeof selectedChain[0] !== 'undefined' &&
      typeof hierarchy[tier1[selectedChain[0]]] === 'object' &&
      !(hierarchy[tier1[selectedChain[0]]] instanceof Array) &&
      Object.keys(hierarchy[tier1[selectedChain[0]]]);
    // console.log(`tier2 raw menu = ${JSON.stringify(raw)}`);
    return partialSort(raw, orderTier2);
  }, [hierarchy, selectedChain, tier1]);

  if (!allowed) {
    return (
      <View style={styles.root}>
        <View style={styles.emptyNoteContainer}>
          <Text>請登入其他帳戶瀏覽此監察系統</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ButtonGroup
        onPress={(selectedIndex: number) => {
          updateButtonGroupSelection({
            tier: 0,
            selectedIndex,
          });
        }}
        selectedIndex={selectedChain[0]}
        buttons={tier1}
        containerStyle={[styles.buttonGroup, styles.tier1]}
        textStyle={styles.buttonGroupText}
      />
      {!!tier2 && tier2.filter((v: string) => v).length > 0 && (
        <ButtonGroup
          onPress={(selectedIndex: number) => {
            updateButtonGroupSelection({
              tier: 1,
              selectedIndex,
            });
          }}
          selectedIndex={selectedChain[1]}
          buttons={tier2}
          containerStyle={styles.buttonGroup}
          textStyle={styles.buttonGroupText}
        />
      )}
    </View>
  );
};

export default TypeHierarchicalMenu;

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
  tier1: {
    marginTop: 4,
  },
  buttonGroupText: {
    fontFamily: 'AvenirNextCondensed-Bold',
    // fontSize: 6
  },
  emptyNoteContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
