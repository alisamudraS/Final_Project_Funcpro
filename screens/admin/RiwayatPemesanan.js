import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../supabase/supabaseConfig';
import RNPickerSelect from 'react-native-picker-select'; // Menggunakan react-native-picker-select

const RiwayatPemesanan = ({ route, navigation }) => {
  const { userId } = route.params || {};  // Ambil userId dari route.params

  console.log('User ID:', userId);  // Debugging untuk memastikan userId tersedia

  // state dan logika lainnya
  const [riwayat, setRiwayat] = useState([]);
  const [filteredRiwayat, setFilteredRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('semua');
  // Fungsi untuk mengambil data riwayat pemesanan
  const fetchRiwayat = async () => {
    try {
      setLoading(true);

      // Mengambil data pemesanan
      const { data: pemesananData, error: pemesananError } = await supabase
        .from('pemesanan_tiket')
        .select('*');

      if (pemesananError) throw pemesananError;

      // Menambahkan data tiket terkait
      const riwayatData = await Promise.all(
        pemesananData.map(async (pemesanan) => {
          const { data: tiketData, error: tiketError } = await supabase
            .from('tiket')
            .select('harga_total, tanggal_berlaku, tipe_tiket_id_tipe, admin_id_admin')
            .eq('pemesanan_tiket_id_pemesanan', pemesanan.id_pemesanan);

          if (tiketError) throw tiketError;

          const jumlahVIP = tiketData.filter((tiket) => tiket.tipe_tiket_id_tipe === 1).length;
          const jumlahReguler = tiketData.filter((tiket) => tiket.tipe_tiket_id_tipe === 2).length;
          const totalNominal = tiketData.reduce((sum, tiket) => sum + tiket.harga_total, 0);

          return {
            id_pemesanan: pemesanan.id_pemesanan,
            tanggal_pemesanan: pemesanan.tanggal_pemesanan,
            status: pemesanan.status.toLowerCase(),
            totalNominal,
            jumlahVIP,
            jumlahReguler,
            tanggalBerlaku: tiketData[0]?.tanggal_berlaku || null,
            adminId: tiketData[0]?.admin_id_admin || null,  // Ambil admin_id_admin dari tiket
          };
        })
      );

      riwayatData.sort((a, b) => (a.status === 'diproses' ? -1 : b.status === 'diproses' ? 1 : 0));
      setRiwayat(riwayatData);
    } catch (error) {
      console.error('Error fetching riwayat:', error.message || error);
      Alert.alert('Error', 'Gagal memuat riwayat pemesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk filter data berdasarkan periode
  const filterRiwayat = () => {
    let filteredData = [...riwayat];
    const today = new Date();

    if (periode === 'hariIni') {
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.tanggal_pemesanan);
        return itemDate.toDateString() === today.toDateString();
      });
    } else if (periode === '1minggu') {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.tanggal_pemesanan);
        return itemDate >= oneWeekAgo && itemDate <= today;
      });
    } else if (periode === '1bulan') {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.tanggal_pemesanan);
        return itemDate >= oneMonthAgo && itemDate <= today;
      });
    }

    setFilteredRiwayat(filteredData);
  };

  // Fungsi untuk mengupdate status menjadi sukses
  const updateStatusToSuccess = async (id_pemesanan) => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin mengkonfirmasi transaksi?',
      [
        {
          text: 'Tidak',
          style: 'cancel',
        },
        {
          text: 'Ya',
          onPress: async () => {
            try {
              // Update status di pemesanan_tiket menjadi sukses
              const { error: updateStatusError } = await supabase
                .from('pemesanan_tiket')
                .update({ status: 'sukses' })
                .eq('id_pemesanan', id_pemesanan);
  
              if (updateStatusError) throw updateStatusError;
  
              // Update admin_id_admin di tiket yang terkait dengan pemesanan ini
              const { error: updateAdminError } = await supabase
                .from('tiket')
                .update({ admin_id_admin: userId }) // Ganti dengan ID admin yang sedang login
                .eq('pemesanan_tiket_id_pemesanan', id_pemesanan);
              console.log(userId)
  
              if (updateAdminError) throw updateAdminError;
  
              Alert.alert('Sukses', 'Status pemesanan berhasil diubah menjadi sukses.');
              fetchRiwayat(); // Memuat ulang data riwayat
            } catch (error) {
              console.error('Error updating status or admin_id_admin:', error.message || error);
              Alert.alert('Error', 'Gagal mengubah status pemesanan atau admin_id_admin.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  const handlePress = (item) => {
    const { id_pemesanan, totalNominal, jumlahVIP, jumlahReguler, tanggalBerlaku, status } = item;

    if (status === 'diproses') {
      navigation.navigate('InformasiTransaksi', { pemesananId: id_pemesanan });
    } else if (status === 'sukses') {
      navigation.navigate('LihatTiket', {
        pemesananId: id_pemesanan,
        totalNominal,
        jumlahVIP,
        jumlahReguler,
        tanggalBerlaku,
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRiwayat();
    }, [])
  );

  useEffect(() => {
    filterRiwayat(); // Memanggil filterRiwayat saat riwayat atau periode berubah
  }, [riwayat, periode]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Pilih Periode:</Text>
        <RNPickerSelect
          onValueChange={(value) => setPeriode(value)}
          items={[
            { label: 'Semua', value: 'semua' },
            { label: 'Hari Ini', value: 'hariIni' },
            { label: '1 Minggu', value: '1minggu' },
            { label: '1 Bulan', value: '1bulan' },
          ]}
          value={periode}
        />
      </View>
      {filteredRiwayat.map((item) => (
        <View key={item.id_pemesanan} style={styles.card}>
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={styles.header}>
              <Text style={styles.dateText}>{new Date(item.tanggal_pemesanan).toLocaleDateString('id-ID')}</Text>
              <Text style={styles.idText}>No. ID: {item.id_pemesanan}</Text>
            </View>
            <View style={styles.content}>
              {item.jumlahVIP > 0 && <Text style={styles.tiketText}>VIP Dewasa: {item.jumlahVIP}</Text>}
              {item.jumlahReguler > 0 && <Text style={styles.tiketText}>Reguler Dewasa: {item.jumlahReguler}</Text>}
            </View>
            <View
              style={[styles.statusContainer, item.status === 'sukses' ? styles.successStatus : styles.processStatus]}
            >
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </TouchableOpacity>
          {item.status === 'diproses' && (
            <Button
              title="Konfirmasi"
              onPress={() => updateStatusToSuccess(item.id_pemesanan)}
              color="#28a745"
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  idText: {
    fontSize: 14,
    color: '#555',
  },
  content: {
    marginBottom: 8,
  },
  tiketText: {
    fontSize: 14,
  },
  statusContainer: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
    marginBottom : 8,
  },
  successStatus: {
    backgroundColor: '#28a745',
  },
  processStatus: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RiwayatPemesanan;
