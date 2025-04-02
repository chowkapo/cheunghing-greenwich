import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AlertSwitch from './AlertSwitch';

const ScreenTitle = ({
  title = '',
  showAlertToggle = false,
  enabled = false,
  onValueChange,
}: {
  title: string;
  showAlertToggle?: boolean;
  enabled?: boolean;
  onValueChange?: () => void;
}) => {
  return (
    <View style={[styles.sectionTitle, showAlertToggle && styles.alertEnabled]}>
      {showAlertToggle && <View />}
      <Text style={styles.sectionTitleText}>{title}</Text>
      {showAlertToggle && (
        <AlertSwitch value={!!enabled} onValueChange={onValueChange} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    alignItems: 'center',
    backgroundColor: 'orange',
    padding: 10,
  },
  alertEnabled: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default ScreenTitle;
