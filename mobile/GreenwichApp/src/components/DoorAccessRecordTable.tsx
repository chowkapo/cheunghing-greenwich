import * as React from 'react';
import {StyleSheet, View, Text, ScrollView} from 'react-native';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import {TAccessRecord} from '../resources/types';

const fadeIn = {
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
};

const DoorAccessRecordTable = ({
  accessRecords,
}: {
  accessRecords: TAccessRecord[];
}) => {
  return (
    <View style={styles.tableContainer}>
      <View style={styles.headingContainer}>
        <Text style={[styles.id, styles.heading]}>事件編號</Text>
        <Text style={[styles.cardNo, styles.heading]}>卡號</Text>
        <Text style={[styles.name, styles.heading]}>姓名</Text>
        <Text style={[styles.unit, styles.heading]}>單位</Text>
        <Text style={[styles.location, styles.heading]}>位置</Text>
        <Text style={[styles.datetime, styles.heading]}>時間</Text>
        <Text style={[styles.status, styles.heading]}>狀況</Text>
      </View>
      <ScrollView>
        {accessRecords &&
          accessRecords.map((record, index) => (
            <Animatable.View
              animation={fadeIn}
              key={index}
              style={styles.recordRow}>
              <View style={[styles.id, styles.record]}>
                <Text style={styles.dataText}>{record.id}</Text>
              </View>
              <View style={[styles.cardNo, styles.record]}>
                <Text style={styles.dataText}>{record.cardNo}</Text>
              </View>
              <View style={[styles.name, styles.record]}>
                <Text style={styles.dataText}>{record.name}</Text>
              </View>
              <View style={[styles.unit, styles.record]}>
                <Text style={styles.dataText}>{record.unit}</Text>
              </View>
              <View style={[styles.location, styles.record]}>
                <Text style={styles.dataText}>{record.location}</Text>
              </View>
              <View style={[styles.datetime, styles.record]}>
                <Text style={styles.dataText}>
                  {moment(record.accessTime).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
              </View>
              <View style={[styles.status, styles.record]}>
                <Text style={styles.dataText}>{record.status}</Text>
              </View>
            </Animatable.View>
          ))}
        <View style={[styles.recordRow, styles.rowFiller]} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    width: '90%',
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'grey',
    paddingVertical: 20,
    padding: 10,
  },
  heading: {
    color: '#fff',
    fontWeight: 'bold',
  },
  recordRow: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 20,
    padding: 10,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  record: {
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dataText: {
    // fontWeight: 'bold',
  },
  id: {
    flex: 1,
  },
  cardNo: {
    flex: 1.5,
  },
  cardId: {
    flex: 1,
  },
  name: {
    flex: 2,
    display: 'flex',
    flexDirection: 'row',
    // flexWrap: 'wrap'
  },
  unit: {
    flex: 1.5,
  },
  location: {
    flex: 2,
  },
  datetime: {
    flex: 2,
  },
  status: {
    flex: 1,
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginLeft: 20,
  },
  rowFiller: {
    height: 120,
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});

export default DoorAccessRecordTable;
