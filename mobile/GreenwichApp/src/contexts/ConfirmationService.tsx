import * as React from 'react';
import {ConfirmationDialog, ConfirmationOptions} from './ConfirmationDialog';

const ConfirmationServiceContext = React.createContext<
  (options: ConfirmationOptions) => Promise<void>
>(Promise.reject);

export const useConfirmation = () =>
  React.useContext(ConfirmationServiceContext);

export const ConfirmationServiceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [confirmationState, setConfirmationState] =
    React.useState<ConfirmationOptions | null>(null);
  const [open, setOpen] = React.useState<boolean>(false);

  const awaitingPromiseRef = React.useRef<{
    resolve: () => void;
    reject: ({message}: {message: string}) => void;
  }>();

  const openConfirmation = (options: ConfirmationOptions) => {
    setConfirmationState(options);
    setOpen(true);
    return new Promise<void>((resolve, reject) => {
      awaitingPromiseRef.current = {resolve, reject};
    });
  };

  const handleClose = () => {
    if (confirmationState?.catchOnCancel && awaitingPromiseRef.current) {
      awaitingPromiseRef.current.reject({message: 'cancel'});
    }

    // setConfirmationState(null);
    setOpen(false);
  };

  const handleSubmit = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve();
    }

    // setConfirmationState(null);
    setOpen(false);
  };

  const handleDismiss = () => {
    setConfirmationState(null);
  };
  return (
    <>
      <ConfirmationServiceContext.Provider
        value={openConfirmation}
        children={children}
      />
      <ConfirmationDialog
        open={open}
        onSubmit={handleSubmit}
        onClose={handleClose}
        onDismiss={handleDismiss}
        {...confirmationState}
      />
    </>
  );
};
