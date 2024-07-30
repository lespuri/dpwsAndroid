import { Alert as RNAlert } from 'react-native';

const AlertService = () => {
  let alertPresented = false;
  let alertModal = null;

  const extractErrorMessage = (err) => {
    let jsonConvertido = JSON.stringify(err);
    if (err && err.ExceptionMessage) {
      return err.ExceptionMessage;
    } else if (err && err.Message) {
      return err.Message;
    } else if (typeof err === 'string') {
      try {
        let json = JSON.parse(err);
        return extractErrorMessage(json);
      } catch (exception) {
        return err;
      }
    }
    if (jsonConvertido === '{"isTrusted":true}') {
      return "Houve um problema ao executar esta operação, clique em 'OK' e tente novamente!";
    }

    return JSON.stringify(err);
  };

  const presentErr = (title, err, buttons) => {
    let message = extractErrorMessage(err);
    present(title, message, buttons);
  };

  const present = (title, message, buttons, enableBackdropDismiss = true) => {
    if (!alertPresented) {
      if (!buttons || buttons.length === 0) {
        buttons = [{
          text: 'OK',
          onPress: () => {
            alertPresented = false;
          }
        }];
      }

      alertPresented = true;
      alertModal = RNAlert.alert(
        title,
        message,
        buttons,
        { cancelable: enableBackdropDismiss }
      );
    }
  };

  const dismiss = () => {
    if (alertModal) {
      alertModal = null;
    }
  };

  return {
    extractErrorMessage,
    presentErr,
    present,
    dismiss,
  };
};

export default AlertService;
