import { useContext, useMemo } from 'react';
import {
  ThemeContext,
} from '../providers/ThemeProvider';
// fallback default theme to ensure components always have required keys
import defaultTheme from '../providers/ThemeProvider/themes/default';

const useTheme = () => {
  const {
    changeTheme,
    theme,
  } = useContext(ThemeContext);

  // if theme is falsy or missing keys, use defaultTheme to avoid runtime errors in components
  const effectiveTheme = (theme && Object.keys(theme).length) ? theme : defaultTheme;

  return useMemo(() => ({
    changeTheme,
    theme: effectiveTheme,
  }), [effectiveTheme, changeTheme]);
};

export default useTheme;
