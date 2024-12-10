import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../../supabase/supabaseConfig';

const ProfilAdmin = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [newValue, setNewValue] = useState('');
  const [password, setPassword] = useState('');

  // Fetch user data from Supabase
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin') // Nama tabel di database Anda
        .select('email_admin, password_admin')
        .eq('id_admin', userId)
        .single();

      if (error) throw error;

      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error.message);
      Alert.alert('Error', 'Gagal memuat data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const handleEdit = (field) => {
    // Check if user is trying to edit email or password, and show warning
    if (field === 'Email' || field === 'Password') {
      Alert.alert(
        'Perubahan Tidak Diperbolehkan',
        'Perubahan email dan password hanya dapat dilakukan dengan koordinasi bersama teknisi dan pemilik. Jika Anda yakin ingin mengubah data ini, harap hubungi pihak terkait.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setCurrentField(field);
    setModalVisible(true);
  };

  const handleSave = async () => {
    // Validasi password sebelum menyimpan perubahan
    if (password !== userData.password_admin) {
      Alert.alert('Gagal', 'Password salah.');
      return;
    }

    try {
      const updatedField = { [fieldMap[currentField]]: newValue };
      const { error } = await supabase
        .from('admin')
        .update(updatedField)
        .eq('id_admin', userId);

      if (error) throw error;

      setUserData({ ...userData, ...updatedField });
      Alert.alert('Berhasil', `${currentField} berhasil diubah.`);
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating user data:', error.message);
      Alert.alert('Error', 'Gagal mengubah data.');
    }
  };

  const fieldMap = {
    'Username': 'nama_admin',
    'No HP': 'no_hp', // Tambahkan field lainnya jika perlu
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Memuat data pengguna...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <MaterialCommunityIcons name="account-circle" size={100} color="#ddd" />
        <Text style={styles.username}>{userData.email_admin}</Text>
      </View>

      <View style={styles.inputContainer}>
        {/* Non-editable fields */}
        <TouchableOpacity onPress={() => handleEdit('Email')}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={userData.email_admin}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleEdit('Password')}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={'*'.repeat(userData.password_admin.length)} // Masked password
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace('Home')}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Editing */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ubah {currentField}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Masukkan password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.modalInput}
              placeholder={`Masukkan ${currentField} baru`}
              value={newValue}
              onChangeText={setNewValue}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSave}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  footer: {
    marginTop: 20,
  },
  logoutButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#f0f4f8',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    marginRight: 5,
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonSave: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfilAdmin;
