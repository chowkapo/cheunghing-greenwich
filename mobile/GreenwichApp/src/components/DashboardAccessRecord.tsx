import * as React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
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

const DashboardAccessRecord = ({
  accessRecords,
}: {
  accessRecords: TAccessRecord[];
}) => {
  const accessRecord = accessRecords && accessRecords[0];
  const {id, cardNo, name, unit, location, accessTime, status} =
    accessRecord ?? {};
  return (
    <View style={styles.recordContainer}>
      <Animatable.View
        key={id}
        style={styles.noImageContainer}
        animation={fadeIn}>
        <Icon name={'person-sharp'} color={'darkgrey'} size={120} />
      </Animatable.View>
      <View style={styles.details}>
        <View style={[styles.recordRow, styles.bottomBorder]}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{'姓名'}</Text>
          </View>
          <Text style={styles.dataText}>{name}</Text>
        </View>
        <View style={[styles.recordRow, styles.bottomBorder]}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{'卡號'}</Text>
          </View>
          <Text style={styles.dataText}>{cardNo}</Text>
        </View>
        <View style={[styles.recordRow, styles.bottomBorder]}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{'單位'}</Text>
          </View>
          <Text style={styles.dataText}>{unit}</Text>
        </View>
        <View style={[styles.recordRow, styles.bottomBorder]}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{'事件編號'}</Text>
          </View>
          <Text style={styles.dataText}>{id}</Text>
        </View>
        <View style={[styles.recordRow, styles.bottomBorder]}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{'位置'}</Text>
          </View>
          <Text style={styles.dataText}>{location}</Text>
        </View>
        <View style={[styles.recordRow, styles.bottomBorder]}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{'狀況'}</Text>
          </View>
          <Text style={styles.dataText}>{status}</Text>
        </View>
        <View style={styles.recordRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{'時間'}</Text>
          </View>
          <Text style={styles.dataText}>
            {moment(accessTime).format('YYYY-MM-DD HH:mm:ss')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  recordContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    // height: '100%',
    padding: 20,
    // backgroundColor: 'coral'
  },
  noImageContainer: {
    flex: 1,
    // backgroundColor: 'yellow',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    // flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 1,
    // paddingLeft: 10,
    // paddingRight: 10,
    // paddingTop: 10,
    // paddingBottom: 10,
    // backgroundColor: 'orange'
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    // backgroundColor: 'grey',
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
    alignItems: 'center',
    // backgroundColor: 'white',
    // paddingVertical: 7,
    padding: 2,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  record: {
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerTextContainer: {
    flex: 2,
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  headerText: {
    fontWeight: 'bold',
  },
  dataText: {
    flex: 3,
  },
  id: {
    flex: 1,
  },
  cardNo: {
    flex: 1,
  },
  cardId: {
    flex: 1,
  },
  name: {
    flex: 2,
    display: 'flex',
    flexDirection: 'row',
  },
  unit: {
    flex: 1.5,
  },
  datetime: {
    flex: 2,
  },
  status: {
    flex: 1,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});

export default DashboardAccessRecord;
