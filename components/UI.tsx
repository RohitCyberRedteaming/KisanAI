import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ViewStyle, TextStyle,
} from 'react-native';
import { Colors } from '../constants/Colors';

// ── CARD ────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}
export function Card({ children, style, padding = 16 }: CardProps) {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
}

// ── BUTTON ──────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline' | 'ghost';
}
export function Button({
  label, onPress, color = Colors.primary, textColor = '#fff',
  icon, loading, disabled, style, size = 'md', variant = 'filled',
}: ButtonProps) {
  const sizeMap = { sm: 10, md: 14, lg: 18 };
  const pad = { sm: 8, md: 14, lg: 18 }[size];
  const radius = { sm: 8, md: 12, lg: 16 }[size];
  const fontSize = { sm: 13, md: 15, lg: 17 }[size];

  const bg = variant === 'filled' ? color
    : variant === 'outline' ? 'transparent' : 'transparent';
  const border = variant === 'outline' ? { borderWidth: 2, borderColor: color } : {};
  const txt = variant === 'filled' ? textColor : color;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor: bg, borderRadius: radius, paddingVertical: pad },
        border,
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={txt} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon ? <Text style={{ fontSize: fontSize + 2 }}>{icon}</Text> : null}
          <Text style={[styles.buttonText, { color: txt, fontSize }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── STAT CARD ────────────────────────────────────
interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  iconBg?: string;
  onPress?: () => void;
}
export function StatCard({ icon, value, label, iconBg = Colors.primaryBg, onPress }: StatCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── SECTION HEADER ───────────────────────────────
interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}
export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action} →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── EMPTY STATE ──────────────────────────────────
interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}
export function EmptyState({ icon, title, subtitle, action, onAction }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={{ fontSize: 64 }}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
      {action && (
        <Button label={action} onPress={onAction!} style={{ marginTop: 16 }} />
      )}
    </View>
  );
}

// ── TAG ─────────────────────────────────────────
interface TagProps {
  label: string;
  color?: string;
  bg?: string;
}
export function Tag({ label, color = Colors.primary, bg = Colors.primaryBg }: TagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

// ── BADGE ────────────────────────────────────────
interface BadgeProps {
  count: number;
  color?: string;
}
export function Badge({ count, color = Colors.danger }: BadgeProps) {
  if (!count) return null;
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

// ── DIVIDER ──────────────────────────────────────
export function Divider({ margin = 12 }: { margin?: number }) {
  return <View style={[styles.divider, { marginVertical: margin }]} />;
}

// ── LOADING SCREEN ───────────────────────────────
export function LoadingScreen({ message = 'लोड हो रहा है...' }: { message?: string }) {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

// ── CONFIDENCE BAR ───────────────────────────────
export function ConfidenceBar({ value, color = Colors.primary }: { value: number; color?: string }) {
  return (
    <View style={styles.confBar}>
      <View style={[styles.confFill, { width: `${value}%` as any, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    fontWeight: '700',
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  sectionAction: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  confBar: {
    height: 8,
    backgroundColor: Colors.primaryBg,
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 6,
  },
  confFill: {
    height: '100%',
    borderRadius: 20,
  },
});
