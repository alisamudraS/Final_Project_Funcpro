import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../supabase/supabaseConfig';

const Password3_Screen = ({ route }) => {
  const { userId, username } = route.params; // Menangkap userId dan username dari parameter navigasi
  const navigation = useNavigation();

  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Logika untuk validasi login
      const { data: userPemilik, error: pemilikError } = await supabase
        .from('pemilik')
        .select('*')
        .eq('id_pemilik', userId)
        .eq('password3', password)
        .single();

      if (userPemilik) {
        console.log(`Logged in as Pemilik, ID: ${userPemilik.id_pemilik}`);
        navigation.navigate('BerandaTabs2', { userId: userPemilik.id_pemilik });
        return;
      }

      setError('Password salah.');
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, [userId, password, navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/gambar1.png')} style={styles.logo} />

      {/* Menampilkan nama pemilik */}
      <TextInput
        style={[styles.input, { backgroundColor: '#e0e0e0' }]}
        placeholder="Username"
        value={username}
        editable={false} // Tidak bisa diubah
      />

      {/* Input Password */}
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
            source={
              showPassword
                ? require('../../assets/buka.png') // Gambar mata terbuka
                : require('../../assets/tutup.png') // Gambar mata tertutup
            }
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      {/* Tombol Login */}
      <TouchableOpacity
        style={[styles.button, !password && styles.buttonDisabled]}
        onPress={handleAuth}
        disabled={!password || loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      {/* Pesan Error */}
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

export default Password3_Screen;
