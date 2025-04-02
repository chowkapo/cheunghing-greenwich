import * as React from 'react';
import {StyleSheet, ScrollView, View, Text} from 'react-native';
import {Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {sensorRecordDisplayCount} from '../resources/config';
import {TEvent, TIMSTransactRecord} from '../resources/types';
import {getAlertSystemName} from '../utils/helper';

const SensorAlertList = ({
  minHeight,
  maxHeight,
  events,
  onInputPointView,
  popUp = false,
}: {
  minHeight?: number | string;
  maxHeight?: number | string;
  events?: TEvent[];
  popUp?: boolean;
  onInputPointView?: (pointID: number) => void;
}) => (
  <View style={popUp ? styles.popup : styles.root}>
    <SensorAlertHeader disableMap={!onInputPointView} />
    <ScrollView style={[styles.sensorAlertContainer, {maxHeight}, {minHeight}]}>
      {events
        ? events
            .slice(0, sensorRecordDisplayCount)
            .map((e: TEvent, index: number) => (
              <SensorAlertRow
                key={e.record.transID ?? index}
                event={e}
                onInputPointView={onInputPointView}
                bottomBorder={index < events.length - 1}
              />
            ))
        : null}
    </ScrollView>
  </View>
);

export default SensorAlertList;

const SensorAlertHeader = ({disableMap = false}) => {
  return (
    <View style={[styles.sensorAlertRowContainer, styles.headerContainer]}>
      <View style={styles.transID}>
        <Text style={styles.headerText}>事件編號</Text>
      </View>
      <View style={styles.alertTypeName}>
        <Text style={styles.headerText}>系統</Text>
      </View>
      <View style={styles.controllerName}>
        <Text style={styles.headerText}>控制器</Text>
      </View>
      <View style={styles.moduleName}>
        <Text style={styles.headerText}>模組</Text>
      </View>
      <View style={styles.moduleType}>
        <Text style={styles.headerText}>類型</Text>
      </View>
      <View style={styles.pointName}>
        <Text style={styles.headerText}>輸入/輸出點</Text>
      </View>
      <View style={styles.dayOfWeek}>
        <Text style={styles.headerText}>星期</Text>
      </View>
      <View style={styles.transDateTime}>
        <Text style={styles.headerText}>日期/時間</Text>
      </View>
      <View style={styles.eventType}>
        <Text style={styles.headerText}>事件</Text>
      </View>
      {!disableMap && (
        <View style={styles.viewButton}>
          <Text style={styles.headerText}>地圖</Text>
        </View>
      )}
    </View>
  );
};

const SensorAlertRow = ({
  event,
  onInputPointView,
  bottomBorder = false,
}: {
  event: TEvent;
  onInputPointView?: (pointID: number) => void;
  bottomBorder: boolean;
}) => {
  const {
    transID,
    controllerName,
    moduleName,
    moduleType,
    pointID,
    pointName,
    dayOfWeek,
    transDateTime,
    event: eventType,
  } = event.record ?? {};
  return (
    <View
      style={[
        styles.sensorAlertRowContainer,
        bottomBorder && styles.sensorAlertRowBottomBorder,
      ]}>
      <View style={styles.transID}>
        <Text>{transID ?? ' '}</Text>
      </View>
      <View style={styles.alertTypeName}>
        <Text>{event.system ? getAlertSystemName(event.system) : ' '}</Text>
      </View>
      <View style={styles.controllerName}>
        <Text>{controllerName ?? ' '}</Text>
      </View>
      <View style={styles.moduleName}>
        <Text>{moduleName ?? ' '}</Text>
      </View>
      <View style={styles.moduleType}>
        <Text>{moduleType ?? ' '}</Text>
      </View>
      <View style={styles.pointName}>
        <Text>{pointName ?? ' '}</Text>
      </View>
      <View style={styles.dayOfWeek}>
        <Text>{dayOfWeek ?? ' '}</Text>
      </View>
      <View style={styles.transDateTime}>
        <Text>{transDateTime ?? ' '}</Text>
      </View>
      <View style={styles.eventType}>
        <Text>{eventType ?? ' '}</Text>
      </View>
      {onInputPointView && (
        <View style={styles.viewButton}>
          {pointID ? (
            <Button
              icon={
                <Icon
                  name="location-pin"
                  size={15}
                  color={transID ? 'blue' : 'rgba(255,255,255,0)'}
                />
              }
              type="clear"
              onPress={() => onInputPointView(pointID)}
              buttonStyle={styles.viewButtonStyle}
            />
          ) : (
            <Icon name="location-pin" size={15} color={'rgb(128,128,128)'} />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    maxHeight: '35%',
  },
  popup: {
    // marginTop: 10,
    marginBottom: 20,
  },
  sensorAlertContainer: {
    flexGrow: 1,
    // maxHeight: 200
    // paddingTop: 10,
  },
  sensorAlertRowContainer: {
    // height: 40,
    // width: '40%',
    display: 'flex',
    flexDirection: 'row',
    margin: 2,
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  sensorAlertRowBottomBorder: {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'lightblue',
  },
  transID: {
    // width: '10%',
    flex: 0.8,
    padding: 1,
  },
  alertTypeName: {
    flex: 0.8,
    padding: 1,
  },
  controllerName: {
    // width: '20%',
    flex: 1,
    padding: 1,
  },
  moduleName: {
    // width: '15%',
    flex: 1.5,
    padding: 1,
  },
  moduleType: {
    // width: '10%',
    flex: 1,
    padding: 1,
    // alignItems: 'center',
  },
  pointName: {
    // width: '20%',
    flex: 2,
    padding: 1,
  },
  dayOfWeek: {
    // width: '5%',
    flex: 0.5,
    padding: 1,
  },
  transDateTime: {
    // width: '20%',
    flex: 2,
    padding: 1,
  },
  eventType: {
    // width: '5%',
    flex: 0.8,
    padding: 1,
  },
  viewButton: {
    width: '5%',
    alignItems: 'center',
    padding: 1,
  },
  headerContainer: {
    backgroundColor: 'red',
    margin: 0,
    width: '100%',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  headerText: {
    fontWeight: 'bold',
    color: 'white',
  },
  viewButtonStyle: {
    padding: 2,
  },
});
