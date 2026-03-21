import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, Switch, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as ExpoNotifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIF_DATA = [
  { id: '1', icon: '🌧️', title: 'कल भारी बारिश संभव', body: 'आपके क्षेत्र में कल दोपहर 3 बजे से 75% बारिश की संभावना है। सिंचाई और खाद डालना टालें।', time: 'अभी', type: 'weather', read: false },
  { id: '2', icon: '🐛', title: 'कीट प्रकोप अलर्ट', body: 'आपके क्षेत्र में सफेद मक्खी रिपोर्ट हुई है। तुरंत इमिडाक्लोप्रिड 0.5 मिली/लीटर छिड़काव करें।', time: '2 घंटे पहले', type: 'pest', read: false },
  { id: '3', icon: '📈', title: 'गेहूँ भाव बढ़ा', body: 'लखनऊ मंडी में गेहूँ ₹2,250/क्विंटल — कल से ₹85 ज्यादा। बेचने का अच्छा समय!', time: '4 घंटे पहले', type: 'market', read: true },
  { id: '4', icon: '🌱', title: 'फसल सलाह', body: 'मौसम के अनुसार इस सप्ताह रबी बुआई के लिए आदर्श समय है। गेहूँ और सरसों बोएं।', time: 'कल', type: 'advisory', read: true },
  { id: '5', icon: '💰', title: 'PM-KISAN किश्त', body: 'PM-KISAN की अगली किश्त ₹2,000 अगले सोमवार आने वाली है। खाता जाँचें।', time: '2 दिन पहले', type: 'scheme', read: true },
  { id: '6', icon: '☀️', title: 'मौसम सुधरेगा', body: 'अगले 3 दिन धूप रहेगी। कटाई और सुखाई के लिए उत्तम समय।', time: '3 दिन पहले', type: 'weather', read: true },
];

const NOTIF_SETTINGS = [
  { key: 'weather', label: '🌦️ मौसम अलर्ट', sub: 'बारिश, आंधी, पाला की सूचना' },
  { key: 'pest', label: '🐛 कीट अलर्ट', sub: 'कीट प्रकोप की चेतावनी' },
  { key: 'market', label: '📊 मंडी भाव', sub: 'फसल की कीमत बदलने पर' },
  { key: 'advisory', label: '🌱 फसल सलाह', sub: 'बुआई, कटाई, खाद सुझाव' },
  { key: 'scheme', label: '💰 सरकारी योजनाएं', sub: 'PM-KISAN, बीमा अपडेट' },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(NOTIF_DATA);
  const [settings, setSettings] = useState<Record<string, boolean>>({
    weather: true, pest: true, market: true, advisory: true, scheme: true,
  });
  const [permGranted, setPermGranted] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifs' | 'settings'>('notifs');
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    if (Platform.OS === 'web') return;
    const { status: existing } = await ExpoNotifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await ExpoNotifications.requestPermissionsAsync();
      finalStatus = status;
    }
    setPermGranted(finalStatus === 'granted');

    if (finalStatus === 'granted') {
      // Schedule a test notification
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: '🌾 KisanAI सक्रिय है!',
          body: 'आपके खेत की सुरक्षा के लिए हम तैयार हैं।',
          sound: true,
        },
        trigger: { seconds: 2 } as any,
      });
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const sendTestNotif = async () => {
    if (!permGranted) { await registerForPushNotifications(); return; }
    await ExpoNotifications.scheduleNotificationAsync({
      content: {
        title: '🌾 Rohit AI - टेस्ट अलर्ट',
        body: 'नोटिफिकेशन सही से काम कर रही है! 🎉',
        sound: true,
      },
      trigger: { seconds: 1 } as any,
    });
  };

  const typeColor = (type: string) => ({
    weather: '#1565c0', pest: Colors.danger, market: Colors.primary,
    advisory: Colors.secondary, scheme: Colors.gold,
  }[type] || Colors.primary);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[Colors.darkMid, Colors.dark]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🔔 नोटिफिकेशन</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} नई सूचनाएं</Text>
          )}
        </View>
        <TouchableOpacity onPress={sendTestNotif} style={styles.testBtn}>
          <Text style={{ color: Colors.gold, fontSize: 12, fontWeight: '700' }}>टेस्ट</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Permission banner */}
      {!permGranted && (
        <TouchableOpacity style={styles.permBanner} onPress={registerForPushNotifications}>
          <Text style={styles.permBannerText}>⚠️ नोटिफिकेशन अनुमति दें — टैप करें</Text>
        </TouchableOpacity>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'notifs', label: `सूचनाएं ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
          { key: 'settings', label: '⚙️ सेटिंग्स' },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key as any)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'notifs' ? (
        <>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
              <Text style={styles.markAllText}>✓ सभी पढ़े हुए चिह्नित करें</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={notifications}
            keyExtractor={n => n.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.notifCard, !item.read && styles.notifCardUnread]}
                onPress={() => markRead(item.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.notifIconBox, { backgroundColor: typeColor(item.type) + '18' }]}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitle, !item.read && { color: Colors.primaryDark }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: typeColor(item.type) + '18' }]}>
                  <Text style={[styles.typeText, { color: typeColor(item.type) }]}>
                    {{ weather: 'मौसम', pest: 'कीट', market: 'मंडी', advisory: 'सलाह', scheme: 'योजना' }[item.type]}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
          />
        </>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
          <Text style={styles.settingsTitle}>अलर्ट प्राथमिकताएं</Text>
          {NOTIF_SETTINGS.map(s => (
            <View key={s.key} style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{s.label}</Text>
                <Text style={styles.settingSub}>{s.sub}</Text>
              </View>
              <Switch
                value={settings[s.key]}
                onValueChange={v => setSettings(prev => ({ ...prev, [s.key]: v }))}
                trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
                thumbColor={settings[s.key] ? Colors.primary : '#f4f3f4'}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.testNotifBtn} onPress={sendTestNotif}>
            <Text style={styles.testNotifText}>🔔 टेस्ट नोटिफिकेशन भेजें</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: Platform.OS === 'ios' ? 54 : 32, paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.15)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,.65)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  testBtn: { backgroundColor: 'rgba(244,185,66,.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  permBanner: { backgroundColor: '#fff3e0', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderColor: '#ffe0b2' },
  permBannerText: { fontSize: 13, fontWeight: '700', color: Colors.gold },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: Colors.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },
  markAllBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.primaryBg },
  markAllText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  notifCard: { flexDirection: 'row', gap: 12, padding: 14, backgroundColor: '#fff', alignItems: 'flex-start' },
  notifCardUnread: { backgroundColor: '#f0f7ff' },
  notifIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  notifBody: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  notifTime: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  typeText: { fontSize: 10, fontWeight: '800' },
  sep: { height: 1, backgroundColor: Colors.border },
  settingsTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  settingLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  settingSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  testNotifBtn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  testNotifText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
