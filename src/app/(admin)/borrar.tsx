import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

// Base de datos simulada de personal
const MOCK_USUARIOS = [
  { id: '1', email: 'secretaria@hospital', rol: 'Secretaría' },
  { id: '2', email: 'ambulancia@hospital', rol: 'Ambulancia' },
  { id: '3', email: 'guardia_noche@hospital', rol: 'Secretaría' },
];

export default function BorrarUsuarios() {
  const [usuarios, setUsuarios] = useState(MOCK_USUARIOS);

  const handleBorrar = (id: string, email: string) => {
    // Alerta nativa de confirmación
    Alert.alert(
      "Eliminar Acceso",
      `¿Estás seguro que querés borrar la cuenta de ${email}? No podrá volver a ingresar al sistema.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
            // Filtramos la lista para sacar al usuario borrado
            setUsuarios(prev => prev.filter(u => u.id !== id));
            Alert.alert('Listo', 'El usuario fue eliminado correctamente.');
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: typeof MOCK_USUARIOS[0] }) => (
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.titulo}>Gestionar Personal</Text>
        <Text style={styles.subtitulo}>Lista de usuarios con acceso al sistema del hospital.</Text>

        <FlatList
          data={usuarios}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.vacio}>No hay personal registrado en este momento.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, paddingTop: 30, flex: 1 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  subtitulo: { fontSize: 15, color: Colors.textLight, marginTop: 6, marginBottom: 24 },
  
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
  vacio: { textAlign: 'center', color: Colors.textLight, marginTop: 40 }
});