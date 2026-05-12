import Toast from 'react-native-toast-message';

const durationMap = { 0: 2000, 1: 3500, 2: 0 };

const Snackbar = {
  LENGTH_SHORT: 0,
  LENGTH_LONG: 1,
  LENGTH_INDEFINITE: 2,
  show({ text, duration }) {
    Toast.show({
      type: 'info',
      text1: text,
      visibilityTime: durationMap[duration] ?? 2000,
    });
  },
  dismiss() {
    Toast.hide();
  },
};

export { Snackbar };
export default Snackbar;
