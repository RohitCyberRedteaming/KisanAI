import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Platform, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Card, SectionHeader } from '../../components/UI';

const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const MANDIS = ['लखनऊ मंडी', 'कानपुर मंडी', 'वाराणसी मंडी', 'आगरा मंडी', 'इलाहाबाद मंडी'];

const STATIC_CROPS = [
  { id: '1', name: 'गेहूँ', emoji: '🌾', price: 2250, change: 1.2, trend: 'up', season: 'रबी' },
  { id: '2', name: 'धान', emoji: '🌾', price: 2183, change: 0.8, trend: 'up', season: 'खरीफ' },
  { id: '3', name: 'मक्का', emoji: '🌽', price: 2090, change: -1.5, trend: 'down', season: 'खरीफ' },
  { id: '4', name: 'सोयाबीन', emoji: '🫘', price: 4650, change: 2.1, trend: 'up', season: 'खरीफ' },
  { id: '5', name: 'सरसों', emoji: '🌼', price: 5800, change: -0.9, trend: 'down', season: 'रबी' },
  { id: '6', name: 'चना', emoji: '🫘', price: 5200, change: 1.8, trend: 'up', season: 'रबी' },
  { id: '7', name: 'मूँगफली', emoji: '🥜', price: 6100, change: 0.5, trend: 'up', season: 'खरीफ' },
  { id: '8', name: 'बाजरा', emoji: '🌾', price: 2500, change: -2.0, trend: 'down', season: 'खरीफ' },
  { id: '9', name: 'जौ', emoji: '🌾', price: 1850, change: 0.3, trend: 'up', season: 'रबी' },
  { id: '10', name: 'अरहर दाल', emoji: '🫘', price: 7200, change: 3.2, trend: 'up', season: 'खरीफ' },
];

interface Crop {
  id: string;
  name: string;
  emoji: string;
  price: number;
  change: number;
  trend: 'up' | 'down';
  season: string;
}

export default function MarketScreen() {
  const [search, setSearch] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('लखनऊ मंडी');
  const [showMandi, setShowMandi] = useState(false);
  const [crops, setCrops] = useState<Crop[]>(STATIC_CROPS);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchAIAdvice = useCallback(async (cropData: Crop[]) => {
    if (!ANTHROPIC_KEY || ANTHROPIC_KEY === 'your_anthropic_api_key_here') {
      setAiAdvice('🤖 AI मंडी सलाह: गेहूँ और मूँगफली की कीमतें इस हफ्ते बढ़ रही हैं। बाजार की स्थिति के अनुसार बेचने का सही समय चुनें।');
      return;
    }
    setAiLoading(true);
    try {
      const topUp = cropData.filter(c => c.trend === 'up').slice(0, 3).map(c => `${c.name} ₹${c.price} (+${c.change}%)`).join(', ');
      const topDown = cropData.filter(c => c.trend === 'down').slice(0, 2).map(c => `${c.name} ₹${c.price} (-${c.change}%)`).join(', ');
      const prompt = `मंडी में आज: बढ़त - ${topUp}. गिरावट - ${topDown}. किसान को 2 वाक्यों में बेचने/खरीदने की सलाह दें। इमोजी से शुरू करें।`;
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

  const loadMarketData = useCallback(async () => {
    // Simulate small price variations on refresh (real app would call a mandi API)
    const updated = STATIC_CROPS.map(c => ({
      ...c,
      price: c.price + Math.floor((Math.random() - 0.5) * 40),
      change: parseFloat((c.change + (Math.random() - 0.5) * 0.3).toFixed(1)),
    }));
    setCrops(updated);
    setLastUpdated(new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }));
    await fetchAIAdvice(updated);
    setRefreshing(false);
  }, [fetchAIAdvice]);

  useEffect(() => {
    loadMarketData();
  }, [selectedMandi]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMarketData();
  };

  const filtered = crops.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[Colors.darkMid, Colors.dark]} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>📊 मंडी भाव</Text>
          {lastUpdated ? <Text style={styles.updatedText}>🕐 {lastUpdated}</Text> : null}
        </View>
        <TouchableOpacity style={styles.mandiSelect} onPress={() => setShowMandi(!showMandi)}>
          <Text style={styles.mandiText}>📍 {selectedMandi}</Text>
          <Text style={styles.mandiCaret}>▾</Text>
        </TouchableOpacity>
        {showMandi && (
          <View style={styles.mandiDropdown}>
            {MANDIS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.mandiOption, m === selectedMandi && styles.mandiOptionActive]}
                onPress={() => { setSelectedMandi(m); setShowMandi(false); }}
              >
                <Text style={[styles.mandiOptionText, m === selectedMandi && { color: Colors.primary }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        ListHeaderComponent={
          <>
            {/* Search */}
            <View style={styles.searchBox}>
              <Text style={{ fontSize: 16 }}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="फसल खोजें... (गेहूँ, धान, मक्का)"
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={Colors.textMuted}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Text style={{ color: Colors.textMuted, fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Summary row */}
            <View style={styles.summaryRow}>
              {[
                { icon: '📈', label: 'बढ़त', count: crops.filter(c => c.trend === 'up').length, color: Colors.primary },
                { icon: '📉', label: 'गिरावट', count: crops.filter(c => c.trend === 'down').length, color: Colors.danger },
                { icon: '🏷️', label: 'कुल फसल', count: crops.length, color: Colors.secondary },
              ].map((s) => (
                <View key={s.label} style={[styles.summaryCard, { borderColor: s.color + '30' }]}>
                  <Text style={{ fontSize: 20 }}>{s.icon}</Text>
                  <Text style={[styles.summaryCount, { color: s.color }]}>{s.count}</Text>
                  <Text style={styles.summaryLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <SectionHeader title="🌾 आज के भाव" style={{ paddingHorizontal: 16, marginTop: 4 }} />
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cropCard} activeOpacity={0.85}>
            <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
            <View style={styles.cropInfo}>
              <Text style={styles.cropName}>{item.name}</Text>
              <Text style={styles.cropSeason}>मौसम: {item.season}</Text>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.priceVal}>₹{item.price.toLocaleString('hi-IN')}</Text>
              <Text style={styles.priceUnit}>/क्विंटल</Text>
              <View style={[styles.changeBadge, { backgroundColor: item.trend === 'up' ? Colors.successBg : Colors.dangerBg }]}>
                <Text style={[styles.changeText, { color: item.trend === 'up' ? Colors.success : Colors.danger }]}>
                  {item.trend === 'up' ? '▲' : '▼'} {Math.abs(item.change)}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListFooterComponent={
          <View style={styles.aiBox}>
            <Text style={{ fontSize: 22 }}>{aiLoading ? '⏳' : '🤖'}</Text>
            {aiLoading
              ? <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 8 }} />
              : <Text style={styles.aiText}>{aiAdvice}</Text>
            }
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingHorizontal: 18, paddingBottom: 20,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  updatedText: { fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: '600' },
  mandiSelect: {
    backgroundColor: 'rgba(255,255,255,.15)', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,255,255,.2)',
  },
  mandiText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  mandiCaret: { color: '#fff', fontSize: 16 },
  mandiDropdown: {
    backgroundColor: '#fff', borderRadius: 12, marginTop: 6,
    overflow: 'hidden', elevation: 8, zIndex: 100,
  },
  mandiOption: { paddingHorizontal: 16, paddingVertical: 13 },
  mandiOptionActive: { backgroundColor: Colors.primaryBg },
  mandiOptionText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', margin: 16, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12,
    alignItems: 'center', gap: 4, borderWidth: 1.5,
  },
  summaryCount: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  cropCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  cropInfo: { flex: 1 },
  cropName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  cropSeason: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  priceBlock: { alignItems: 'flex-end', gap: 3 },
  priceVal: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  priceUnit: { fontSize: 11, color: Colors.textMuted },
  changeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  changeText: { fontSize: 12, fontWeight: '800' },
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  aiBox: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: Colors.primaryBg, margin: 16, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 80,
  },
  aiText: { flex: 1, fontSize: 14, color: Colors.primaryDark, lineHeight: 20 },
});
