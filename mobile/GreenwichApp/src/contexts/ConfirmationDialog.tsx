import * as React from 'react';
import Dialog from 'react-native-dialog';

export interface ConfirmationOptions {
  catchOnCancel?: boolean;
  variant?: 'danger' | 'info' | 'error';
  title?: string;
  description?: string | React.ReactNode;
  agreeButtonText?: string;
  cancelButtonText?: string;
}

interface ConfirmationDialogProps extends ConfirmationOptions {
  open: boolean;
  onSubmit: () => void;
  onClose: () => void;
  onDismiss: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title = '',
  variant = 'info',
  description = '',
  agreeButtonText,
  cancelButtonText = 'Cancel',
  onSubmit,
  onClose,
  onDismiss,
}) => {
  if (variant === 'danger') {
    return (
      <Dialog.Container
        supportedOrientations={['landscape', 'portrait']}
        visible={open}
        onBackdropPress={onClose}
        onRequestClose={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        {typeof description === 'string' ? (
          <Dialog.Description>{description}</Dialog.Description>
        ) : (
          description
        )}
        <Dialog.Button label={cancelButtonText} onPress={onClose} />
        <Dialog.Button
          label={agreeButtonText ?? 'Confirm'}
          onPress={onSubmit}
        />
      </Dialog.Container>
    );
  } else {
    return (
      <Dialog.Container
        supportedOrientations={['landscape', 'portrait']}
        visible={open}
        onBackdropPress={onClose}
        onRequestClose={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <Dialog.Button label={agreeButtonText ?? 'OK'} onPress={onSubmit} />
      </Dialog.Container>
    );
  }
};
