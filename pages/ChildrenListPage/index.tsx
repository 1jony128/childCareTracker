import * as React from 'react';
import { Text, FAB, List, Avatar } from 'react-native-paper';
import { View } from 'react-native';
import { useAppState } from '../../AppState';

export default function ChildrenListScreen({ navigation }: any) {
  const { children } = useAppState();
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <Text variant="headlineLarge" style={{ margin: 32, textAlign: 'center', color: '#3730A3', fontWeight: 'bold' }}>Список детей</Text>
      <List.Section style={{ marginHorizontal: 8 }}>
        {children.map(child => (
          <List.Item
            key={child.id}
            title={<Text style={{ fontSize: 18, color: '#1E293B', fontWeight: 'bold' }}>{child.name}</Text>}
            description={<Text style={{ color: '#64748B' }}>Дата рождения: {child.dob}</Text>}
            left={props => <Avatar.Text {...props} label={child.name[0].toUpperCase()} size={44} style={{ backgroundColor: '#A5B4FC', marginRight: 8 }} color="#3730A3" />}
            style={{ backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, elevation: 2, paddingVertical: 4 }}
            onPress={() => navigation.navigate('ActivitySelect', { childId: child.id })}
          />
        ))}
      </List.Section>
      <FAB
        icon="plus"
        label="Добавить ребенка"
        style={{ position: 'absolute', right: 24, bottom: 32, backgroundColor: '#7C3AED' }}
        color="#fff"
        onPress={() => navigation.navigate('ChildProfile', { isNew: true })}
      />
    </View>
  );
}
