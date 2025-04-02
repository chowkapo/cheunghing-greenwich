import * as React from 'react';
import {StyleSheet, Switch, View} from 'react-native';
import AlertIcon from './AlertIcon';

const AlertSwitch = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange?: () => void;
}) => {
  return (
    <View style={styles.root}>
      <AlertIcon on={value} />
      <Switch
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={!value ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => onValueChange && onValueChange()}
        value={value}
        style={{transform: [{scaleX: 0.6}, {scaleY: 0.6}]}}
      />
    </View>
  );
};

export default AlertSwitch;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
