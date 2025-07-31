import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

export interface KeyboardInfo {
  isVisible: boolean;
  height: number;
}

export const useKeyboard = (): KeyboardInfo => {
  const [keyboardInfo, setKeyboardInfo] = useState<KeyboardInfo>({
    isVisible: false,
    height: 0,
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardInfo({
          isVisible: true,
          height: e.endCoordinates.height,
        });
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardInfo({
          isVisible: false,
          height: 0,
        });
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  return keyboardInfo;
};
