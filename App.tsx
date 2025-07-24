import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, Text, Button, Card, Avatar, FAB, TextInput, HelperText, Dialog, Portal, SegmentedButtons } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { AppStateProvider, useAppState } from './AppState';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

const Stack = createNativeStackNavigator();

function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.center}>
      <Text variant="headlineMedium" style={{ marginBottom: 24 }}>Добро пожаловать в BabyCare Tracker!</Text>
      <Button mode="contained" onPress={() => navigation.replace('ChildrenList')}>
        Перейти к детям
      </Button>
    </View>
  );
}

function ChildrenListScreen({ navigation }: any) {
  const { children } = useAppState();
  return (
    <View style={{ flex: 1 }}>
      <Text variant="headlineMedium" style={{ margin: 24, textAlign: 'center' }}>Список детей</Text>
      {children.map(child => (
        <Card key={child.id} style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <Card.Title
            title={child.name}
            subtitle={`Дата рождения: ${child.dob}`}
            left={props => <Avatar.Text {...props} label={child.name[0]} />}
          />
          <Card.Actions>
            <Button onPress={() => navigation.navigate('ChildProfile', { childId: child.id })}>Профиль</Button>
            <Button onPress={() => navigation.navigate('ActivitySelect', { childId: child.id })}>Активности</Button>
          </Card.Actions>
        </Card>
      ))}
      <FAB
        icon="plus"
        label="Добавить ребенка"
        style={{ position: 'absolute', right: 24, bottom: 24 }}
        onPress={() => navigation.navigate('ChildProfile', { isNew: true })}
      />
    </View>
  );
}

function ChildProfileScreen({ route, navigation }: any) {
  const { childId, isNew } = route.params || {};
  const { children, addChild, updateChild, removeChild } = useAppState();
  const editing = !isNew && childId;
  const child = editing ? children.find(c => c.id === childId) : undefined;

  const [name, setName] = useState(child?.name || '');
  const [dob, setDob] = useState(child?.dob || '');
  const [showDialog, setShowDialog] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !dob) return;
    if (editing && child) {
      updateChild({ ...child, name: name.trim(), dob });
    } else {
      addChild({ name: name.trim(), dob });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (editing && child) {
      removeChild(child.id);
    }
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text variant="headlineMedium" style={{ marginBottom: 24 }}>{isNew ? 'Добавить ребенка' : 'Профиль ребенка'}</Text>
      {/* Фото ребенка (заглушка) */}
      <Avatar.Icon icon="account-child" size={72} style={{ alignSelf: 'center', marginBottom: 24 }} />
      <TextInput
        label="Имя"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 16 }}
        mode="outlined"
      />
      <TextInput
        label="Дата рождения (ГГГГ-ММ-ДД)"
        value={dob}
        onChangeText={setDob}
        style={{ marginBottom: 16 }}
        mode="outlined"
        placeholder="2023-01-15"
      />
      <HelperText type="error" visible={!name.trim() || !dob}>
        Имя и дата рождения обязательны
      </HelperText>
      <Button mode="contained" onPress={handleSave} disabled={!name.trim() || !dob} style={{ marginBottom: 12 }}>
        Сохранить
      </Button>
      {!isNew && (
        <Button mode="outlined" onPress={() => setShowDialog(true)} style={{ marginBottom: 12 }}>
          Удалить
        </Button>
      )}
      <Button onPress={() => navigation.goBack()}>Отмена</Button>
      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Удалить профиль?</Dialog.Title>
          <Dialog.Content>
            <Text>Вы уверены, что хотите удалить профиль ребенка?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Отмена</Button>
            <Button onPress={handleDelete}>Удалить</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

function ActivitySelectScreen({ route, navigation }: any) {
  const { childId } = route.params || {};
  const { children, addActivity } = useAppState();
  const child = children.find(c => c.id === childId);

  const activityTypes = [
    { value: 'feeding', label: 'Кормление' },
    { value: 'sleep', label: 'Сон' },
    { value: 'diaper', label: 'Подгузник' },
    { value: 'bath', label: 'Купание' },
    { value: 'water', label: 'Вода' },
  ];

  const [type, setType] = useState('feeding');
  const [time, setTime] = useState(() => new Date().toISOString().slice(0,16)); // YYYY-MM-DDTHH:mm
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');

  const handleAdd = () => {
    addActivity({
      childId,
      type: type as any,
      time: new Date(time).toISOString(),
      amount: amount ? Number(amount) : undefined,
      details: details || undefined,
    });
    navigation.navigate('ActivityHistory', { childId });
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Добавить активность</Text>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>{child ? child.name : 'Ребенок не выбран'}</Text>
      <SegmentedButtons
        value={type}
        onValueChange={setType}
        buttons={activityTypes}
        style={{ marginBottom: 16 }}
      />
      <TextInput
        label="Время"
        value={time}
        onChangeText={setTime}
        style={{ marginBottom: 16 }}
        mode="outlined"
        placeholder="2023-06-01T14:30"
      />
      {(type === 'feeding' || type === 'water') && (
        <TextInput
          label="Количество (мл)"
          value={amount}
          onChangeText={setAmount}
          style={{ marginBottom: 16 }}
          mode="outlined"
          keyboardType="numeric"
        />
      )}
      {type === 'diaper' && (
        <TextInput
          label="Тип (мокрый/грязный)"
          value={details}
          onChangeText={setDetails}
          style={{ marginBottom: 16 }}
          mode="outlined"
        />
      )}
      <Button mode="contained" onPress={handleAdd} style={{ marginBottom: 12 }}>
        Сохранить
      </Button>
      <Button onPress={() => navigation.goBack()}>Отмена</Button>
    </View>
  );
}

function ActivityHistoryScreen({ route, navigation }: any) {
  const { childId } = route.params || {};
  const { children, activities } = useAppState();
  const child = children.find(c => c.id === childId);

  const activityTypes = [
    { value: 'all', label: 'Все' },
    { value: 'feeding', label: 'Кормление' },
    { value: 'sleep', label: 'Сон' },
    { value: 'diaper', label: 'Подгузник' },
    { value: 'bath', label: 'Купание' },
    { value: 'water', label: 'Вода' },
  ];

  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [type, setType] = useState('all');

  const dateStr = date.toISOString().slice(0, 10);
  const filtered = activities.filter(a =>
    (!childId || a.childId === childId) &&
    a.time.slice(0, 10) === dateStr &&
    (type === 'all' || a.type === type)
  );

  const activityLabels: Record<string, string> = {
    feeding: 'Кормление',
    sleep: 'Сон',
    diaper: 'Подгузник',
    bath: 'Купание',
    water: 'Вода',
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 8 }}>История</Text>
      {child && <Text variant="titleMedium" style={{ marginBottom: 8 }}>{child.name}</Text>}
      <Button mode="outlined" onPress={() => setShowDate(true)} style={{ marginBottom: 8 }}>
        {`Дата: ${dateStr}`}
      </Button>
      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_event: any, d?: Date) => {
            setShowDate(false);
            if (d) setDate(d);
          }}
        />
      )}
      <SegmentedButtons
        value={type}
        onValueChange={setType}
        buttons={activityTypes}
        style={{ marginBottom: 16 }}
      />
      {filtered.length === 0 ? (
        <Text style={{ marginTop: 32, textAlign: 'center' }}>Нет записей</Text>
      ) : (
        filtered.map(a => (
          <Card key={a.id} style={{ marginBottom: 12 }}>
            <Card.Title
              title={activityLabels[a.type] || a.type}
              subtitle={new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
            <Card.Content>
              {a.amount !== undefined && <Text>Количество: {a.amount} мл</Text>}
              {a.details && <Text>Детали: {a.details}</Text>}
            </Card.Content>
          </Card>
        ))
      )}
      <Button style={{ marginTop: 24 }} onPress={() => navigation.goBack()}>Назад</Button>
    </View>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ChildrenList" component={ChildrenListScreen} options={{ title: 'Дети' }} />
            <Stack.Screen name="ChildProfile" component={ChildProfileScreen} options={{ title: 'Профиль ребенка' }} />
            <Stack.Screen name="ActivitySelect" component={ActivitySelectScreen} options={{ title: 'Выбор активности' }} />
            <Stack.Screen name="ActivityHistory" component={ActivityHistoryScreen} options={{ title: 'История' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AppStateProvider>
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
