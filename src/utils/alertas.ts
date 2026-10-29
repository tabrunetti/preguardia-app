import { Alert, Platform } from 'react-native';

export const avisar = (titulo: string, mensaje: string) => {
  if (Platform.OS === 'web') window.alert(`${titulo}\n\n${mensaje}`);
  else Alert.alert(titulo, mensaje);
};

export const confirmar = (
  titulo: string,
  mensaje: string,
  textoConfirmar = 'Confirmar',
  destructivo = false
): Promise<boolean> =>
  new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve(window.confirm(`${titulo}\n\n${mensaje}`));
      return;
    }
    Alert.alert(
      titulo,
      mensaje,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: textoConfirmar, style: destructivo ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });