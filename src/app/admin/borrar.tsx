import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

const API_URL = 'http://172.28.96.1:3000/api';

export default function BorrarUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Trae el personal del hospital del admin logueado
  const cargarUsuarios = useCallback(async () => {
    try {
      const hospitalId = await AsyncStorage.getItem('hospitalId');
      if (!hospitalId) {
        setUsuarios([]);
        return;
      }
      const response = await fetch(`${API_URL}/hospitales/${hospitalId}/personal`);
      if (!response.ok) throw new Error();
      setUsuarios(await response.json());
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }, []);

  // Se recarga cada vez que entrás a la pestaña (así aparecen los recién creados)
  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
    }, [cargarUsuarios])
  );

  // Ojo: id ahora es un number (porque así lo definiste en Prisma)
  const handleBorrar = async (id: number, email: string) => { 
    // Separamos la lógica de borrado para reutilizarla
    const ejecutarBorrado = async () => {
      try {
        const response = await fetch(`${API_URL}/usuarios/${id}/desactivar`, {
          method: 'PATCH'
        });
        
        if (!response.ok) {
          throw new Error('Falló la petición al backend');
        }

        // Lo sacamos de la lista visualmente
        setUsuarios(prev => prev.filter(u => u.id !== id));
        
        if (Platform.OS === 'web') {
          window.alert('El usuario fue eliminado correctamente.');
        } else {
          Alert.alert('Listo', 'El usuario fue eliminado correctamente.');
        }
      } catch (error) {
        console.error(error);
        if (Platform.OS === 'web') {
          window.alert('Error: No se pudo eliminar el usuario.');
        } else {
          Alert.alert('Error', 'No se pudo eliminar el usuario.');
        }
      }
    };

    // Si estamos en la compu (Web), usamos el confirm del navegador
    if (Platform.OS === 'web') {
      const confirmacion = window.confirm(`¿Estás seguro que querés borrar la cuenta de ${email}?`);
      if (confirmacion) {
        await ejecutarBorrado();
      }
    } else {
      // Si estamos en el celular, usamos el Alert nativo
      Alert.alert(
        "Eliminar Acceso",
        `¿Estás seguro que querés borrar la cuenta de ${email}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Eliminar", style: "destructive", onPress: ejecutarBorrado }
        ]
      );
    }
  };

  // En el renderItem asegurate de cambiar el tipo del id si te tira error
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.email}>{item.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeTexto}>{item.rol}</Text>
        </View>
      </View>
      
      <Pressable style={styles.btnBorrar} onPress={() => handleBorrar(item.id, item.email)}>
        <Ionicons name="trash-outline" size={20} color={Colors.danger} />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerEtiquetaRow}>
          <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          <Text style={styles.headerEtiquetaTexto}>ELIMINAR USUARIO</Text>
        </View>
        <Text style={styles.tituloPrincipal}>Gestionar Personal</Text>
        <Text style={styles.subtitulo}>Lista de usuarios con acceso al sistema.</Text>
      </View>

      {/* Se mantiene el FlatList envuelto en un View para sus márgenes */}
      <View style={styles.content}>
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.vacio}>No hay personal registrado en este momento.</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  titulo: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: Colors.surface, 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: Colors.border, 
    marginBottom: 12 
  },
  info: { flex: 1 },
  email: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  badge: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#FAFAFA', 
    borderWidth: 1, 
    borderColor: Colors.border, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  badgeTexto: { fontSize: 11, fontWeight: 'bold', color: Colors.textLight },
  
  btnBorrar: { 
    padding: 10, 
    backgroundColor: '#FEF2F2', 
    borderRadius: 8 
  },
  vacio: { textAlign: 'center', color: Colors.textLight, marginTop: 40 },
  // Modifica content (solo dejamos el margen horizontal y flex):
  content: { paddingHorizontal: 24, flex: 1 },

  // Agrega/Reemplaza los estilos de cabecera:
  header: { 
    backgroundColor: '#1F2937', 
    paddingHorizontal: 24, 
    paddingTop: 20, 
    paddingBottom: 24,
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24, 
    marginBottom: 20 
  },
  headerEtiquetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  headerEtiquetaTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  tituloPrincipal: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  subtitulo: { 
    fontSize: 15, 
    color: 'rgba(255,255,255,0.8)', 
    marginTop: 4 
  },
});