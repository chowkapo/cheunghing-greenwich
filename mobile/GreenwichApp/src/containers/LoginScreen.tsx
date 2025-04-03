/* eslint-disable react-native/no-inline-styles */
import React, {type PropsWithChildren} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  KeyboardAvoidingView,
  Image,
  TextInput,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import {clearError} from '../features/user/userSlice';
import {Button, Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const bannerImage = require('../resources/images/banner.png');
const bgImage = require('../resources/images/greenwich_bg.jpg');
import {useAppSelector, useAppDispatch} from '../store';
import {login} from '../features/user/userSlice';

const LoginScreen = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const authenticating = useAppSelector(state => state.user.authenticating);
  const loginError = useAppSelector(state => state.user.error);
  const dispatch = useAppDispatch();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const animatedY = React.useRef(new Animated.Value(50)).current;
  const fadeIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(animatedY, {
        toValue: 20,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      console.debug(`finished logo fadeIn = ${finished}`);
    });
  };

  const fadeOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animatedY, {
        toValue: 50,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      console.debug(`finished logo fadeOut = ${finished}`);
    });
  };

  React.useEffect(() => {
    fadeIn();
    return () => fadeOut();
  }, []);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setErrorMessage('');
    dispatch(clearError());
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrorMessage('');
    dispatch(clearError());
  };

  React.useEffect(() => setErrorMessage(loginError), [loginError]);

  const handleLogin = () => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    dispatch(
      login({
        username,
        password,
        signal: controller.signal,
      }),
    );
  };

  const handleAbort = () => {
    abortControllerRef.current?.abort();
  };

  return (
    <SafeAreaView style={styles.safeView}>
      <ImageBackground source={bgImage} resizeMode="cover" imageStyle={{opacity: 0.5}}>
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.sectionContainer}>
            <View style={styles.bannerContainer}>
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: animatedY,
                      },
                    ],
                  },
                ]}>
                <Image style={styles.headerImage} source={bannerImage} />
              </Animated.View>
            </View>
            <Animated.View
              style={[
                styles.sectionTitleContainer,
                {
                  opacity: fadeAnim,
                },
              ]}>
              <Text style={styles.title}>樓宇自動化設備監察系統</Text>
            </Animated.View>
            <View style={styles.inputContainer}>
              <Input
                disabled={authenticating}
                containerStyle={[
                  styles.inputView,
                  authenticating && styles.loggingIn,
                ]}
                inputContainerStyle={{
                  borderWidth: 0,
                  borderBottomWidth: 0,
                  margin: 0,
                  padding: 0
                }}
                inputStyle={styles.inputText}
                errorStyle={{height: 0, margin: 0, padding: 0}}
                placeholder="帳戶"
                placeholderTextColor="#F4E78D"
                value={username}
                autoComplete="username"
                leftIcon={<Icon name="account" size={32} color="#fff" />}
                onChangeText={handleUsernameChange}
              />
              <Input
                disabled={authenticating}
                containerStyle={[
                  styles.inputView,
                  authenticating && styles.loggingIn,
                ]}
                inputContainerStyle={{
                  borderWidth: 0,
                  borderBottomWidth: 0,
                  margin: 0,
                  padding: 0,
                }}
                inputStyle={styles.inputText}
                errorStyle={{height: 0, margin: 0, padding: 0}}
                secureTextEntry
                placeholder="密碼"
                placeholderTextColor="#F4E78D"
                value={password}
                autoComplete="password"
                leftIcon={<Icon name="lock" size={32} color="#fff" />}
                onChangeText={handlePasswordChange}
              />
              {errorMessage && (
                <Text style={styles.error}>{errorMessage ?? ''}</Text>
              )}
              <Button
                type="clear"
                disabled={!username || !password}
                containerStyle={styles.loginButtonContainer}
                buttonStyle={[
                  styles.loginButton,
                  authenticating && styles.loggingInButton,
                ]}
                icon={
                  !authenticating ? (
                    <Icon
                      name="login"
                      size={32}
                      color={!username || !password ? '#aaa' : '#fff'}
                      style={styles.buttonIcon}
                    />
                  ) : (
                    <ActivityIndicator
                      size={32}
                      color="#fff"
                      style={styles.buttonIcon}
                    />
                  )
                }
                iconPosition="right"
                onPress={authenticating ? handleAbort : handleLogin}
                title={!authenticating ? '登入' : '登入中，請稍候...'}
                titleStyle={styles.loginText}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeView: {
    backgroundColor: '#f8f2e8',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    // backgroundColor: '#4c728b',
  },
  bannerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    paddingTop: 30,
  },
  logoContainer: {
    position: 'absolute',
  },
  sectionTitleContainer: {
    flex: 0.5,
    color: 'black',
    // display: 'flex',
    // flexDirection: 'column',
    // alignItems: 'center',
    justifyContent: 'center',
  },
  headerImage: {
    width: 300,
    height: 250,
    resizeMode: 'contain',
    overflow: 'visible',
  },
  title: {
    fontSize: 32,
    // paddingTop: 24,
    letterSpacing: 10,
    fontWeight: '900',
    // color: '#8D5534',
    color: '#418349',
  },
  inputContainer: {
    flex: 3,
    // display: 'flex',
    // flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    // backgroundColor: 'orange',
    width: '100%',
    padding: 20,
  },
  inputView: {
    width: '80%',
    backgroundColor: 'rgba(0,81,54,0.5)',
    borderRadius: 10,
    // height: 64,
    marginBottom: 20,
    justifyContent: 'center',
    // padding: 20,
    borderColor: 'lightgrey',
    borderWidth: 1,
    borderStyle: 'solid',
    // display: 'flex',
    // flexDirection: 'column',
    // alignItems: 'center'
  },
  inputText: {
    height: 64,
    // margin: 20,
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    // borderWidth: 0
    // border: 'solid 1px grey'
  },
  loginButtonContainer: {
    width: '80%',
    marginTop: 40,
    marginBottom: 10,
  },
  loginButton: {
    width: '100%',
    height: 64,
    // backgroundColor: '#2A3958',
    backgroundColor: 'rgba(0,115,74,0.8)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loggingInButton: {
    backgroundColor: '#aaa',
  },
  loginText: {
    fontSize: 24,
    color: '#fff',
  },
  loggingIn: {
    // backgroundColor: '#ddd',
    backgroundColor: 'rgba(0,115,74,0.3)',
  },
  buttonIcon: {
    marginLeft: 12,
  },
  error: {
    fontSize: 20,
    padding: 8,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: 'rgba(255,0,0,0.5)',
    color: 'yellow',
  },
});

export default LoginScreen;
