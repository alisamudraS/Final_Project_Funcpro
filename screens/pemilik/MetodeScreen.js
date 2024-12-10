import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../../supabase/supabaseConfig';

const MetodeScreen = () => {
    const [methods, setMethods] = useState([]);
    const [newMethod, setNewMethod] = useState({ nama_metode: '', nomor_rek_e_wallet: '', nama_pemilik: '' });
    const [editing, setEditing] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Fetch payment methods from Supabase
    const fetchMethods = async () => {
        const { data, error } = await supabase
            .from('metode_pembayaran')
            .select('*')
            .order('id_metode', { ascending: false }); // Urutkan berdasarkan id_metode terbaru
        if (error) {
            console.error('Error fetching payment methods:', error);
        } else {
            setMethods(data);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    // Check for duplicate method or account number
    const checkForDuplicate = async (field, value) => {
        const { data, error } = await supabase
            .from('metode_pembayaran')
            .select('*')
            .eq(field, value);

        if (error) throw error;

        return data.length > 0;
    };

    // Add or update payment method
// Add or update payment method
const handleSave = async () => {
    // Check for duplicate
    const fieldToCheck = editing ? 'nomor_rek_e_wallet' : 'nama_metode'; // Tentukan field berdasarkan konteks
    const checkDuplicate = await checkForDuplicate(fieldToCheck, newMethod[fieldToCheck]);

    if (checkDuplicate) {
        Alert.alert('Gagal', `${fieldToCheck === 'nama_metode' ? 'Nama metode' : 'Nomor rekening e-wallet'} sudah terpakai.`);
        return;
    }

    if (editing) {
        // Pop-up konfirmasi edit
        Alert.alert(
            'Konfirmasi Edit',
            'Apakah yakin ingin mengubah detail metode ini? Penggantian dapat mengubah keseluruhan transaksi yang terkait dengan metode ini. Disarankan untuk menyimpan kemajuan database sebelum melakukan perubahan.',
            [
                {
                    text: 'Batal',
                    onPress: () => {},
                    style: 'cancel',
                },
                {
                    text: 'Ya',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('metode_pembayaran')
                                .update(newMethod)
                                .eq('id_metode', editing.id_metode);
                            if (error) throw error;

                            setMethods(methods.map(method => (method.id_metode === editing.id_metode ? { ...method, ...newMethod } : method)));
                            setModalVisible(false);
                            setEditing(null);
                        } catch (error) {
                            console.error('Error updating method:', error.message);
                            Alert.alert('Error', 'Gagal mengubah metode pembayaran.');
                        }
                    },
                },
            ]
        );
    } else {
        // Add new method
        const { error } = await supabase.from('metode_pembayaran').insert([newMethod]);
        if (error) console.error('Error adding method:', error);
        setNewMethod({ nama_metode: '', nomor_rek_e_wallet: '', nama_pemilik: '' });
        setModalVisible(false);
        fetchMethods();
    }
};


    // Confirm before deleting payment method
    const handleDelete = (id) => {
        Alert.alert(
            'Konfirmasi Hapus',
            'Apakah Anda yakin ingin menghapus metode ini?',
            [
                {
                    text: 'Tidak',
                    onPress: () => console.log('Batal hapus'),
                    style: 'cancel',
                },
                {
                    text: 'Ya',
                    onPress: async () => {
                        try {
                            const { data, error } = await supabase.from('metode_pembayaran').delete().eq('id_metode', id);
                            if (error) {
                                console.error('Error deleting method:', error.message);
                                Alert.alert('Gagal', 'Tidak bisa menghapus metode karena ID metode yang digunakan terkait dengan berbagai transaksi tiket. Hubungi teknisi untuk pengelolaan lebih lanjut.');
                            } else {
                                fetchMethods();
                                Alert.alert('Berhasil', 'Metode pembayaran berhasil dihapus.');
                            }
                        } catch (error) {
                            console.error('Error deleting method:', error.message);
                            Alert.alert('Error', 'Gagal menghapus metode pembayaran.');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    // Open modal for adding or editing
    const openModal = (method = null) => {
        setEditing(method);
        setNewMethod(
            method || { nama_metode: '', nomor_rek_e_wallet: '', nama_pemilik: '' }
        );
        setModalVisible(true);
    };

    // Close modal
    const closeModal = () => {
        setModalVisible(false);
        setEditing(null);
        setNewMethod({ nama_metode: '', nomor_rek_e_wallet: '', nama_pemilik: '' });
    };

    const fieldMap = {
        Username: 'nama_metode',
        Email: 'nomor_rek_e_wallet',
        'Nomor Telepon': 'nama_pemilik',
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={methods}
                keyExtractor={(item) => item.id_metode.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View style={styles.row}>
                            <MaterialCommunityIcons name="cash" size={20} color="#4CAF50" />
                            <Text style={styles.methodName}>{item.nama_metode}</Text>
                        </View>
                        <View style={styles.row}>
                            <MaterialCommunityIcons name="cellphone" size={20} color="#2196F3" />
                            <Text style={styles.accountNumber}>{item.nomor_rek_e_wallet}</Text>
                        </View>
                        <View style={styles.row}>
                            <MaterialCommunityIcons name="account" size={20} color="#FF9800" />
                            <Text style={styles.ownerName}>{item.nama_pemilik}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={() => openModal(item)}
                                style={styles.editButton} // Tombol Edit
                            >
                                <MaterialCommunityIcons name="pencil" size={24} color="#4CAF50" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleDelete(item.id_metode)} // Menambahkan konfirmasi sebelum menghapus
                                style={styles.deleteButton} // Tombol Hapus
                            >
                                <MaterialCommunityIcons name="delete" size={24} color="#F44336" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => openModal()}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#fff" />
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nama Metode"
                            value={newMethod.nama_metode}
                            onChangeText={(text) => setNewMethod({ ...newMethod, nama_metode: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Nomor Rekening/E-Wallet"
                            value={newMethod.nomor_rek_e_wallet}
                            onChangeText={(text) => setNewMethod({ ...newMethod, nomor_rek_e_wallet: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Nama Pemilik"
                            value={newMethod.nama_pemilik}
                            onChangeText={(text) => setNewMethod({ ...newMethod, nama_pemilik: text })}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>{editing ? 'Update' : 'Save'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    item: {
        marginBottom: 10,
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    methodName: { marginLeft: 10, fontSize: 16, fontWeight: 'bold', color: '#333' },
    accountNumber: { marginLeft: 10, fontSize: 14, color: '#555' },
    ownerName: { marginLeft: 10, fontSize: 14, color: '#777' },
    actions: { flexDirection: 'column', position: 'absolute', right: 10, top: 10 },
    editButton: {
        marginTop : 10,
        marginBottom: 15, // Memberikan jarak antar tombol
    },
    deleteButton: {},
    addButton: {
        position: 'absolute',
        bottom: 5,
        alignSelf : 'center',
        backgroundColor: '#2196F3',
        borderRadius: 50,
        padding: 15,
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
    },
    modalActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
    saveButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 },
    saveButtonText: { color: '#fff', fontWeight: 'bold' },
    cancelButton: { backgroundColor: '#F44336', padding: 10, borderRadius: 5 },
    cancelButtonText: { color: '#fff', fontWeight: 'bold' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MetodeScreen;
