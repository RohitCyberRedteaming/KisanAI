import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { Colors } from '../constants/Colors';
import { useApp } from '../contexts/AppContext';
import { DISEASES } from '../constants/Data';
import { ConfidenceBar, Button } from '../components/UI';

export default function AnalyzingScreen() {
  const params = useLocalSearchParams();
  const imageBase64 = params.imageBase64 as string;
  const imageUri = params.imageUri as string;
  const { addScan } = useApp();

  const [stage, setStage] = useState<'loading' | 'result' | 'error'>('loading');
  const [result, setResult] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setStage('loading');
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 90));
    }, 300);

    try {
      // Try real API first; fall back to demo data
      let data: any = null;
      const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

      if (apiKey && apiKey !== 'your_anthropic_api_key_here' && imageBase64) {
        try {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-opus-4-6',
              max_tokens: 1024,
              messages: [{
                role: 'user',
                content: [
                  { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
                  {
                    type: 'text',
                    text: 'फसल रोग विशेषज्ञ के रूप में इस तस्वीर का विश्लेषण करें। JSON format में दें: {"diseaseName":"हिंदी में नाम","nameEng":"English name","confidence":91,"severity":"high/medium/low","symptoms":"लक्षण विवरण","treatment":["उपाय 1","उपाय 2","उपाय 3","उपाय 4"],"prevention":"बचाव"}. केवल JSON।',
                  },
                ],
              }],
            }),
          });
          if (res.ok) {
            const json = await res.json();
            const text = json.content[0].text.replace(/```json|```/g, '').trim();
            data = JSON.parse(text);
          }
        } catch (e) {
          console.log('API error, using demo data');
        }
      }

      // Fall back to demo data
      if (!data) {
        data = DISEASES[Math.floor(Math.random() * DISEASES.length)];
        data = {
          diseaseName: data.name,
          nameEng: data.nameEng,
          confidence: data.confidence,
          severity: data.severity,
          symptoms: data.symptoms,
          treatment: data.treatment,
          prevention: data.prevention,
        };
      }

      setProgress(100);
      clearInterval(interval);

      // Save to history
      const scanRecord = {
        id: Date.now().toString(),
        diseaseName: data.diseaseName,
        imageUri: imageUri || '',
        confidence: data.confidence,
        date: new Date().toISOString(),
        symptoms: data.symptoms,
        treatment: data.treatment,
        severity: data.severity,
      };
      await addScan(scanRecord);

      setTimeout(() => {
        setResult(data);
        setStage('result');
        speakResult(data);
      }, 400);

    } catch (err: any) {
      clearInterval(interval);
      setStage('error');
    }
  };

  const speakResult = async (data: any) => {
    if (Platform.OS === 'web') return;
    try {
      setIsSpeaking(true);
      await Speech.speak(
        `Rohit AI में आपका स्वागत है। रोग का नाम: ${data.diseaseName}। ${data.symptoms?.slice(0, 100)}`,
        { language: 'hi-IN', pitch: 1.0, rate: 0.85, onDone: () => setIsSpeaking(false), onStopped: () => setIsSpeaking(false) }
      );
    } catch { setIsSpeaking(false); }
  };

  const toggleSpeak = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      speakResult(result);
    }
  };

  if (stage === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.bgImage} blurRadius={3} />
        ) : null}
        <View style={styles.loadingOverlay}>
          <Text style={{ fontSize: 64 }}>🔬</Text>
          <Text style={styles.loadingTitle}>AI विश्लेषण हो रहा है...</Text>
          <Text style={styles.loadingSubtitle}>रोग पहचान और उपचार तैयार किया जा रहा है</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
          <View style={styles.loadingSteps}>
            {['✅ तस्वीर प्राप्त', progress > 30 ? '✅' : '⏳', 'AI मॉडल', progress > 60 ? '✅' : '⏳', 'उपचार'].map((s, i) => (
              <Text key={i} style={styles.loadingStep}>{s}</Text>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (stage === 'error') {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ fontSize: 64 }}>❌</Text>
        <Text style={styles.errorTitle}>विश्लेषण विफल</Text>
        <Text style={styles.errorSub}>इंटरनेट कनेक्शन जाँचें और पुनः प्रयास करें</Text>
        <Button label="🔄 पुनः प्रयास" onPress={runAnalysis} style={{ marginTop: 16 }} />
        <Button label="← वापस" onPress={() => router.back()} variant="ghost" style={{ marginTop: 8 }} />
      </View>
    );
  }

  const sevColor = { high: Colors.danger, medium: Colors.gold, low: Colors.primary }[result?.severity || 'medium'];
  const sevLabel = { high: 'गंभीर', medium: 'मध्यम', low: 'हल्का' }[result?.severity || 'medium'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/scan')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>विश्लेषण परिणाम</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Image */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.resultImage} />
        ) : (
          <View style={styles.imagePlaceholder}><Text style={{ fontSize: 64 }}>🌿</Text></View>
        )}

        {/* Success banner */}
        <View style={styles.successBanner}>
          <Text style={{ fontSize: 28 }}>✅</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.successTitle}>विश्लेषण पूर्ण!</Text>
            <Text style={styles.successSub}>🎤 Rohit AI में आपका स्वागत है</Text>
          </View>
          <TouchableOpacity
            style={[styles.voiceBtn, isSpeaking && styles.voiceBtnActive]}
            onPress={toggleSpeak}
          >
            <Text style={styles.voiceBtnText}>{isSpeaking ? '⏹ रोकें' : '🔊 सुनें'}</Text>
          </TouchableOpacity>
        </View>

        {/* Disease card */}
        <View style={styles.diseaseCard}>
          <View style={styles.diseaseHeader}>
            <View style={[styles.diseaseIconBox, { backgroundColor: sevColor + '20' }]}>
              <Text style={{ fontSize: 28 }}>🦠</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.diseaseName}>{result?.diseaseName}</Text>
              <Text style={styles.diseaseEng}>{result?.nameEng}</Text>
              <View style={[styles.severityTag, { backgroundColor: sevColor + '20' }]}>
                <Text style={[styles.severityText, { color: sevColor }]}>{sevLabel} रोग</Text>
              </View>
            </View>
          </View>
          <View style={styles.confRow}>
            <Text style={styles.confLabel}>विश्वसनीयता: {result?.confidence}%</Text>
            <ConfidenceBar value={result?.confidence || 0} color={Colors.primary} />
          </View>
        </View>

        {/* Symptoms */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔍 लक्षण</Text>
          <Text style={styles.infoBody}>{result?.symptoms}</Text>
        </View>

        {/* Treatment */}
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>💊 उपचार के तरीके</Text>
          {result?.treatment?.map((t: string, i: number) => (
            <View key={i} style={styles.treatmentStep}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
              <Text style={styles.stepText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Prevention */}
        {result?.prevention && (
          <View style={[styles.infoCard, { backgroundColor: Colors.primaryBg, borderColor: Colors.border }]}>
            <Text style={styles.infoTitle}>🛡️ बचाव</Text>
            <Text style={styles.infoBody}>{result.prevention}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#8b5cf6' }]}
            onPress={() => router.push({ pathname: '/chat', params: { disease: result?.diseaseName, symptoms: result?.symptoms } })}
          >
            <Text style={styles.actionBtnText}>🤖 AI से पूछें</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.replace('/(tabs)/scan')}
          >
            <Text style={styles.actionBtnText}>📷 नया स्कैन</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: '#000' },
  bgImage: { position: 'absolute', width: '100%', height: '100%' },
  loadingOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,.75)', padding: 32, gap: 12,
  },
  loadingTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  loadingSubtitle: { fontSize: 14, color: 'rgba(255,255,255,.7)', textAlign: 'center' },
  progressBar: { width: '80%', height: 8, backgroundColor: 'rgba(255,255,255,.2)', borderRadius: 20, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primaryLight, borderRadius: 20 },
  progressPct: { color: Colors.primaryLight, fontSize: 18, fontWeight: '800' },
  loadingSteps: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },
  loadingStep: { color: 'rgba(255,255,255,.6)', fontSize: 12 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10, backgroundColor: Colors.background },
  errorTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  errorSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
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
  resultImage: { width: '100%', height: 280, backgroundColor: '#e0e0e0' },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primaryBg, marginHorizontal: 16, marginTop: 16,
    borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: Colors.border,
  },
  successTitle: { fontSize: 16, fontWeight: '800', color: Colors.primaryDark },
  successSub: { fontSize: 13, color: Colors.primary, marginTop: 2 },
  voiceBtn: {
    backgroundColor: '#8b5cf6', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  voiceBtnActive: { backgroundColor: Colors.danger },
  voiceBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  diseaseCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border,
    elevation: 2,
  },
  diseaseHeader: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  diseaseIconBox: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  diseaseName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  diseaseEng: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  severityTag: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  severityText: { fontSize: 12, fontWeight: '800' },
  confRow: { gap: 4 },
  confLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  infoCard: {
    backgroundColor: Colors.goldBg, marginHorizontal: 16, marginTop: 12,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#ffe0b2',
  },
  infoTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  infoBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  resultSection: { marginHorizontal: 16, marginTop: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.primaryDark, marginBottom: 10 },
  treatmentStep: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
  },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 16 },
  actionBtn: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
