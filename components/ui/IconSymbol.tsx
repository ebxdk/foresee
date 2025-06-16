// Fallback for using MaterialIcons on Android and web.

import { MaterialIcons } from '@expo/vector-icons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = {
  [key in SFSymbols]: MaterialIconName;
};

type SFSymbols =
  | 'house.fill'
  | 'gauge.with.needle.fill'
  | 'brain.head.profile'
  | 'calendar.badge.clock'
  | 'chart.line.uptrend.xyaxis.circle'
  | 'chevron.right';

type MaterialIconName =
  | 'home'
  | 'speed'
  | 'psychology'
  | 'event'
  | 'trending-up'
  | 'chevron-right';

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'gauge.with.needle.fill': 'speed',
  'brain.head.profile': 'psychology',
  'calendar.badge.clock': 'event',
  'chart.line.uptrend.xyaxis.circle': 'trending-up',
  'chevron.right': 'chevron-right',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: SFSymbols;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons name={MAPPING[name]} size={size} color={color} style={style} />;
}
