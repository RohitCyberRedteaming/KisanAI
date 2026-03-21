import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>📷</Text>
        <Text style={styles.permText}>कैमरा लोड हो रहा है...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 64 }}>📷</Text>
        <Text style={styles.permTitle}>कैमरा अनुमति आवश्यक</Text>
        <Text style={styles.permSub}>फसल की तस्वीर लेने के लिए कैमरा अनुमति दें</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>✅ अनुमति दें</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>रद्द करें</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: true,
        skipProcessing: false,
      });
      if (photo?.base64) {
        router.push({
          pathname: '/analyzing',
          params: { imageBase64: photo.base64, imageUri: photo.uri },
        });
      }
    } catch (err) {
      Alert.alert('त्रुटि', 'तस्वीर लेने में समस्या हुई');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        ref={cameraRef}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>फसल तस्वीर लें</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}
          >
            <Text style={styles.iconBtnText}>{flash === 'on' ? '⚡' : '🔦'}</Text>
          </TouchableOpacity>
        </View>

        {/* Focus frame */}
        <View style={styles.frameContainer}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.frameTip}>पत्ती को फ्रेम के अंदर रखें</Text>
        </View>

        {/* Footer controls */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.flipBtn}
            onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
          >
            <Text style={{ fontSize: 24 }}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureBtn, capturing && styles.captureBtnActive]}
            onPress={takePicture}
            disabled={capturing}
            activeOpacity={0.8}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <View style={{ width: 52 }} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark,
    padding: 32,
    gap: 12,
  },
  permText: { color: '#fff', fontSize: 16 },
  permTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  permSub: { color: 'rgba(255,255,255,.6)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  permBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 14, marginTop: 8,
  },
  permBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelBtn: { paddingVertical: 10 },
  cancelBtnText: { color: 'rgba(255,255,255,.5)', fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,.4)',
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18, color: '#fff' },
  frameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primaryLight,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  frameTip: {
    color: 'rgba(255,255,255,.8)',
    fontSize: 14,
    marginTop: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,.4)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,.4)',
  },
  flipBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtn: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  captureBtnActive: { opacity: 0.6 },
  captureInner: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#fff',
  },
});
