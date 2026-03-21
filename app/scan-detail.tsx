import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform, Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useApp } from '../contexts/AppContext';
import { ConfidenceBar } from '../components/UI';

export default function ScanDetailScreen() {
  const { id } = useLocalSearchParams();
  const { scanHistory } = useApp();
  const scan = scanHistory.find(s => s.id === id);

  if (!scan) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🔍</Text>
        <Text style={styles.notFound}>स्कैन नहीं मिला</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← वापस जाएं</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sevColor = { high: Colors.danger, medium: Colors.gold, low: Colors.primary }[scan.severity as string || 'medium'] || Colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>स्कैन विवरण</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {scan.imageUri ? (
          <Image source={{ uri: scan.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}><Text style={{ fontSize: 72 }}>🌿</Text></View>
        )}

        <View style={styles.body}>
          <Text style={styles.date}>
            📅 {new Date(scan.date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>

          <View style={styles.diseaseCard}>
            <View style={[styles.badge, { backgroundColor: sevColor + '20' }]}>
              <Text style={[styles.badgeText, { color: sevColor }]}>
                {{ high: 'गंभीर', medium: 'मध्यम', low: 'हल्का' }[scan.severity as string || 'medium'] || 'मध्यम'} रोग
              </Text>
            </View>
            <Text style={styles.diseaseName}>{scan.diseaseName}</Text>
            <Text style={styles.confLabel}>विश्वसनीयता: {scan.confidence}%</Text>
            <ConfidenceBar value={scan.confidence} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 लक्षण</Text>
            <Text style={styles.sectionBody}>{scan.symptoms}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💊 उपचार</Text>
            {Array.isArray(scan.treatment)
              ? scan.treatment.map((t: string, i: number) => (
                  <View key={i} style={styles.treatStep}>
                    <View style={styles.stepNum}><Text style={styles.stepNumTxt}>{i + 1}</Text></View>
                    <Text style={styles.stepTxt}>{t}</Text>
                  </View>
                ))
              : <Text style={styles.sectionBody}>{scan.treatment}</Text>
            }
          </View>

          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => router.push({ pathname: '/chat', params: { disease: scan.diseaseName, symptoms: scan.symptoms } })}
          >
            <Text style={styles.chatBtnTxt}>🤖 इस रोग के बारे में AI से पूछें</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFound: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  backLink: { fontSize: 14, color: Colors.secondary, fontWeight: '600' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 20, color: Colors.textPrimary },
  scroll: { paddingBottom: 40 },
  image: { width: '100%', height: 280 },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, gap: 14 },
  date: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  diseaseCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  diseaseName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  confLabel: { fontSize: 12, color: Colors.textMuted },
  section: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.primaryDark, marginBottom: 8 },
  sectionBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  treatStep: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  stepTxt: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  chatBtn: { backgroundColor: '#8b5cf6', borderRadius: 14, padding: 16, alignItems: 'center' },
  chatBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
