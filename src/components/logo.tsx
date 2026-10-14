import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';

type Props = {
  variant?: 'isotipo' | 'isologo' | 'vertical';
  size?: number;
};

export function Isotipo({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="32" y="6" width="36" height="88" rx="11" fill={Colors.primary} />
      <Rect x="6" y="32" width="88" height="36" rx="11" fill={Colors.primary} />
      <Polyline
        points="31,51 44,64 70,36"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Logotipo({ fontSize }: { fontSize: number }) {
  return (
    <Text style={[styles.logotipo, { fontSize }]}>
      <Text style={{ color: Colors.brandDark }}>Pre</Text>
      <Text style={{ color: Colors.primary }}>Guardia</Text>
    </Text>
  );
}

export default function Logo({ variant = 'vertical', size = 72 }: Props) {
  if (variant === 'isotipo') return <Isotipo size={size} />;

  if (variant === 'isologo') {
    return (
      <View style={styles.row}>
        <Isotipo size={size} />
        <Logotipo fontSize={size * 0.6} />
      </View>
    );
  }

  return (
    <View style={styles.column}>
      <Isotipo size={size} />
      <Logotipo fontSize={size * 0.42} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  column: {
    alignItems: 'center',
    gap: 12,
  },
  logotipo: {
    fontFamily: 'Outfit_700Bold',
    letterSpacing: -0.5,
  },
});