import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseConfig';

const HomeScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isLoginMode) {
        // Logika Login
        const { data: userPengunjung, error: pengunjungError } = await supabase
          .from('pengunjung')
          .select('*')
          .eq('email', email)
          .eq('pasword_pengunjung', password)
          .single();

        if (userPengunjung) {
          console.log(`Logged in as Pengunjung, ID: ${userPengunjung.id_pengunjung}`);
          navigation.navigate('BerandaTabs', { username: userPengunjung.nama_pengunjung, userId: userPengunjung.id_pengunjung });
          return;
        }

        const { data: userAdmin, error: adminError } = await supabase
          .from('admin')
          .select('*')
          .eq('email_admin', email)
          .eq('password_admin', password)
          .single();

        if (userAdmin) {
          console.log(`Logged in as Admin, ID: ${userAdmin.id_admin}`);
          navigation.navigate('BerandaTabs1', { userId: userAdmin.id_admin });
          return;
        }

        const { data: userPemilik, error: pemilikError } = await supabase
          .from('pemilik')
          .select('*')
          .eq('nama_pemilik', email)
          .eq('password1', password)
          .single();

        if (userPemilik) {
          console.log(`Logged in as Pemilik, ID: ${userPemilik.id_pemilik}`);
          navigation.navigate('ScreenPassword2', { username: userPemilik.nama_pemilik, userId: userPemilik.id_pemilik });
          return;
        }

        setError('Email atau password salah.');
      } else {
        // Logika Register
        // Memeriksa duplikasi untuk email, username, atau nomor HP
        const { data: existingUser, error: dupError } = await supabase
          .from('pengunjung')
          .select('*')
          .or(`email.eq.${email},nama_pengunjung.eq.${username},no_hp.eq.${phone}`);

        if (dupError) {
          setError(`Terjadi kesalahan saat memeriksa data: ${dupError.message}`);
          setLoading(false);
          return;
        }

        if (existingUser.length > 0) {
          setError('Email, Username, atau Nomor HP sudah digunakan.');
          setLoading(false);
          return;
        }

        // Lanjutkan registrasi jika tidak ada duplikasi
        const { data: newUser, error: insertError } = await supabase
          .from('pengunjung')
          .insert({
            nama_pengunjung: username,
            no_hp: phone,
            email,
            pasword_pengunjung: password,
          });

        if (insertError) {
          setError(`Terjadi kesalahan saat mendaftarkan pengguna: ${insertError.message}`);
          setLoading(false);
          return;
        }

        Alert.alert('Registrasi Berhasil', `Akun untuk ${newUser[0].nama_pengunjung} berhasil dibuat.`);
        setIsLoginMode(true);
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan, coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [isLoginMode, username, email, phone, password, navigation]);

  useEffect(() => {
    console.log(isLoginMode ? 'Mode Login' : 'Mode Daftar');
  }, [isLoginMode]);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/gambar1.png')} style={styles.logo} />

      {/* Toggle Login/Sign-Up */}
      <View style={styles.toggleContainer}>
        <Text
          style={[styles.toggleText, !isLoginMode && styles.activeText]}
          onPress={() => setIsLoginMode(false)}
        >
          Sign Up
        </Text>
        <Text
          style={[styles.toggleText, isLoginMode && styles.activeText]}
          onPress={() => setIsLoginMode(true)}
        >
          Log In
        </Text>
      </View>

      {/* Input Fields */}
      {!isLoginMode && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Nomor HP"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </>
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
          <Image
            source={showPassword ? require('../assets/buka.png') : require('../assets/tutup.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[styles.button, (!email || !password) && styles.buttonDisabled]}
        onPress={handleAuth}
        disabled={!email || !password || loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{isLoginMode ? 'Login' : 'Daftar'}</Text>}
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 18,
    color: 'gray',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  activeText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%',
    borderRadius: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  showPasswordButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 25,
    height: 25,
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
    borderRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: 'lightgray',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default HomeScreen;
