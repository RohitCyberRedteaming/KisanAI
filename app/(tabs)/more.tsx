import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Card, SectionHeader } from '../../components/UI';
import { useApp } from '../../contexts/AppContext';


const FEATURES = [
  { icon: '🤖', label: 'Rohit AI', sub: 'कृषि विशेषज्ञ से पूछें', color: '#8b5cf6', route: '/chat' },
  { icon: '🌱', label: 'फसल सुझाव', sub: 'AI से सर्वोत्तम फसल जानें', color: Colors.primary, route: null, screen: 'crops' },
  { icon: '👥', label: 'किसान समुदाय', sub: 'किसानों से जुड़ें', color: Colors.earth, route: null, screen: 'community' },
  { icon: '📡', label: 'IoT स्मार्ट खेती', sub: 'सेंसर डेटा देखें', color: Colors.secondary, route: null, screen: 'iot' },
  { icon: '🛰️', label: 'सैटेलाइट डेटा', sub: 'NDVI फसल स्वास्थ्य', color: '#00897b', route: null, screen: 'satellite' },
  { icon: '📋', label: 'योजनाएँ', sub: 'सरकारी कृषि योजनाएँ', color: Colors.gold, route: null, screen: 'schemes' },
];

export default function MoreScreen() {
  const { farmerName, farmerPhone, farmerLocation, scanHistory, logout } = useApp();

  const handleLogout = () => {
    Alert.alert('लॉगआउट', 'क्या आप लॉगआउट करना चाहते हैं?', [
      { text: 'रद्द करें', style: 'cancel' },
      { text: 'हाँ, लॉगआउट', style: 'destructive', onPress: logout },
    ]);
  };
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleFeature = (f: typeof FEATURES[0]) => {
    if (f.route) {
      router.push(f.route as any);
    } else {
      setActiveSection(f.screen || null);
    }
  };

  if (activeSection === 'crops') return <CropsSection onBack={() => setActiveSection(null)} />;
  if (activeSection === 'community') return <CommunitySection onBack={() => setActiveSection(null)} />;
  if (activeSection === 'iot') return <IoTSection onBack={() => setActiveSection(null)} />;
  if (activeSection === 'satellite') return <SatelliteSection onBack={() => setActiveSection(null)} />;
  if (activeSection === 'schemes') return <SchemesSection onBack={() => setActiveSection(null)} />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.darkMid, Colors.dark]} style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}><Text style={{ fontSize: 36 }}>🧑‍🌾</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.farmerName}>{farmerName}</Text>
            <Text style={styles.farmerLoc}>📍 {farmerLocation}</Text>
            {farmerPhone ? <Text style={styles.farmerPhone}>📱 +91 {farmerPhone}</Text> : null}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={{ color: Colors.danger, fontSize: 13, fontWeight: '700' }}>🚪 लॉगआउट</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileStats}>
          {[
            { val: String(scanHistory.length || 12), lbl: 'स्कैन' },
            { val: '3', lbl: 'फसलें' },
            { val: '₹2.4L', lbl: 'आय' },
            { val: '5⭐', lbl: 'रेटिंग' },
          ].map((s) => (
            <View key={s.lbl} style={styles.profileStat}>
              <Text style={styles.profileStatVal}>{s.val}</Text>
              <Text style={styles.profileStatLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        <SectionHeader title="🔧 सुविधाएँ" />
        <View style={styles.featureGrid}>
          {FEATURES.map((f) => (
            <TouchableOpacity
              key={f.label}
              style={[styles.featureCard, { borderColor: f.color + '30' }]}
              onPress={() => handleFeature(f)}
              activeOpacity={0.8}
            >
              <View style={[styles.featureIcon, { backgroundColor: f.color + '18' }]}>
                <Text style={{ fontSize: 28 }}>{f.icon}</Text>
              </View>
              <Text style={[styles.featureLabel, { color: f.color }]}>{f.label}</Text>
              <Text style={styles.featureSub}>{f.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Crop History */}
        <SectionHeader title="📋 फसल इतिहास" style={{ marginTop: 8 }} />
        <Card style={{ marginBottom: 16 }}>
          {[
            { crop: '🌾', name: 'गेहूँ', period: 'नवंबर 2024 – अप्रैल 2025', area: '2 हेक्टेयर', yield: '48 क्विंटल' },
            { crop: '🌽', name: 'मक्का', period: 'जून – अक्टूबर 2024', area: '1.5 हेक्टेयर', yield: '32 क्विंटल' },
            { crop: '🥜', name: 'मूँगफली', period: 'मार्च – जुलाई 2024', area: '1 हेक्टेयर', yield: '18 क्विंटल' },
          ].map((h, i, arr) => (
            <View key={h.name}>
              <View style={styles.histRow}>
                <Text style={{ fontSize: 28 }}>{h.crop}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histName}>{h.name}</Text>
                  <Text style={styles.histPeriod}>{h.period} · {h.area}</Text>
                </View>
                <Text style={styles.histYield}>{h.yield}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        {/* Settings */}
        <SectionHeader title="⚙️ सेटिंग्स" />
        <Card style={{ marginBottom: 80 }}>
          {[
            { icon: '🌐', label: 'भाषा', val: 'हिंदी' },
            { icon: '🔔', label: 'सूचनाएँ', val: 'चालू' },
            { icon: '📴', label: 'ऑफलाइन मोड', val: 'बंद' },
            { icon: '🔒', label: 'गोपनीयता', val: '' },
            { icon: '⭐', label: 'ऐप रेटिंग करें', val: '' },
          ].map((s, i, arr) => (
            <View key={s.label}>
              <TouchableOpacity style={styles.settingRow} onPress={() => {}}>
                <Text style={{ fontSize: 20 }}>{s.icon}</Text>
                <Text style={styles.settingLabel}>{s.label}</Text>
                <Text style={styles.settingVal}>{s.val}</Text>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

// ── CROPS SECTION ────────────────────────────────
function CropsSection({ onBack }: { onBack: () => void }) {
  const [soil, setSoil] = useState('');
  const [season, setSeason] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [advice, setAdvice] = useState('');

  const SOILS = ['काली मिट्टी', 'लाल मिट्टी', 'दोमट मिट्टी', 'रेतीली मिट्टी', 'चिकनी मिट्टी'];
  const SEASONS = ['खरीफ (जून-नवंबर)', 'रबी (नवंबर-अप्रैल)', 'जायद (अप्रैल-जून)'];
  const REGIONS = ['उत्तर प्रदेश', 'मध्य प्रदेश', 'पंजाब', 'हरियाणा', 'राजस्थान', 'महाराष्ट्र', 'बिहार'];

  const getRecommendation = async () => {
    if (!soil || !season || !region) {
      Alert.alert('⚠️', 'कृपया सभी जानकारी भरें'); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setResults([
      { name: 'गेहूँ', emoji: '🌾', score: 95, yield: '45-50 क्विंटल/हेक्टेयर', price: '₹4,200+' },
      { name: 'मक्का', emoji: '🌽', score: 78, yield: '30-35 क्विंटल/हेक्टेयर', price: '₹2,850' },
      { name: 'मसूर', emoji: '🫘', score: 65, yield: '10-15 क्विंटल/हेक्टेयर', price: '₹5,800' },
    ]);
    setAdvice(`${soil} और ${season} के आधार पर गेहूँ सर्वोत्तम है। HD-2967 या PBW-343 किस्म बोएँ। अनुमानित उपज: 45-50 क्विंटल/हेक्टेयर।`);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.darkMid, Colors.dark]} style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← वापस</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>🌱 AI फसल सुझाव</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}>
        <Card>
          <Text style={styles.formLabel}>मिट्टी का प्रकार</Text>
          <View style={styles.chipRow}>
            {SOILS.map(s => (
              <TouchableOpacity key={s} style={[styles.chip, soil === s && styles.chipActive]} onPress={() => setSoil(s)}>
                <Text style={[styles.chipText, soil === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.formLabel, { marginTop: 14 }]}>मौसम</Text>
          <View style={styles.chipRow}>
            {SEASONS.map(s => (
              <TouchableOpacity key={s} style={[styles.chip, season === s && styles.chipActive]} onPress={() => setSeason(s)}>
                <Text style={[styles.chipText, season === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.formLabel, { marginTop: 14 }]}>राज्य</Text>
          <View style={styles.chipRow}>
            {REGIONS.map(r => (
              <TouchableOpacity key={r} style={[styles.chip, region === r && styles.chipActive]} onPress={() => setRegion(r)}>
                <Text style={[styles.chipText, region === r && styles.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={getRecommendation} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? '🤔 सोच रहा हूँ...' : '🤖 AI सुझाव लें'}</Text>
          </TouchableOpacity>
        </Card>
        {results.map((r, i) => (
          <View key={r.name} style={[styles.cropResult, i === 0 && styles.cropResultBest]}>
            {i === 0 && <View style={styles.bestBadge}><Text style={styles.bestBadgeText}>⭐ सर्वोत्तम</Text></View>}
            <Text style={{ fontSize: 42 }}>{r.emoji}</Text>
            <Text style={styles.cropResultName}>{r.name}</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreFill, { width: `${r.score}%` as any }]} />
            </View>
            <Text style={styles.cropResultDetail}>उपज: {r.yield} · {r.price}</Text>
          </View>
        ))}
        {advice ? (
          <View style={styles.aiAdviceBox}>
            <Text style={{ fontSize: 24 }}>🤖</Text>
            <Text style={styles.aiAdviceText}>{advice}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ── COMMUNITY SECTION ────────────────────────────
function CommunitySection({ onBack }: { onBack: () => void }) {
  const POSTS = [
    { id: '1', user: 'सुरेश कुमार', loc: 'बाराबंकी', avatar: '👨‍🌾', tag: 'गेहूँ', time: '2 घंटे', body: 'मेरे गेहूँ में पत्तियाँ पीली पड़ रही हैं। AI ने "पत्ती झुलसा" बताया। क्या किसी को यही हुआ?', likes: 45, comments: 12 },
    { id: '2', user: 'प्रिया देवी', loc: 'रायबरेली', avatar: '👩‍🌾', tag: 'सब्जी', time: '5 घंटे', body: 'आज मंडी में टमाटर ₹800/क्विंटल मिला! KisanAI की सलाह पर 3 दिन रोका — दोगुना फायदा! 🎉', likes: 128, comments: 34 },
    { id: '3', user: 'राजकुमार सिंह', loc: 'सीतापुर', avatar: '🧑‍🌾', tag: 'धान', time: '1 दिन', body: 'IoT सेंसर लगाया — मिट्टी की नमी सीधे फोन पर। पानी 30% बचा!', likes: 89, comments: 21 },
  ];
  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.darkMid, Colors.dark]} style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backBtnText}>← वापस</Text></TouchableOpacity>
        <Text style={styles.subHeaderTitle}>👥 किसान समुदाय</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}>
        {POSTS.map(p => (
          <Card key={p.id}>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 28 }}>{p.avatar}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', fontSize: 14, color: Colors.textPrimary }}>{p.user}</Text>
                <Text style={{ fontSize: 12, color: Colors.textMuted }}>📍 {p.loc} · {p.time} पहले · #{p.tag}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 }}>{p.body}</Text>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Text>👍</Text><Text style={{ fontSize: 13, color: Colors.textMuted, fontWeight: '600' }}>{p.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Text>💬</Text><Text style={{ fontSize: 13, color: Colors.textMuted, fontWeight: '600' }}>{p.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Text>🔁</Text><Text style={{ fontSize: 13, color: Colors.textMuted, fontWeight: '600' }}>शेयर</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

// ── IOT SECTION ──────────────────────────────────
function IoTSection({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.darkMid, Colors.dark]} style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backBtnText}>← वापस</Text></TouchableOpacity>
        <Text style={styles.subHeaderTitle}>📡 IoT स्मार्ट खेती</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { icon: '💧', val: '68%', lbl: 'मिट्टी नमी', bg: Colors.secondaryBg },
            { icon: '🌡️', val: '28°C', lbl: 'मिट्टी तापमान', bg: Colors.goldBg },
            { icon: '🧪', val: '6.8 pH', lbl: 'pH स्तर', bg: Colors.primaryBg },
            { icon: '⚡', val: 'ON', lbl: 'पंप', bg: Colors.dangerBg },
          ].map(s => (
            <View key={s.lbl} style={[styles.iotStat, { backgroundColor: s.bg }]}>
              <Text style={{ fontSize: 22 }}>{s.icon}</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textPrimary }}>{s.val}</Text>
              <Text style={{ fontSize: 10, color: Colors.textMuted, textAlign: 'center' }}>{s.lbl}</Text>
            </View>
          ))}
        </View>
        <View style={styles.aiAdviceBox}>
          <Text style={{ fontSize: 22 }}>🤖</Text>
          <Text style={styles.aiAdviceText}>मिट्टी की नमी 68% — सिंचाई की अभी जरूरत नहीं। कल बारिश के बाद नमी और बढ़ेगी। पंप बुधवार को चालू करें।</Text>
        </View>
        <Card>
          <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 12, color: Colors.primaryDark }}>📡 सेंसर स्थिति</Text>
          {[
            { name: 'सेंसर 1 – खेत A', status: '✅ जुड़ा हुआ', statusColor: Colors.primary, detail: 'नमी: 68% | तापमान: 28°C' },
            { name: 'सेंसर 2 – खेत B', status: '⚠️ कम बैटरी', statusColor: Colors.warning, detail: 'नमी: 55% | तापमान: 29°C' },
          ].map(s => (
            <View key={s.name} style={styles.sensorRow}>
              <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>{s.name}</Text>
              <Text style={{ color: s.statusColor, fontWeight: '700', fontSize: 13 }}>{s.status}</Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted }}>{s.detail}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

// ── SATELLITE SECTION ─────────────────────────────
function SatelliteSection({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.darkMid, Colors.dark]} style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backBtnText}>← वापस</Text></TouchableOpacity>
        <Text style={styles.subHeaderTitle}>🛰️ सैटेलाइट विश्लेषण</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}>
        <LinearGradient colors={['#1a4d14', '#4dc947']} style={styles.ndviCard}>
          <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>NDVI फसल स्वास्थ्य सूचकांक</Text>
          <Text style={{ fontSize: 64, textAlign: 'center' }}>🛰️</Text>
          <Text style={{ fontSize: 36, fontWeight: '800', color: '#fff', textAlign: 'center' }}>0.72</Text>
          <Text style={{ color: 'rgba(255,255,255,.8)', textAlign: 'center', fontSize: 14 }}>उत्तम फसल स्वास्थ्य</Text>
        </LinearGradient>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { val: '0.72', lbl: 'NDVI स्कोर', bg: Colors.primaryBg, color: Colors.primary },
            { val: '85%', lbl: 'हरित आवरण', bg: Colors.secondaryBg, color: Colors.secondary },
            { val: '15%', lbl: 'तनाव क्षेत्र', bg: Colors.goldBg, color: Colors.warning },
          ].map(s => (
            <View key={s.lbl} style={[styles.ndviStat, { backgroundColor: s.bg }]}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: s.color }}>{s.val}</Text>
              <Text style={{ fontSize: 11, color: Colors.textMuted, textAlign: 'center' }}>{s.lbl}</Text>
            </View>
          ))}
        </View>
        <View style={styles.aiAdviceBox}>
          <Text style={{ fontSize: 22 }}>🛰️</Text>
          <Text style={styles.aiAdviceText}>NDVI 0.72 — उत्तम स्वास्थ्य। उत्तर-पूर्व कोने में हल्का तनाव दिख रहा है। वहाँ 5 दिन में एक बार अतिरिक्त सिंचाई करें।</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ── SCHEMES SECTION ───────────────────────────────
function SchemesSection({ onBack }: { onBack: () => void }) {
  const SCHEMES = [
    { name: 'PM-KISAN', desc: 'प्रति वर्ष ₹6,000 की आर्थिक सहायता किसानों को', icon: '💰', color: Colors.gold },
    { name: 'फसल बीमा योजना', desc: 'प्राकृतिक आपदाओं से फसल नुकसान की भरपाई', icon: '🛡️', color: Colors.secondary },
    { name: 'KCC (किसान क्रेडिट)', desc: 'सस्ती दर पर कृषि ऋण', icon: '💳', color: Colors.primary },
    { name: 'सोलर पंप योजना', desc: '90% सब्सिडी पर सोलर पंप', icon: '☀️', color: Colors.warning },
  ];
  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.darkMid, Colors.dark]} style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backBtnText}>← वापस</Text></TouchableOpacity>
        <Text style={styles.subHeaderTitle}>📋 सरकारी योजनाएँ</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}>
        {SCHEMES.map(s => (
          <TouchableOpacity key={s.name} activeOpacity={0.8}>
            <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <View style={[styles.schemeIcon, { backgroundColor: s.color + '20' }]}>
                <Text style={{ fontSize: 26 }}>{s.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textPrimary }}>{s.name}</Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 }}>{s.desc}</Text>
              </View>
              <Text style={{ fontSize: 20, color: Colors.textMuted }}>›</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: Platform.OS === 'ios' ? 54 : 32, paddingHorizontal: 18, paddingBottom: 20 },
  subHeader: { paddingTop: Platform.OS === 'ios' ? 54 : 32, paddingHorizontal: 18, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  subHeaderTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  backBtn: { padding: 4 },
  backBtnText: { color: Colors.gold, fontWeight: '700', fontSize: 14 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,.3)' },
  farmerName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  farmerLoc: { fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 2 },
  editBtn: { backgroundColor: 'rgba(244,185,66,.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  logoutBtn: { backgroundColor: 'rgba(244,67,54,.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(244,67,54,.2)' },
  farmerPhone: { fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 },
  profileStats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,.1)', borderRadius: 14, padding: 14 },
  profileStat: { alignItems: 'center' },
  profileStatVal: { fontSize: 20, fontWeight: '800', color: '#fff' },
  profileStatLbl: { fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 32 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  featureCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1.5, elevation: 1 },
  featureIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  featureLabel: { fontSize: 14, fontWeight: '800' },
  featureSub: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  histName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  histPeriod: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  histYield: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.border },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  settingLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '600' },
  settingVal: { fontSize: 14, color: Colors.textMuted },
  settingArrow: { fontSize: 20, color: Colors.textMuted },
  formLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cropResult: { backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.border, position: 'relative', overflow: 'hidden' },
  cropResultBest: { borderColor: Colors.primary },
  bestBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 12 },
  bestBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  cropResultName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  scoreBar: { width: '80%', height: 8, backgroundColor: Colors.border, borderRadius: 20, overflow: 'hidden' },
  scoreFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 20 },
  cropResultDetail: { fontSize: 13, color: Colors.textSecondary },
  aiAdviceBox: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: Colors.primaryBg, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border },
  aiAdviceText: { flex: 1, fontSize: 14, color: Colors.primaryDark, lineHeight: 20 },
  iotStat: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  sensorRow: { gap: 4, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border },
  ndviCard: { borderRadius: 18, padding: 24, alignItems: 'center', gap: 8 },
  ndviStat: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 },
  schemeIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
