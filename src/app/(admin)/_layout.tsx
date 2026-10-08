import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="borrar"
        options={{
          title: 'Borrar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trash-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}