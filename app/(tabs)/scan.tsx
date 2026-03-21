import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../contexts/AppContext';
import { EmptyState, Button } from '../../components/UI';

export default function ScanScreen() {
  const { scanHistory, clearHistory } = useApp();

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('अनुमति आवश्यक', 'गैलरी एक्सेस के लिए अनुमति दें');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: '/analyzing',
        params: {
          imageBase64: result.assets[0].base64 || '',
          imageUri: result.assets[0].uri,
        },
      });
    }
  };

  const severityColor = (severity: string) => ({
    high: Colors.danger,
    medium: Colors.gold,
    low: Colors.primary,
  }[severity] || Colors.primary);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => router.push({ pathname: '/scan-detail', params: { id: item.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.historyImageBox}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.historyImage} />
        ) : (
          <Text style={{ fontSize: 36 }}>🌿</Text>
        )}
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyDisease} numberOfLines={1}>{item.diseaseName}</Text>
        <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString('hi-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
        })}</Text>
        <View style={styles.historyMeta}>
          <View style={[styles.severityBadge, { backgroundColor: severityColor(item.severity || 'medium') + '20' }]}>
            <Text style={[styles.severityText, { color: severityColor(item.severity || 'medium') }]}>
              {item.confidence || 87}% विश्वसनीय
            </Text>
          </View>
        </View>
      </View>
      <Text style={{ fontSize: 20, color: Colors.textMuted }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[Colors.darkMid, Colors.dark]} style={styles.header}>
        <Text style={styles.headerTitle}>🔬 रोग पहचान</Text>
        <Text style={styles.headerSub}>फसल की फ़ोटो से AI रोग पहचान करेगा</Text>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
          onPress={() => router.push('/camera')}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 36 }}>📷</Text>
          <Text style={styles.actionBtnLabel}>कैमरा</Text>
          <Text style={styles.actionBtnSub}>तस्वीर लें</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.secondary }]}
          onPress={pickFromGallery}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 36 }}>🖼️</Text>
          <Text style={styles.actionBtnLabel}>गैलरी</Text>
          <Text style={styles.actionBtnSub}>तस्वीर चुनें</Text>
        </TouchableOpacity>
      </View>

      {/* Info tip */}
      <View style={styles.tip}>
        <Text style={{ fontSize: 18 }}>💡</Text>
        <Text style={styles.tipText}>
          पत्ती का पास से साफ फ़ोटो लें। AI 90%+ सटीकता से रोग पहचानेगा।
        </Text>
      </View>

      {/* History */}
      <View style={styles.historySection}>
        <View style={styles.historySectionHead}>
          <Text style={styles.historySectionTitle}>📋 स्कैन इतिहास</Text>
          {scanHistory.length > 0 && (
            <TouchableOpacity onPress={() => Alert.alert('इतिहास साफ़ करें?', 'क्या आप सारा इतिहास हटाना चाहते हैं?', [
              { text: 'रद्द करें', style: 'cancel' },
              { text: 'हाँ, हटाएं', style: 'destructive', onPress: clearHistory },
            ])}>
              <Text style={styles.clearBtn}>साफ़ करें</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={scanHistory.length > 0 ? scanHistory : DEMO_HISTORY}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 80 }}
          ListEmptyComponent={
            <EmptyState
              icon="🔬"
              title="कोई स्कैन नहीं"
              subtitle="ऊपर कैमरा या गैलरी से फसल स्कैन करें"
            />
          }
        />
      </View>
    </View>
  );
}

const DEMO_HISTORY = [
  { id: 'd1', diseaseName: 'पत्ती झुलसा रोग', date: new Date().toISOString(), confidence: 91, severity: 'high', imageUri: null },
  { id: 'd2', diseaseName: 'पाउडरी मिल्ड्यू', date: new Date(Date.now() - 86400000).toISOString(), confidence: 87, severity: 'medium', imageUri: null },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 4 },
  actionRow: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    gap: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  actionBtnLabel: { fontSize: 18, fontWeight: '800', color: '#fff' },
  actionBtnSub: { fontSize: 13, color: 'rgba(255,255,255,.8)' },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBg,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipText: { flex: 1, fontSize: 13, color: Colors.primaryDark, lineHeight: 18 },
  historySection: { flex: 1, marginTop: 16 },
  historySectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  historySectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.primaryDark },
  clearBtn: { fontSize: 13, color: Colors.danger, fontWeight: '600' },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
  },
  historyImageBox: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  historyImage: { width: 64, height: 64 },
  historyInfo: { flex: 1 },
  historyDisease: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  historyDate: { fontSize: 12, color: Colors.textMuted, marginTop: 3 },
  historyMeta: { flexDirection: 'row', marginTop: 5 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  severityText: { fontSize: 11, fontWeight: '700' },
});
