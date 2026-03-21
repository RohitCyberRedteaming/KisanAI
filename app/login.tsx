import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

interface Props {
  onLogin: (name: string, phone: string, location: string) => void;
}

const STATES = ['उत्तर प्रदेश', 'मध्य प्रदेश', 'राजस्थान', 'हरियाणा', 'पंजाब', 'महाराष्ट्र', 'गुजरात', 'बिहार', 'झारखंड', 'छत्तीसगढ़'];

export default function LoginScreen({ onLogin }: Props) {
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('लखनऊ, उत्तर प्रदेश');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = async () => {
    if (phone.length !== 10) {
      Alert.alert('गलत नंबर', 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }
    setLoading(true);
    // Generate 6-digit OTP (in production use real SMS service like MSG91/Fast2SMS)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    await new Promise(r => setTimeout(r, 1000)); // simulate API call
    setLoading(false);
    setOtpSent(true);
    setStep('otp');
    // Show OTP in alert for demo (remove in production)
    Alert.alert('OTP भेजा गया', `Demo OTP: ${code}\n\nनोट: असली ऐप में SMS से आएगा`, [{ text: 'ठीक है' }]);
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('गलत OTP', '6 अंकों का OTP दर्ज करें');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    if (otp === generatedOtp || otp === '123456') { // 123456 master OTP for testing
      setStep('profile');
    } else {
      Alert.alert('गलत OTP', 'OTP गलत है। पुनः प्रयास करें।');
    }
  };

  const completeProfile = () => {
    if (!name.trim()) {
      Alert.alert('नाम आवश्यक', 'कृपया अपना नाम दर्ज करें');
      return;
    }
    onLogin(name.trim(), phone, location);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#1a4d14', '#2d7a27', '#3d9a35']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoArea}>
            <Text style={styles.logoEmoji}>🌾</Text>
            <Text style={styles.logoTitle}>KisanAI</Text>
            <Text style={styles.logoSub}>स्मार्ट खेती, बेहतर उपज</Text>
          </View>

          <View style={styles.card}>
            {/* Step: Phone */}
            {step === 'phone' && (
              <>
                <Text style={styles.cardTitle}>📱 मोबाइल से लॉगिन</Text>
                <Text style={styles.cardSub}>OTP से सुरक्षित लॉगिन करें</Text>

                <View style={styles.inputRow}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 अंकों का नंबर"
                    placeholderTextColor="#aaa"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.btn, phone.length !== 10 && styles.btnDisabled]}
                  onPress={sendOtp}
                  disabled={phone.length !== 10 || loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>OTP भेजें →</Text>}
                </TouchableOpacity>

                <Text style={styles.terms}>लॉगिन करके आप हमारी सेवा शर्तें स्वीकार करते हैं</Text>
              </>
            )}

            {/* Step: OTP */}
            {step === 'otp' && (
              <>
                <Text style={styles.cardTitle}>🔐 OTP दर्ज करें</Text>
                <Text style={styles.cardSub}>+91 {phone} पर भेजा गया</Text>

                <TextInput
                  style={styles.otpInput}
                  value={otp}
                  onChangeText={t => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6 अंकों का OTP"
                  placeholderTextColor="#aaa"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.btn, otp.length !== 6 && styles.btnDisabled]}
                  onPress={verifyOtp}
                  disabled={otp.length !== 6 || loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>✅ सत्यापित करें</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); }} style={styles.backLink}>
                  <Text style={styles.backLinkText}>← नंबर बदलें</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={sendOtp} style={styles.resendLink}>
                  <Text style={styles.resendText}>OTP नहीं मिला? फिर भेजें</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step: Profile */}
            {step === 'profile' && (
              <>
                <Text style={styles.cardTitle}>🧑‍🌾 प्रोफ़ाइल बनाएं</Text>
                <Text style={styles.cardSub}>एक बार दर्ज करें, हमेशा के लिए सेव</Text>

                <Text style={styles.label}>आपका नाम *</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="जैसे: रामेश्वर यादव"
                  placeholderTextColor="#aaa"
                  autoFocus
                />

                <Text style={styles.label}>जिला / राज्य</Text>
                <TextInput
                  style={styles.textInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="जैसे: लखनऊ, उत्तर प्रदेश"
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.label}>राज्य चुनें</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {STATES.map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.stateChip, location.includes(s.split(' ')[0]) && styles.stateChipActive]}
                        onPress={() => setLocation(`लखनऊ, ${s}`)}
                      >
                        <Text style={[styles.stateChipText, location.includes(s.split(' ')[0]) && styles.stateChipTextActive]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.btn, !name.trim() && styles.btnDisabled]}
                  onPress={completeProfile}
                  disabled={!name.trim()}
                >
                  <Text style={styles.btnText}>🚀 KisanAI शुरू करें</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Progress dots */}
          <View style={styles.dots}>
            {['phone', 'otp', 'profile'].map((s, i) => (
              <View key={s} style={[styles.dot, step === s && styles.dotActive,
                (['phone', 'otp', 'profile'].indexOf(step) > i) && styles.dotDone]} />
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  logoArea: { alignItems: 'center', marginBottom: 32, gap: 6 },
  logoEmoji: { fontSize: 64 },
  logoTitle: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  logoSub: { fontSize: 15, color: 'rgba(255,255,255,.75)', fontWeight: '600' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 13, color: Colors.textMuted, marginBottom: 20 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  countryCode: { backgroundColor: Colors.primaryBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: Colors.border, justifyContent: 'center' },
  countryText: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark },
  phoneInput: { flex: 1, backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, fontWeight: '700', color: Colors.textPrimary, borderWidth: 1.5, borderColor: Colors.border, letterSpacing: 2 },
  otpInput: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 28, fontWeight: '800', color: Colors.textPrimary, borderWidth: 1.5, borderColor: Colors.border, letterSpacing: 8, textAlign: 'center', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6 },
  textInput: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: Colors.textPrimary, borderWidth: 1.5, borderColor: Colors.border, marginBottom: 14 },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  terms: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 16 },
  backLink: { alignItems: 'center', marginTop: 14 },
  backLinkText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  resendLink: { alignItems: 'center', marginTop: 8 },
  resendText: { fontSize: 13, color: Colors.secondary, fontWeight: '600' },
  stateChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
  stateChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  stateChipText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  stateChipTextActive: { color: Colors.primaryDark },
  dots: { flexDirection: 'row', gap: 8, marginTop: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.3)' },
  dotActive: { width: 24, backgroundColor: '#fff' },
  dotDone: { backgroundColor: 'rgba(255,255,255,.7)' },
});
