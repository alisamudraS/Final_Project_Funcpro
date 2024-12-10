import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../../supabase/supabaseConfig';

const UpdateJenisTiket = () => {
  const [harga, setHarga] = useState('');
  const [jenis, setJenis] = useState('');
  const [dataHarga, setDataHarga] = useState([]);

  // Fungsi untuk mengambil data harga tiket dari Supabase
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('jenis_tiket')
      .select('*'); // Mengambil semua baris dari tabel jenis_tiket

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setDataHarga(data); // Menyimpan data harga yang diambil
  };

  // Memanggil fetchData ketika komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi untuk memperbarui harga tiket di Supabase
  const updateHarga = async () => {
    if (!jenis || !harga) {
      Alert.alert('Error', 'Harap masukkan jenis dan harga');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('jenis_tiket')
        .update({ harga_jenis: parseInt(harga) })
        .eq('keterangan_jenis', jenis)
        .single(); // Memastikan hanya satu baris yang diperbarui

      if (error) {
        throw error;
      }

      Alert.alert('Sukses', `Harga jenis ${jenis} telah diubah menjadi ${harga}`);
      setHarga('');
      setJenis('');
      fetchData(); // Memanggil ulang fungsi fetchData untuk mengambil data terbaru
    } catch (error) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan');
    }
  };

  // Render item dalam daftar harga
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => setJenis(item.keterangan_jenis)} // Memilih jenis tiket
    >
      <Text style={styles.listText}>
        {item.keterangan_jenis}: Rp {item.harga_jenis}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ubah Harga Jenis Tiket</Text>

      {/* Menampilkan daftar harga */}
      <FlatList
        data={dataHarga}
        renderItem={renderItem}
        keyExtractor={(item) => item.id_jenis.toString()}
      />

      {/* Jika jenis sudah dipilih, tampilkan input harga */}
      {jenis ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder={`Masukkan harga baru untuk ${jenis}`}
            keyboardType="numeric"
            value={harga}
            onChangeText={setHarga}
          />
          <Button title="Ubah Harga" onPress={updateHarga} />
        </View>
      ) : (
        <Text style={styles.noSelectionText}>Pilih Jenis tiket untuk diubah</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  listText: {
    fontSize: 18,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  noSelectionText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
    marginTop: 10,
  },
});

export default UpdateJenisTiket;
