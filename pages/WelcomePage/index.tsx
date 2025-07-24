import * as React from 'react';
import { Text, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useAppState } from '../../AppState';

const buttonStyle = { borderRadius: 16 };

export default function WelcomeScreen({ navigation }: any) {
  const { children } = useAppState();
  React.useEffect(() => {
    if (children.length === 1) {
      navigation.replace('ActivitySelect', { childId: children[0].id });
    }
  }, [children, navigation]);

  return (
    <View style={styles.center}>
      <Text variant="headlineLarge" style={{ color: '#3730A3', fontWeight: 'bold', marginBottom: 32 }}>
        Добро пожаловать в BabyCare Tracker!
      </Text>
      <Button mode="contained" onPress={() => navigation.replace('ChildrenList')} style={{ ...buttonStyle }}>
        Перейти к детям
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
