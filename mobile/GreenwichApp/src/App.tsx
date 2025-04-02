import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {StatusBar, Animated, Dimensions} from 'react-native';
import screens from './screens';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {useAppSelector, useAppDispatch} from './store';
import LoginScreen from './containers/LoginScreen';
import useRecursiveTimeout from './utils/useRecursiveTimeout';
import {
  TDoorAccessState,
  TEvent,
  TEventState,
  TRootStackParamList,
  TUserData,
} from './resources/types';
import EventAlert from './components/EventAlert';
import {getDoorAccessUpdates} from './features/doorAccess/doorAccessSlice';
import {acknowledgeEvents, getNewEvents} from './features/event/eventSlice';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const Tab = createMaterialTopTabNavigator<TRootStackParamList>();
const windowHeight = Dimensions.get('window').height;

const App = () => {
  const {username, refreshFrequency, authenticationToken, alertEnabled} =
    useAppSelector(state => state.user) as TUserData;
  const {lastTransactionId: lastDoorAccessTransId} = useAppSelector(
    state => state.doorAccess,
  ) as TDoorAccessState;
  const {lastTransactionId: lastEventTransId} = useAppSelector(
    state => state.event,
  ) as TEventState;
  const events = useAppSelector(state => state.event.events) as TEvent[];
  const dispatch = useAppDispatch();
  const [pollId, setPollId] = React.useState(0);
  const [alerts, setAlerts] = React.useState<TEvent[]>([]);

  React.useEffect(() => {
    setPollId(value => (value + 1) % 65535);
  }, [refreshFrequency]);

  React.useEffect(() => {
    setAlerts(
      events.filter(e => !e.acknowledged && !!alertEnabled?.[e.system]),
    );
  }, [alertEnabled, events]);

  const fetchEventUpdates = async () => {
    authenticationToken &&
      dispatch(
        getNewEvents({
          transactionId: lastEventTransId ?? 0,
          authenticationToken: authenticationToken,
        }),
      );
  };

  const fetchDoorAccessUpdates = async () => {
    authenticationToken &&
      dispatch(
        getDoorAccessUpdates({
          transactionId: lastDoorAccessTransId ?? 0,
          authenticationToken: authenticationToken,
        }),
      );
  };

  useRecursiveTimeout(
    fetchDoorAccessUpdates,
    authenticationToken ? refreshFrequency : null,
    pollId,
  );

  useRecursiveTimeout(
    fetchEventUpdates,
    authenticationToken ? refreshFrequency : null,
    pollId,
  );

  const handleDismissAlerts = () => {
    dispatch(acknowledgeEvents(alerts.map(e => e.record.transID)));
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" translucent={true} />
      {!!username && (
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={(
              {
                /*route*/
              },
            ) => {
              return {
                swipeEnabled: false,
                tabBarShowIcon: true,
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: '#8D5534',
                tabBarLabelStyle: {
                  fontSize: 12,
                  textAlign: 'center',
                  paddingRight: 5,
                },
                tabBarStyle: {
                  backgroundColor: '#c49b6d',
                  paddingTop: 16,
                },
              };
            }}>
            {screens.map(screen => (
              <Tab.Screen
                name={screen.name}
                component={screen.component}
                key={screen.name}
                options={{
                  title: screen.title,
                  // eslint-disable-next-line react/no-unstable-nested-components
                  tabBarIcon: ({focused, color}) => (
                    <TabBarIcon
                      focused={focused}
                      color={color}
                      icon={screen.icon}
                    />
                  ),
                }}
              />
            ))}
          </Tab.Navigator>
        </NavigationContainer>
      )}
      {alerts.length > 0 && (
        <EventAlert
          alerts={alerts}
          title={'事件簿'}
          maxHeight={windowHeight}
          onDismissAlerts={handleDismissAlerts}
        />
      )}
      {!username && <LoginScreen />}
    </SafeAreaProvider>
  );
};

function TabBarIcon({
  focused,
  color,
  icon,
}: {
  focused: boolean;
  color: string;
  icon: string;
}) {
  if (focused) {
    return <AnimatedIcon name={icon} color={'yellow'} size={24} />;
  }
  return <AnimatedIcon name={icon} color={color} size={24} />;
}

export default App;
