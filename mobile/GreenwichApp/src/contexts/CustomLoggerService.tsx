import * as React from 'react';
import {logger} from 'react-native-logs';

const log = logger.createLogger();

const CustomLoggerContext = React.createContext<typeof log>(log);

export const CustomLoggerServiceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <CustomLoggerContext.Provider value={log}>
      {children}
    </CustomLoggerContext.Provider>
  );
};

export const useLogger = () => React.useContext(CustomLoggerContext);
