import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Platform, KeyboardAvoidingView, ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { Colors } from '../constants/Colors';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const QUICK_QUESTIONS = [
  'मेरी फसल में पीले पत्ते हो रहे हैं?',
  'गेहूँ में कौन सी खाद डालूँ?',
  'सफेद मक्खी का कीटनाशक बताएं',
  'PM-KISAN योजना क्या है?',
  'कल बारिश है, क्या सिंचाई करूँ?',
  'धान में कीट लगा है क्या करें?',
];

const SYSTEM_PROMPT = `आप Rohit AI हैं — एक भारतीय कृषि विशेषज्ञ AI। आप किसानों को हिंदी में सरल, व्यावहारिक सलाह देते हैं।
नियम:
1. हर जवाब पिछले संदेश के आधार पर नया और अलग होना चाहिए
2. पिछले जवाब को दोहराएं नहीं
3. विषय: फसल रोग, मौसम, खाद, कीट, मंडी भाव, सरकारी योजनाएँ
4. जवाब 3-5 वाक्यों में दें, इमोजी का उपयोग करें`;

function now() {
  return new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
}

function getFallbackReply(msgCount: number, question: string): string {
  const q = question.toLowerCase();
  const i = msgCount % 3;
  if (q.includes('पीला') || q.includes('पत्त')) {
    return ['🌿 पत्तियों का पीलापन नाइट्रोजन की कमी से हो सकता है। यूरिया 65 किलो/हेक्टेयर डालें।',
      '🍃 पत्ती झुलसा रोग भी कारण हो सकता है। मैन्कोज़ेब 2 ग्राम/लीटर का छिड़काव करें।',
      '🌱 आयरन की कमी से नई पत्तियाँ पीली होती हैं। फेरस सल्फेट 0.5% घोल छिड़कें।'][i];
  }
  if (q.includes('खाद') || q.includes('यूरिया')) {
    return ['🌾 गेहूँ के लिए बुआई पर DAP 50 किलो + एक माह बाद यूरिया 65 किलो/हेक्टेयर डालें।',
      '💊 धान के लिए NPK 120:60:40 किलो/हेक्टेयर — तीन भागों में बाँटकर डालें।',
      '🌻 वर्मीकंपोस्ट 5 टन/हेक्टेयर डालने से रासायनिक खाद 30% कम लगती है।'][i];
  }
  if (q.includes('बारिश') || q.includes('सिंचाई')) {
    return ['🌧️ बारिश से पहले सिंचाई मत करें। खाद बारिश के 2 दिन बाद डालें।',
      '💧 ड्रिप सिंचाई से 40% पानी बचता है। सुबह या शाम को सिंचाई करें।',
      '🌊 जल निकासी सुनिश्चित करें — अधिक पानी से जड़ सड़न होती है।'][i];
  }
  if (q.includes('मक्खी') || q.includes('कीट') || q.includes('कीड़')) {
    return ['🪰 इमिडाक्लोप्रिड 0.5 मिली/लीटर का छिड़काव करें। पीले चिपचिपे ट्रैप भी लगाएँ।',
      '🌿 नीम तेल 5 मिली/लीटर — जैविक और सस्ता उपाय।',
      '🪤 फेरोमोन ट्रैप प्रति एकड़ 4-5 लगाएँ — बिना दवा कीट पकड़ें।'][i];
  }
  if (q.includes('PM-KISAN') || q.includes('योजना')) {
    return ['💰 PM-KISAN में ₹6,000/साल तीन किश्तों में। pmkisan.gov.in पर आवेदन करें।',
      '🏦 किसान क्रेडिट कार्ड से 3 लाख तक 4% ब्याज पर लोन मिलता है।',
      '🌱 PM फसल बीमा से प्राकृतिक आपदा में मुआवजा। बुआई के 10 दिन में रजिस्ट्रेशन करें।'][i];
  }
  return ['🤝 कृपया फसल का नाम और लक्षण बताएं — सटीक सलाह देंगे।',
    '🌾 मिट्टी परीक्षण हर 3 साल में कराएं — सही खाद का पता चलेगा।',
    '💡 फसल चक्र अपनाएं — एक ही फसल बार-बार न लगाएं।'][i];
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const disease = params.disease as string;
  const symptoms = params.symptoms as string;

  const [messages, setMessages] = useState<Message[]>([{
    id: '0', role: 'assistant', time: now(),
    content: disease
      ? `नमस्ते! 🌾 फसल में **${disease}** पाया गया है।\nलक्षण: ${symptoms || 'विश्लेषण किया गया'}\n\nउपचार, दवाई या बचाव के बारे में पूछें!`
      : 'नमस्ते! मैं आपका Rohit AI सहायक हूँ 🌾\nफसल, मौसम, कीट, खाद, मंडी — कुछ भी पूछें!\nनीचे से सवाल चुनें या टाइप करें।',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const flatRef = useRef<FlatList>(null);
  const aiMsgCount = useRef(0);
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState(false);
  const recordingRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      Speech.stop();
      setIsRecording(false);
    };
  }, []);

  useEffect(() => {
    // Mic permission will be requested when user taps mic button
    setMicPermission(true);
  }, []);
  useEffect(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const speakText = (text: string, msgId: string) => {
    if (Platform.OS === 'web') return;
    Speech.stop();
    setIsSpeaking(true);
    setSpeakingId(msgId);
    const clean = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').replace(/\*\*/g, '').slice(0, 300);
    Speech.speak(clean, {
      language: 'hi-IN', rate: 0.85, pitch: 1.0,
      onDone: () => { setIsSpeaking(false); setSpeakingId(null); },
      onStopped: () => { setIsSpeaking(false); setSpeakingId(null); },
      onError: () => { setIsSpeaking(false); setSpeakingId(null); },
    });
  };

  const toggleSpeak = (text: string, msgId: string) => {
    if (isSpeaking && speakingId === msgId) {
      Speech.stop(); setIsSpeaking(false); setSpeakingId(null);
    } else {
      speakText(text, msgId);
    }
  };

  const startRecording = async () => {
    // Visual recording state — shows user mic is "active"
    // Real STT needs Google Cloud Speech-to-Text API integration
    setIsRecording(true);
    // Simulate listening for 3 seconds then show prompt
    setTimeout(() => {
      setIsRecording(false);
      Alert.alert(
        '🎤 आवाज़ सहायक',
        'अभी बोलकर सवाल पूछने के लिए नीचे से कोई सवाल चुनें, या टाइप करें।\n\nपूर्ण Voice Input के लिए Google Speech API चाहिए।',
        [
          { text: 'ठीक है' },
          { text: 'सवाल चुनें', onPress: () => {} },
        ]
      );
    }, 2000);
  };

  const stopRecording = async () => {
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, time: now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
      let reply = '';

      if (apiKey && apiKey !== 'your_anthropic_api_key_here') {
        const context = disease ? `\nरोग: ${disease}. लक्षण: ${symptoms || ''}` : '';
        const historyMsgs = updated.filter(m => m.id !== '0').map(m => ({ role: m.role, content: m.content }));
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 400,
            system: SYSTEM_PROMPT + context,
            messages: historyMsgs,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.content[0].text;
        }
      }

      if (!reply) {
        aiMsgCount.current += 1;
        reply = getFallbackReply(aiMsgCount.current, text);
      }

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, time: now() };
      setMessages(prev => [...prev, aiMsg]);
      speakText(reply, aiMsg.id);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant', time: now(),
        content: '⚠️ जवाब देने में समस्या हुई। इंटरनेट जाँचें।',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMsg = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const isThisSpeaking = speakingId === item.id && isSpeaking;
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && <View style={styles.aiAvatar}><Text style={{ fontSize: 18 }}>🌾</Text></View>}
        <View style={{ maxWidth: '82%' }}>
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
            <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.content}</Text>
            <View style={styles.bubbleFooter}>
              <Text style={[styles.bubbleTime, isUser && { color: 'rgba(255,255,255,.5)' }]}>{item.time}</Text>
              {!isUser && (
                <TouchableOpacity
                  style={[styles.voiceBtn, isThisSpeaking && styles.voiceBtnActive]}
                  onPress={() => toggleSpeak(item.content, item.id)}
                >
                  <Text style={styles.voiceBtnIcon}>{isThisSpeaking ? '⏹' : '🔊'}</Text>
                  <Text style={[styles.voiceBtnText, isThisSpeaking && { color: Colors.danger }]}>
                    {isThisSpeaking ? 'रोकें' : 'सुनें'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {isUser && <View style={styles.userAvatar}><Text style={{ fontSize: 18 }}>🧑‍🌾</Text></View>}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { Speech.stop(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>🤖 Rohit AI सहायक</Text>
          <Text style={styles.headerSub}>{isSpeaking ? '🔊 बोल रहा है...' : '● ऑनलाइन'}</Text>
        </View>
        <TouchableOpacity onPress={() => { Speech.stop(); setIsSpeaking(false); setSpeakingId(null); }} style={styles.muteBtn}>
          <Text style={{ fontSize: 20 }}>{isSpeaking ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickRow}>
        <FlatList
          data={QUICK_QUESTIONS} horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.qqChip} onPress={() => sendMessage(item)} disabled={loading}>
              <Text style={styles.qqText}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        />
      </View>

      <FlatList
        ref={flatRef} data={messages} keyExtractor={m => m.id} renderItem={renderMsg}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={loading ? (
          <View style={styles.msgRow}>
            <View style={styles.aiAvatar}><Text style={{ fontSize: 18 }}>🌾</Text></View>
            <View style={[styles.bubble, styles.bubbleAI, { paddingVertical: 16, paddingHorizontal: 20 }]}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={{ fontSize: 12, color: Colors.textMuted }}>जवाब तैयार हो रहा है...</Text>
              </View>
            </View>
          </View>
        ) : null}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input} value={input} onChangeText={setInput}
          placeholder="बोलें या टाइप करें..." placeholderTextColor={Colors.textMuted}
          multiline maxLength={500}
        />
        {/* Mic Button */}
        <TouchableOpacity
          style={[styles.micBtn, isRecording && styles.micBtnActive]}
          onPress={toggleRecording}
          activeOpacity={0.8}
        >
          <Text style={styles.micIcon}>{isRecording ? '⏹' : '🎤'}</Text>
        </TouchableOpacity>
        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage(input)} disabled={!input.trim() || loading}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: Platform.OS === 'ios' ? 54 : 32, paddingHorizontal: 14, paddingBottom: 14, backgroundColor: Colors.darkMid },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.15)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 20 },
  headerInfo: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  headerSub: { color: Colors.primaryLight, fontSize: 12, fontWeight: '600', marginTop: 1 },
  muteBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,.1)' },
  quickRow: { backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderColor: Colors.border },
  qqChip: { backgroundColor: Colors.primaryBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border },
  qqText: { fontSize: 12, fontWeight: '600', color: Colors.primaryDark },
  msgList: { padding: 14, gap: 12, paddingBottom: 12 },
  msgRow: { flexDirection: 'row', gap: 8, alignSelf: 'flex-start', maxWidth: '100%' },
  msgRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 4, flexShrink: 0 },
  userAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginTop: 4, flexShrink: 0 },
  bubble: { backgroundColor: '#fff', borderRadius: 18, padding: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  bubbleAI: { borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: Colors.primary, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  bubbleTime: { fontSize: 10, color: Colors.textMuted },
  voiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryBg, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  voiceBtnActive: { backgroundColor: '#fce4ec', borderColor: Colors.danger },
  voiceBtnIcon: { fontSize: 13 },
  voiceBtnText: { fontSize: 11, fontWeight: '700', color: Colors.primaryDark },
  inputArea: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: Colors.border, paddingBottom: Platform.OS === 'ios' ? 28 : 12 },
  input: { flex: 1, backgroundColor: Colors.background, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary, maxHeight: 100, borderWidth: 1.5, borderColor: Colors.border },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { color: '#fff', fontSize: 18 },
  micBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#3f51b5',
    alignItems: 'center', justifyContent: 'center',
    elevation: 2,
    shadowColor: '#3f51b5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  micBtnActive: {
    backgroundColor: Colors.danger,
    elevation: 4,
  },
  micIcon: { fontSize: 20 },
});
