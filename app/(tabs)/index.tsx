import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../contexts/AppContext';
import { Card, SectionHeader, StatCard } from '../../components/UI';

const OW_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

const ALERTS = [
  { id: '1', type: 'danger', icon: '🌧️', title: 'कल भारी बारिश संभव', sub: 'सिंचाई और खाद डालना टालें। फसल सुरक्षित रखें।' },
  { id: '2', type: 'warn', icon: '🐛', title: 'कीट प्रकोप का खतरा', sub: 'आपके क्षेत्र में सफेद मक्खी रिपोर्ट हुई है।' },
  { id: '3', type: 'info', icon: '📈', title: 'सोयाबीन की कीमत बढ़ी', sub: 'आज मंडी में ₹250/क्विंटल वृद्धि। बेचने का समय!' },
];

const CROPS_PREVIEW = [
  { id: '1', name: 'गेहूँ', emoji: '🌾', price: 2250, change: 1.2, trend: 'up' },
  { id: '2', name: 'धान', emoji: '🌾', price: 2183, change: 0.8, trend: 'up' },
  { id: '3', name: 'मक्का', emoji: '🌽', price: 2090, change: -1.5, trend: 'down' },
  { id: '4', name: 'सोयाबीन', emoji: '🫘', price: 4650, change: 2.1, trend: 'up' },
];

const weatherIcon = (code: string) => {
  if (code.startsWith('01')) return '☀️';
  if (code.startsWith('02')) return '⛅';
  if (code.startsWith('03') || code.startsWith('04')) return '☁️';
  if (code.startsWith('09') || code.startsWith('10')) return '🌧️';
  if (code.startsWith('11')) return '⛈️';
  return '🌤️';
};

export default function HomeScreen() {
  const { scanHistory, farmerName, farmerLocation } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [time, setTime] = useState(new Date());
  const [miniWeather, setMiniWeather] = useState({ temp: 32, icon: '⛅', desc: 'आंशिक बादल · 68% नमी', rainTomorrow: 75 });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const fetchMiniWeather = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !OW_KEY || OW_KEY === 'your_openweather_key_here') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [curRes, foreRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&appid=${OW_KEY}&units=metric&lang=hi`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&appid=${OW_KEY}&units=metric&cnt=8`),
      ]);
      if (curRes.ok) {
        const cur = await curRes.json();
        const fore = foreRes.ok ? await foreRes.json() : null;
        const tomorrowRain = fore ? Math.round((fore.list[4]?.pop || 0) * 100) : 0;
        setMiniWeather({
          temp: Math.round(cur.main.temp),
          icon: weatherIcon(cur.weather[0].icon),
          desc: `${cur.weather[0].description} · ${cur.main.humidity}% नमी`,
          rainTomorrow: tomorrowRain,
        });
      }
    } catch {}
  }, []);

  useEffect(() => { fetchMiniWeather(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMiniWeather();
    await new Promise(r => setTimeout(r, 500));
    setRefreshing(false);
  };

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return 'सुप्रभात 🌅';
    if (h < 17) return 'नमस्ते ☀️';
    return 'शुभ संध्या 🌙';
  };

  const alertColor = (type: string) => ({
    danger: { left: Colors.danger, bg: '#fce4ec' },
    warn: { left: Colors.gold, bg: '#fff8e1' },
    info: { left: Colors.secondary, bg: '#e3f2fd' },
  }[type] || { left: Colors.primary, bg: Colors.primaryBg });

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.darkMid, Colors.dark]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.farmerName}>{farmerName}</Text>
            <Text style={styles.farmerLoc}>📍 {farmerLocation}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications' as any)}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.weatherMini} onPress={() => router.push('/(tabs)/weather')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 32 }}>{miniWeather.icon}</Text>
            <View>
              <Text style={styles.weatherTemp}>{miniWeather.temp}°C</Text>
              <Text style={styles.weatherDesc}>{miniWeather.desc}</Text>
            </View>
          </View>
          {miniWeather.rainTomorrow > 30 && (
            <View style={styles.weatherBadge}>
              <Text style={{ fontSize: 12, color: Colors.gold, fontWeight: '700' }}>
                🌧️ कल बारिश {miniWeather.rainTomorrow}%
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Stat Row */}
        <View style={styles.statRow}>
          <StatCard icon="🌾" value="3" label="सक्रिय फसलें" iconBg={Colors.primaryBg} onPress={() => router.push('/(tabs)/more')} />
          <StatCard icon="🔬" value={String(scanHistory.length || 0)} label="कुल स्कैन" iconBg="#e3f2fd" onPress={() => router.push('/(tabs)/scan')} />
          <StatCard icon="💰" value="₹2,250" label="गेहूँ/क्विंटल" iconBg={Colors.goldBg} onPress={() => router.push('/(tabs)/market')} />
        </View>

        {/* Quick Actions */}
        <SectionHeader title="⚡ त्वरित क्रिया" />
        <View style={styles.quickGrid}>
          {[
            { icon: '📸', label: 'फसल स्कैन करें', color: Colors.primary, route: '/camera' },
            { icon: '🌱', label: 'फसल सुझाव', color: Colors.secondary, route: '/(tabs)/more' },
            { icon: '🤖', label: 'Rohit AI', color: '#8b5cf6', route: '/chat' },
            { icon: '📊', label: 'मंडी भाव', color: Colors.earth, route: '/(tabs)/market' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.quickBtn, { borderColor: item.color + '40' }]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: item.color + '20' }]}>
                <Text style={{ fontSize: 26 }}>{item.icon}</Text>
              </View>
              <Text style={[styles.quickLabel, { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Alerts */}
        <SectionHeader title="🚨 ताज़े अलर्ट" action="सभी" onAction={() => {}} />
        <View style={{ gap: 10, marginBottom: 20 }}>
          {ALERTS.map((a) => {
            const c = alertColor(a.type);
            return (
              <View key={a.id} style={[styles.alertItem, { backgroundColor: c.bg, borderLeftColor: c.left }]}>
                <Text style={{ fontSize: 22 }}>{a.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>{a.title}</Text>
                  <Text style={styles.alertSub}>{a.sub}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Market preview */}
        <SectionHeader title="📊 आज के मंडी भाव" action="सभी देखें" onAction={() => router.push('/(tabs)/market')} />
        <Card>
          {CROPS_PREVIEW.map((crop, i) => (
            <View key={crop.id}>
              <View style={styles.marketRow}>
                <Text style={{ fontSize: 20 }}>{crop.emoji}</Text>
                <Text style={styles.cropName}>{crop.name}</Text>
                <Text style={styles.cropPrice}>₹{crop.price.toLocaleString('hi-IN')}</Text>
                <View style={[styles.trendBadge, { backgroundColor: crop.trend === 'up' ? Colors.successBg : Colors.dangerBg }]}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: crop.trend === 'up' ? Colors.success : Colors.danger }}>
                    {crop.trend === 'up' ? '▲' : '▼'} {Math.abs(crop.change)}%
                  </Text>
                </View>
              </View>
              {i < CROPS_PREVIEW.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </Card>

        {/* Recent scans */}
        {scanHistory.length > 0 && (
          <>
            <SectionHeader title="🔬 हाल के स्कैन" action="सभी" onAction={() => router.push('/(tabs)/scan')} style={{ marginTop: 20 }} />
            <Card style={{ marginBottom: 24 }}>
              {scanHistory.slice(0, 3).map((scan, i) => (
                <View key={scan.id}>
                  <View style={styles.marketRow}>
                    <Text style={{ fontSize: 20 }}>🦠</Text>
                    <Text style={styles.cropName}>{scan.diseaseName}</Text>
                    <Text style={{ fontSize: 12, color: Colors.textMuted }}>{scan.confidence}%</Text>
                  </View>
                  {i < Math.min(scanHistory.length, 3) - 1 && <View style={styles.rowDivider} />}
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: Platform.OS === 'ios' ? 54 : 32, paddingHorizontal: 18, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,.6)', fontWeight: '600' },
  farmerName: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  farmerLoc: { fontSize: 13, color: 'rgba(255,255,255,.55)', marginTop: 2 },
  notifBtn: { position: 'relative', padding: 4 },
  notifDot: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, borderWidth: 1.5, borderColor: Colors.dark },
  weatherMini: {
    backgroundColor: 'rgba(255,255,255,.12)', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,255,255,.15)',
  },
  weatherTemp: { fontSize: 20, fontWeight: '800', color: '#fff' },
  weatherDesc: { fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 2 },
  weatherBadge: { backgroundColor: 'rgba(244,185,66,.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  quickBtn: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, gap: 8, elevation: 1 },
  quickIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  alertItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 12, borderLeftWidth: 4 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  alertSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  marketRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  cropName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  cropPrice: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  trendBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  rowDivider: { height: 1, backgroundColor: Colors.border },
});
