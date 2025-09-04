import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import {
  Settings,
  LoginManager,
  AccessToken,
} from 'react-native-fbsdk-next';
import { FB_APP_ID } from '@env';

// const FB_APP_ID = '626145897237404';

type GraphUser = {
  id?: string;
  name?: string;
  email?: string;
};

export default function App(){

  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<Date | null>(null);
  const [user, setUser] = useState<GraphUser | null>(null);
  const [graphStatus, setGraphStatus] = useState<number | null>(null);

  useEffect(() => {
    try {
      if (!FB_APP_ID || FB_APP_ID === 'YOUR_FB_APP_ID') {
        console.warn(
          '[FB] FB_APP_ID is not set. Replace FB_APP_ID in App.tsx or import from @env'
        );
      }
      Settings.setAppID(String(FB_APP_ID));
      Settings.initializeSDK();
    } catch (e) {
      console.warn('[FB] SDK init error', e);
    }
  }, []);

  const maskedToken = useMemo(() => {
    if (!accessToken) return '';
    const last8 = accessToken.slice(-8);
    return `****${last8}`;
  }, [accessToken]);

  const readableExpiry = useMemo(() => {
    if (!expiry) return '—';
    return expiry.toLocaleString();
  }, [expiry]);

  const fetchGraphUser = useCallback(async (token: string) => {
    const url = `https://graph.facebook.com/v20.0/me?fields=id,name,email&access_token=${encodeURIComponent(
      token
    )}`;
    const res = await fetch(url);
    setGraphStatus(res.status);
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Graph API failed (${res.status}) ${txt}`);
    }
    const json = (await res.json()) as GraphUser;
    setUser(json);
  }, []);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    setGraphStatus(null);
    try {
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        Alert.alert('Login cancelled', 'You cancelled Facebook login.');
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data || !data.accessToken) {
        throw new Error('Failed to obtain access token from Facebook.');
      }

      const token = data.accessToken.toString();
      setAccessToken(token);

      const expVal = (data as any).expirationTime ?? (Date.now() + 60 * 60 * 1000);
      const expDate = typeof expVal === 'number' ? new Date(expVal) : new Date(Number(expVal));
      setExpiry(expDate);

      await fetchGraphUser(token);
    } catch (err: any) {
      console.error('FB login error:', err);
      Alert.alert('Login error', err?.message ?? 'Unexpected error during login.');
      try {
        LoginManager.logOut();
      } catch { }
      setAccessToken(null);
      setExpiry(null);
      setUser(null);
      setGraphStatus(null);
    } finally {
      setLoading(false);
    }
  }, [fetchGraphUser]);

  const handleLogout = useCallback(() => {
    try {
      LoginManager.logOut();
    } catch { }
    setAccessToken(null);
    setExpiry(null);
    setUser(null);
    setGraphStatus(null);
  }, []);

  const openTokenDebug = useCallback(async () => {
    if (!accessToken) return;
    const debugUrl = `https://developers.facebook.com/tools/debug/accesstoken/?access_token=${encodeURIComponent(
      accessToken
    )}`;
    const can = await Linking.canOpenURL(debugUrl);
    if (can) Linking.openURL(debugUrl);
    else Alert.alert('Cannot open browser', debugUrl);
  }, [accessToken]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Facebook Login — POC</Text>

        {!accessToken ? (
          <>
            <Text style={styles.hint}>
              Press the button to sign in with Facebook.
            </Text>
            <View style={styles.button}>
              <Button title="Continue with Facebook" onPress={handleLogin} />
            </View>
          </>
        ) : (
          <ScrollView style={{ maxHeight: 420 }}>
            <Text style={styles.label}>Access Token</Text>
            <Text style={styles.valueMono}>{maskedToken}</Text>

            <Text style={styles.label}>Token Expiry</Text>
            <Text style={styles.value}>{readableExpiry}</Text>

            <Text style={styles.label}>Graph API Status</Text>
            <Text style={styles.value}>{graphStatus ?? '—'}</Text>

            <Text style={styles.label}>User (Graph API)</Text>
            <View style={styles.jsonBox}>
              <Text style={styles.valueMono}>
                {user ? JSON.stringify(user, null, 2) : '—'}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.flex}>
                <Button title="Logout" onPress={handleLogout} />
              </View>
              <View style={styles.spacer} />
              <View style={styles.flex}>
                <Button
                  title="Open Token Debug"
                  onPress={openTokenDebug}
                  disabled={!accessToken}
                />
              </View>
            </View>
          </ScrollView>
        )}

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Signing in…</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    borderColor: '#222',
    borderWidth: 1,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  hint: { color: '#d0d0d0', marginBottom: 12, textAlign: 'center' },
  button: { marginVertical: 8 },
  label: { color: '#9a9a9a', marginTop: 12, fontSize: 12 },
  value: { color: '#fff', fontSize: 14 },
  valueMono: {
    color: '#eaeaea',
    fontFamily: Platform.select({ android: 'monospace', ios: 'Menlo', default: 'monospace' }),
    fontSize: 12,
  },
  jsonBox: {
    marginTop: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#0f0f0f',
    borderColor: '#222',
    borderWidth: 1,
  },
  row: { flexDirection: 'row', marginTop: 14 },
  flex: { flex: 1 },
  spacer: { width: 12 },
  loading: { marginTop: 16, alignItems: 'center' },
  loadingText: { color: '#cfcfcf', marginTop: 8 },
  footer: { marginTop: 18, color: '#9a9a9a', fontSize: 12, textAlign: 'center' },
});
