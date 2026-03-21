import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { Card, SectionHeader } from '../../components/UI';

const OW_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

interface WeatherData {
  location: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  desc: string;
  icon: string;
  uvIndex: number;
  visibility: number;
  lat: number;
  lon: number;
}

interface ForecastDay {
  day: string;
  icon: string;
  temp: number;
  rain: number;
}

const weatherIcon = (code: string): string => {
  if (code.startsWith('01')) return '☀️';
  if (code.startsWith('02')) return '⛅';
  if (code.startsWith('03') || code.startsWith('04')) return '☁️';
  if (code.startsWith('09') || code.startsWith('10')) return '🌧️';
  if (code.startsWith('11')) return '⛈️';
  if (code.startsWith('13')) return '❄️';
  return '🌫️';
};

const DAYS = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

export default function WeatherScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchWeather = useCallback(async () => {
    try {
      setError('');
      // Get location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 27.1767; // Agra default
      let lon = 78.0081;
      let locationName = 'आगरा, उत्तर प्रदेश';

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
        // Reverse geocode
        try {
          const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          if (geo[0]) {
            locationName = `${geo[0].city || geo[0].district || ''}, ${geo[0].region || ''}`;
          }
        } catch {}
      }

      if (!OW_KEY || OW_KEY === 'your_openweather_key_here') {
        // Demo data when no API key
        setWeather({
          location: locationName,
          temp: 32, feelsLike: 36, humidity: 68, wind: 14,
          desc: 'आंशिक बादल', icon: '⛅', uvIndex: 7, visibility: 8,
          lat, lon,
        });
        setForecast([
          { day: 'आज', icon: '⛅', temp: 32, rain: 20 },
          { day: DAYS[(new Date().getDay() + 1) % 7], icon: '🌧️', temp: 28, rain: 75 },
          { day: DAYS[(new Date().getDay() + 2) % 7], icon: '☁️', temp: 27, rain: 40 },
          { day: DAYS[(new Date().getDay() + 3) % 7], icon: '⛅', temp: 30, rain: 15 },
          { day: DAYS[(new Date().getDay() + 4) % 7], icon: '☀️', temp: 34, rain: 5 },
        ]);
        return;
      }

      // Real API calls
      const [curRes, foreRes, uvRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OW_KEY}&units=metric&lang=hi`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OW_KEY}&units=metric&lang=hi&cnt=40`),
        fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${OW_KEY}`),
      ]);

      const cur = await curRes.json();
      const fore = await foreRes.json();
      const uv = uvRes.ok ? await uvRes.json() : { value: 0 };

      setWeather({
        location: `${cur.name}, ${cur.sys?.country === 'IN' ? 'भारत' : cur.sys?.country}`,
        temp: Math.round(cur.main.temp),
        feelsLike: Math.round(cur.main.feels_like),
        humidity: cur.main.humidity,
        wind: Math.round(cur.wind.speed * 3.6),
        desc: cur.weather[0].description,
        icon: weatherIcon(cur.weather[0].icon),
        uvIndex: Math.round(uv.value || 0),
        visibility: Math.round((cur.visibility || 10000) / 1000),
        lat, lon,
      });

      // Process 5-day forecast (one entry per day at noon)
      const seen = new Set<string>();
      const days: ForecastDay[] = [];
      fore.list?.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();
        if (!seen.has(dayKey) && days.length < 5) {
          seen.add(dayKey);
          days.push({
            day: days.length === 0 ? 'आज' : DAYS[date.getDay()],
            icon: weatherIcon(item.weather[0].icon),
            temp: Math.round(item.main.temp),
            rain: Math.round((item.pop || 0) * 100),
          });
        }
      });
      setForecast(days);

    } catch (e) {
      setError('मौसम डेटा लोड नहीं हो सका। इंटरनेट जाँचें।');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchAIAdvice = useCallback(async (w: WeatherData, f: ForecastDay[]) => {
    if (!ANTHROPIC_KEY || ANTHROPIC_KEY === 'your_anthropic_api_key_here') {
      setAiAdvice('💡 AI सलाह: मौसम के आधार पर सिंचाई और खाद की योजना बनाएं। बारिश की संभावना देखकर ही कीटनाशक डालें।');
      return;
    }
    setAiLoading(true);
    try {
      const prompt = `मौसम: ${w.temp}°C, नमी ${w.humidity}%, हवा ${w.wind} km/h, ${w.desc}. अगले 5 दिन: ${f.map(d => `${d.day} ${d.temp}°C बारिश${d.rain}%`).join(', ')}. उत्तर प्रदेश के किसान को 2 वाक्यों में खेती सलाह दें। इमोजी से शुरू करें।`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 150, messages: [{ role: 'user', content: prompt }] }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAdvice(data.content[0].text);
      }
    } catch {}
    setAiLoading(false);
  }, []);

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    if (weather && forecast.length) fetchAIAdvice(weather, forecast);
  }, [weather, forecast]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeather();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>📍 मौसम डेटा लोड हो रहा है...</Text>
      </View>
    );
  }

  if (error && !weather) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🌐</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchWeather}>
          <Text style={styles.retryText}>🔄 पुनः प्रयास</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ADVISORIES = weather ? [
    {
      icon: '✅', title: 'आज करें', color: Colors.primary, bg: Colors.primaryBg,
      items: weather.humidity > 70
        ? ['सिंचाई कम करें', 'फसल की जाँच करें', 'जल निकासी सुनिश्चित करें']
        : ['सिंचाई करें', 'खाद डालें', 'कटाई करें'],
    },
    {
      icon: '❌', title: 'न करें', color: Colors.danger, bg: Colors.dangerBg,
      items: forecast[1]?.rain > 50
        ? ['कल खाद न डालें', 'कीटनाशक टालें', 'कटाई टालें']
        : ['दोपहर में सिंचाई नहीं', 'तेज धूप में काम नहीं'],
    },
  ] : [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Main Weather Card */}
        <LinearGradient
          colors={['#1565c0', '#1a7abf', '#00acc1']}
          style={styles.mainWeather}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <Text style={styles.location}>📍 {weather?.location}</Text>
          <View style={styles.tempRow}>
            <Text style={styles.temp}>{weather?.temp}°C</Text>
            <Text style={{ fontSize: 72 }}>{weather?.icon}</Text>
          </View>
          <Text style={styles.desc}>{weather?.desc} · महसूस {weather?.feelsLike}°C</Text>

          <View style={styles.weatherStats}>
            {[
              { icon: '💧', label: 'नमी', val: `${weather?.humidity}%` },
              { icon: '💨', label: 'हवा', val: `${weather?.wind} km/h` },
              { icon: '☀️', label: 'UV Index', val: String(weather?.uvIndex) },
              { icon: '👁️', label: 'दृश्यता', val: `${weather?.visibility} km` },
            ].map((s) => (
              <View key={s.label} style={styles.weatherStat}>
                <Text style={{ fontSize: 18 }}>{s.icon}</Text>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.aiAdvisory}>
            <Text style={{ fontSize: 16 }}>{aiLoading ? '⏳' : '🤖'}</Text>
            <Text style={styles.aiAdvisoryText}>
              {aiLoading ? 'AI सलाह तैयार हो रही है...' : aiAdvice}
            </Text>
          </View>
        </LinearGradient>

        {/* 5-day forecast */}
        <SectionHeader title="📅 5-दिन का पूर्वानुमान" style={styles.sectionPad} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10, paddingRight: 16 }}>
            {forecast.map((d, i) => (
              <View key={i} style={[styles.forecastCard, i === 0 && styles.forecastToday]}>
                <Text style={[styles.forecastDay, i === 0 && { color: Colors.primary }]}>{d.day}</Text>
                <Text style={{ fontSize: 28 }}>{d.icon}</Text>
                <Text style={styles.forecastTemp}>{d.temp}°C</Text>
                <View style={styles.rainBadge}>
                  <Text style={styles.rainText}>🌧 {d.rain}%</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Advisory cards */}
        <View style={styles.sectionPad}>
          <SectionHeader title="🌾 खेती सलाह" />
          <View style={styles.advisoryGrid}>
            {ADVISORIES.map((a) => (
              <Card key={a.title} style={{ backgroundColor: a.bg, borderColor: a.color + '30' }}>
                <View style={styles.advisoryHead}>
                  <Text style={{ fontSize: 18 }}>{a.icon}</Text>
                  <Text style={[styles.advisoryTitle, { color: a.color }]}>{a.title}</Text>
                </View>
                <View style={{ gap: 6, marginTop: 8 }}>
                  {a.items.map((item) => (
                    <View key={item} style={styles.advisoryItem}>
                      <Text style={[styles.advisoryTag, { backgroundColor: a.color + '20', color: a.color }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* Pest risk based on humidity */}
        <View style={[styles.sectionPad, { paddingBottom: 90 }]}>
          <SectionHeader title="🐛 कीट जोखिम" />
          <Card>
            {[
              { name: 'सफेद मक्खी', risk: (weather?.humidity || 0) > 70 ? 'उच्च' : 'मध्यम', pct: (weather?.humidity || 0) > 70 ? 80 : 45, color: (weather?.humidity || 0) > 70 ? Colors.danger : Colors.gold },
              { name: 'टिड्डी', risk: 'मध्यम', pct: 45, color: Colors.gold },
              { name: 'माहू (Aphid)', risk: 'कम', pct: 20, color: Colors.primary },
            ].map((p) => (
              <View key={p.name} style={styles.pestRow}>
                <Text style={styles.pestName}>{p.name}</Text>
                <View style={styles.pestBarBg}>
                  <View style={[styles.pestBarFill, { width: `${p.pct}%` as any, backgroundColor: p.color }]} />
                </View>
                <Text style={[styles.pestRisk, { color: p.color }]}>{p.risk}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  loadingText: { fontSize: 16, color: Colors.textSecondary, marginTop: 8 },
  errorText: { fontSize: 15, color: Colors.danger, textAlign: 'center' },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  scroll: { paddingBottom: 20 },
  mainWeather: {
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingHorizontal: 20, paddingBottom: 24,
  },
  location: { fontSize: 14, color: 'rgba(255,255,255,.75)', fontWeight: '600' },
  tempRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 },
  temp: { fontSize: 80, fontWeight: '800', color: '#fff', lineHeight: 88 },
  desc: { fontSize: 16, color: 'rgba(255,255,255,.85)', marginTop: 4 },
  weatherStats: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,.12)', borderRadius: 14, padding: 14, marginTop: 18,
  },
  weatherStat: { alignItems: 'center', gap: 3 },
  statVal: { fontSize: 14, fontWeight: '800', color: '#fff' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: '600' },
  aiAdvisory: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,.15)', borderRadius: 12, padding: 12, marginTop: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,.2)',
  },
  aiAdvisoryText: { flex: 1, fontSize: 13, color: '#fff', fontWeight: '600', lineHeight: 18 },
  sectionPad: { paddingHorizontal: 16, marginTop: 20 },
  forecastCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 6, width: 86,
    borderWidth: 1, borderColor: Colors.border,
  },
  forecastToday: { borderColor: Colors.primary, borderWidth: 2 },
  forecastDay: { fontSize: 12, color: Colors.textMuted, fontWeight: '700' },
  forecastTemp: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  rainBadge: { backgroundColor: '#e3f2fd', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  rainText: { fontSize: 11, color: Colors.secondary, fontWeight: '700' },
  advisoryGrid: { gap: 12 },
  advisoryHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  advisoryTitle: { fontSize: 15, fontWeight: '800' },
  advisoryItem: { flexDirection: 'row' },
  advisoryTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '700' },
  pestRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  pestName: { width: 100, fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  pestBarBg: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 20, overflow: 'hidden' },
  pestBarFill: { height: '100%', borderRadius: 20 },
  pestRisk: { width: 45, fontSize: 12, fontWeight: '700', textAlign: 'right' },
});
