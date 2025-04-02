import * as React from 'react';
import { store, persistor } from './store';
import { Provider } from 'react-redux';
import { ConfirmationServiceProvider } from './contexts/ConfirmationService';
import { CustomLoggerServiceProvider } from './contexts/CustomLoggerService';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';

const IntegratedApp = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CustomLoggerServiceProvider>
          <ConfirmationServiceProvider>
            <App />
          </ConfirmationServiceProvider>
        </CustomLoggerServiceProvider>
      </PersistGate>
    </Provider>
  );
};

export default IntegratedApp;
