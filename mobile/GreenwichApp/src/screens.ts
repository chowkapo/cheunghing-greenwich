import type {
  ParamListBase,
  RouteConfig,
  StackNavigationState,
} from '@react-navigation/core';
import {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import CctvScreen from './containers/CctvScreen';
import HomeScreen from './containers/HomeScreen';
import SettingsScreen from './containers/SettingsScreen';
// import CctvScreen from './containers/CctvNewScreen';
import DoorAccessScreen from './containers/DoorAccessScreen';
import DoorScreen from './containers/DoorScreen';
import ElectricityScreen from './containers/ElectricityScreen';
import EmergencyAlarmScreen from './containers/EmergencyAlarmScreen';
import LeakageScreen from './containers/LeakageScreen';
import WaterScreen from './containers/WaterScreen';
import { TNavigationProp, TRootStackParamList } from './resources/types';

export type TStackRouteType<ParamList extends ParamListBase> = RouteConfig<
  ParamList,
  keyof ParamList,
  StackNavigationState<ParamList>,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap
>;

type TScreen = {
  name: keyof TRootStackParamList;
  title: string;
  icon: string;
  component: ({navigation}: {navigation: TNavigationProp}) => JSX.Element;
};

const screens: TScreen[] = [
  {
    name: 'Home',
    title: '主畫面',
    icon: 'home',
    component: HomeScreen,
  },
  {
    name: 'CCTV',
    title: '閉路電視',
    icon: 'cctv',
    component: CctvScreen,
  },
  {
    name: 'DoorAccess',
    title: '門禁系統',
    icon: 'shield-account',
    component: DoorAccessScreen,
  },
  {
    name: 'Electricity',
    title: '電氣',
    icon: 'home-lightning-bolt',
    component: ElectricityScreen,
  },
  {
    name: 'Water',
    title: '供水',
    icon: 'water-pump',
    component: WaterScreen,
  },
  {
    name: 'Leakage',
    title: '水滲漏',
    icon: 'pipe-leak',
    component: LeakageScreen,
  },
  {
    name: 'EmergencyAlarm',
    title: '緊急召喚',
    icon: 'alarm-light',
    component: EmergencyAlarmScreen,
  },
  {
    name: 'Door',
    title: '門磁感應',
    icon: 'door-closed',
    component: DoorScreen,
  },
  {
    name: 'Settings',
    title: '設定',
    icon: 'hammer-screwdriver',
    component: SettingsScreen,
  },
];

export default screens;
