import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
// import logger from 'redux-logger';
import {
  createTransform,
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import userReducer from './features/user/userSlice';
import doorAccessReducer from './features/doorAccess/doorAccessSlice';
import eventReducer from './features/event/eventSlice';

const doorAccessTransform = createTransform(
  inboundState => inboundState,
  outboundState => {
    // console.debug(
    //   `inside transform outbound: outboundState=${JSON.stringify(
    //     outboundState,
    //   )}`,
    // );
    return {
      ...(outboundState as object),
      isRetrieving: false,
    };
  },
  {
    whitelist: ['doorAccess'],
  },
);

const eventTransform = createTransform(
  inboundState => inboundState,
  outboundState => {
    // console.debug(
    //   `inside transform outbound: outboundState=${JSON.stringify(
    //     outboundState,
    //   )}`,
    // );
    return {
      ...(outboundState as object),
      isRetrieving: false,
    };
  },
  {
    whitelist: ['event'],
  },
);

const rootPersisConfig = {
  key: 'hems',
  storage: AsyncStorage,
  transforms: [doorAccessTransform, eventTransform],
  blacklist: ['register'],
};

const rootReducer = combineReducers({
  user: userReducer,
  doorAccess: doorAccessReducer,
  event: eventReducer,
});
const persistedReducer = persistReducer(rootPersisConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  // .concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const persistor = persistStore(store);
