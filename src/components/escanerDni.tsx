import { Ionicons } from "@expo/vector-icons";
import {
    BarcodeScanningResult,
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import {
    Linking,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Colors } from "../constants/colors";
import { DatosDni, parsearDni } from "../utils/dni";

type Props = {
  visible: boolean;
  onClose: () => void;
  onEscaneado: (datos: DatosDni) => void;
};

export default function EscanerDni({ visible, onClose, onEscaneado }: Props) {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [linterna, setLinterna] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const procesando = useRef(false);

  const alAbrir = () => {
    procesando.current = false;
    setError(null);
  };

  const handleScan = ({ data }: BarcodeScanningResult) => {
    if (procesando.current) return;
    procesando.current = true;

    const datos = parsearDni(data);
    if (!datos) {
      setError("No pudimos leer el DNI. Probá de nuevo con más luz.");
      setTimeout(() => {
        procesando.current = false;
      }, 1500);
      return;
    }

    onEscaneado(datos);
    onClose();
  };

  const renderContenido = () => {
    if (!permiso) {
      return <Text style={styles.textoCentro}>Cargando cámara…</Text>;
    }

    if (!permiso.granted) {
      return (
        <View style={styles.permisoBox}>
          <Ionicons name="camera-outline" size={48} color={Colors.primary} />
          <Text style={styles.permisoTitulo}>Necesitamos tu cámara</Text>
          <Text style={styles.permisoTexto}>
            La usamos solo para leer el código de tu DNI y completar tus datos.
            No guardamos ninguna imagen.
          </Text>
          <Pressable
            style={styles.permisoBtn}
            onPress={
              permiso.canAskAgain ? pedirPermiso : () => Linking.openSettings()
            }
          >
            <Text style={styles.permisoBtnTexto}>
              {permiso.canAskAgain ? "Dar permiso" : "Abrir configuración"}
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={linterna}
          barcodeScannerSettings={{ barcodeTypes: ["pdf417"] }}
          onBarcodeScanned={handleScan}
        />

        {/* Overlay con el marco guía */}
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.instruccion}>
            Apuntá al código de barras del frente de tu DNI
          </Text>
          <View style={styles.marco} />
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onShow={alAbrir}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitulo}>Escanear DNI</Text>
          <Pressable
            onPress={() => setLinterna((l) => !l)}
            style={styles.headerBtn}
          >
            <Ionicons
              name={linterna ? "flash" : "flash-off"}
              size={22}
              color="#fff"
            />
          </Pressable>
        </View>
        {renderContenido()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 2,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitulo: { color: "#fff", fontSize: 17, fontWeight: "bold" },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  instruccion: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  marco: {
    width: "90%",
    height: 110,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  error: {
    color: "#fff",
    backgroundColor: Colors.danger,
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },

  textoCentro: { color: "#fff", textAlign: "center", marginTop: 40 },
  permisoBox: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permisoTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
  },
  permisoTexto: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  permisoBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 24,
  },
  permisoBtnTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
