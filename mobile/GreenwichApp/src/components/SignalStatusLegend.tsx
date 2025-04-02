import * as React from 'react';
import {StyleSheet, ScrollView, View, Text} from 'react-native';
import {Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {signalStatusList} from '../resources/config';

const SignalStatusLegend = () => {
  return (
    <View style={styles.legendContainer}>
      <View style={styles.legendTitle}>
        <Text style={styles.legendTitleText}>說</Text>
        <Text style={styles.legendTitleText}>明</Text>
      </View>
      <View style={styles.legendContents}>
        {signalStatusList.map((v: any) => (
          <StatusLegend
            key={v.text}
            signalName={v.text}
            signalStatusLegendColor={v.color}
          />
        ))}
      </View>
    </View>
  );
};

export default SignalStatusLegend;

const StatusLegend = ({
  signalName,
  signalStatusLegendColor,
}: {
  signalName: string;
  signalStatusLegendColor: string;
}) => {
  return (
    <View style={styles.signalStatusLegendContainer}>
      <View style={styles.signalStatusLegendColorContainer}>
        <Icon name="circle" size={22} color={signalStatusLegendColor} solid />
      </View>
      <View style={styles.signalStatusLegendTextContainer}>
        <Text>{signalName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    // position: "absolute",
    // bottom: 0,
    // width: 600,
    height: '100%',
    width: '100%',
    // height: '100%',
    // padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#ddd',
  },
  legendTitle: {
    width: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'purple',
    padding: 5,
    height: '100%',
    justifyContent: 'center',
  },
  legendTitleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    margin: 5,
  },
  legendContents: {
    flex: 1,
    // backgroundColor: '#ddd',
    // height: '100%',
    // display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    padding: 5,
    // alignItems: 'center'
  },
  signalStatusLegendContainer: {
    margin: 5,
    width: 160,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalStatusLegendColorContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalStatusLegendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
