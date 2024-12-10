import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Fungsi modular untuk navigasi
const navigateToUpdateJenisTiket = (navigation, jenisId, userId) => {
  if (!userId) {
    Alert.alert("Error", "User ID tidak ditemukan. Silakan coba lagi.");
    return;
  }

  navigation.navigate('UpdateJenisTiket', { jenisId, id_pengunjung: userId });
};
const navigateToUpdateTipeTiket = (navigation, jenisId, userId) => {
  if (!userId) {
    Alert.alert("Error", "User ID tidak ditemukan. Silakan coba lagi.");
    return;
  }

  navigation.navigate('UpdateTipeTiket', { jenisId, id_pengunjung: userId });
};

const TiketScreenAdmin = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params || {}; // Ambil userId dari parameter navigasi

  useEffect(() => {
    if (__DEV__) {
      console.log('User ID:', userId); // Log hanya di mode pengembangan
    }

    if (!userId) {
      Alert.alert("Error", "User ID tidak valid. Kembali ke layar sebelumnya.");
      navigation.goBack();
    }
  }, [userId]);

  return (
    <View style={styles.container}>
      
      <View style={styles.cardContainer}>
        {/* Tiket Dewasa */}
        <TouchableOpacity 
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => navigateToUpdateJenisTiket(navigation, 1, userId)}
        >
          <MaterialCommunityIcons name="account-group" size={50} color="#000" />
          <Text style={styles.cardText}>Jenis Tiket</Text>
        </TouchableOpacity>

        {/* Tiket Anak */}
        <TouchableOpacity 
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => navigateToUpdateTipeTiket(navigation, 2, userId)}
        >
          <MaterialCommunityIcons name="star" size={50} color="#000" />
          <Text style={styles.cardText}>Tipe Tiket</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    width: 250,
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default TiketScreenAdmin;
