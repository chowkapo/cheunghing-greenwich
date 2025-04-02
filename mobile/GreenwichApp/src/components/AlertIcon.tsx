import * as React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AlertIcon = ({on = false}) => {
  return on ? (
    <MaterialIcons name="visibility" size={25} color="#444" />
  ) : (
    <MaterialIcons name="visibility-off" size={25} color="#444" />
  );
};

export default AlertIcon;
