import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, Text, Button, Card, Avatar, FAB, TextInput, HelperText, Dialog, Portal, SegmentedButtons, List, Appbar } from 'react-native-paper';
import { View, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { AppStateProvider, useAppState } from './AppState';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { IconProps } from '@expo/vector-icons/build/createIconSet';

const Stack = createNativeStackNavigator();

const inputStyle = { backgroundColor: 'rgba(0,0,0,0)', borderRadius: 16, height: 48, fontSize: 16 };
const buttonStyle = { borderRadius: 16 };
const darkText = { color: 'rgb(30,27,28)' };

function WelcomeScreen({ navigation }: any) {
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

function ChildrenListScreen({ navigation }: any) {
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
            onPress={() => navigation.navigate('ChildProfile', { childId: child.id })}
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

function ChildProfileScreen({ route, navigation }: any) {
  const { childId, isNew } = route.params || {};
  const { children, addChild, updateChild, removeChild } = useAppState();
  const editing = !isNew && childId;
  const child = editing ? children.find(c => c.id === childId) : undefined;

  const [name, setName] = useState(child?.name || '');
  const [dob, setDob] = useState(child?.dob || '');
  const [showDialog, setShowDialog] = useState(false);

  React.useLayoutEffect(() => {
    if (editing) {
      navigation.setOptions({
        headerRight: () => (
          <Appbar.Action icon="account-edit" onPress={() => navigation.navigate('ChildProfile', { childId, isNew: false, editMode: true })} />
        ),
      });
    }
  }, [navigation, editing, childId]);

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

  if (editing && child) {
    // Просмотр профиля ребенка
    return (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F8FAFC' }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Avatar.Text label={child.name[0].toUpperCase()} size={80} style={{ backgroundColor: '#A5B4FC', marginBottom: 16 }} color="#3730A3" />
          <Text variant="headlineMedium" style={{ color: '#3730A3', fontWeight: 'bold', marginBottom: 8 }}>{child.name}</Text>
          <Text style={{ color: '#64748B', fontSize: 16 }}>Дата рождения: {child.dob}</Text>
        </View>
        <Button mode="contained" icon="baby-bottle-outline" buttonColor="#7C3AED" style={{ borderRadius: 16, marginBottom: 16 }} onPress={() => navigation.navigate('ActivitySelect', { childId: child.id })}>
          Активности
        </Button>
        <Button mode="outlined" style={{ borderRadius: 16 }} onPress={() => navigation.goBack()}>
          Назад
        </Button>
      </View>
    );
  }

  // Форма добавления/редактирования
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
      <Text variant="headlineMedium" style={{ marginBottom: 24 }}>{isNew ? 'Добавить ребенка' : 'Редактировать профиль'}</Text>
      <Avatar.Icon icon="account-child" size={72} style={{ alignSelf: 'center', marginBottom: 24 }} />
      <TextInput
        label="Имя"
        value={name}
        onChangeText={setName}
        style={{ ...inputStyle, marginBottom: 12 }}
        mode="outlined"
        placeholderTextColor={darkText.color}
      />
      <TextInput
        label="Дата рождения (ГГГГ-ММ-ДД)"
        value={dob}
        onChangeText={setDob}
        style={{ ...inputStyle, marginBottom: 12 }}
        mode="outlined"
        placeholderTextColor={darkText.color}
      />
      <HelperText type="error" visible={!name.trim() || !dob}>
        Имя и дата рождения обязательны
      </HelperText>
      <Button mode="contained" onPress={handleSave} disabled={!name.trim() || !dob} style={{ ...buttonStyle, marginBottom: 8 }}>
        Сохранить
      </Button>
      {!isNew && (
        <Button mode="outlined" onPress={() => setShowDialog(true)} style={{ ...buttonStyle, marginBottom: 8 }}>
          Удалить
        </Button>
      )}
      <Button onPress={() => navigation.goBack()} style={{ borderRadius: 16 }}>Отмена</Button>
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
  const { children, addActivity, activities } = useAppState();
  const child = children.find(c => c.id === childId);

  // Добавляю иконку истории в header
  React.useLayoutEffect(() => {
    if (childId) {
      navigation.setOptions({
        headerRight: () => (
          <Appbar.Action icon="history" onPress={() => navigation.navigate('ActivityHistory', { childId })} />
        ),
      });
    }
  }, [navigation, childId]);

  const activityTypes = [
    { value: 'feeding', label: 'Кормление', icon: 'baby-bottle', color: '#A5B4FC' },
    { value: 'sleep', label: 'Сон', icon: 'bed', color: '#FDE68A' },
    { value: 'diaper', label: 'Подгузник', icon: 'emoticon-poop', color: '#FCA5A5' },
    { value: 'bath', label: 'Купание', icon: 'bathtub', color: '#6EE7B7' },
    { value: 'water', label: 'Вода', icon: 'cup-water', color: '#38BDF8' },
  ];

  const [selected, setSelected] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [sleepEvent, setSleepEvent] = useState<'sleep' | 'wake'>('sleep');

  // История активностей за сегодня для выбранного ребенка
  const today = new Date().toISOString().slice(0, 10);
  const history = activities
    .filter(a => a.childId === childId && a.time.slice(0, 10) === today)
    .sort((a, b) => b.time.localeCompare(a.time));

  const handleAdd = () => {
    addActivity({
      childId,
      type: selected as any,
      time: selectedDate.toISOString(),
      amount: amount ? Number(amount) : undefined,
      details: selected === 'sleep' ? (sleepEvent === 'sleep' ? 'Уснул' : 'Проснулся') : (details || undefined),
    });
    setSelected(null);
    setAmount('');
    setDetails('');
    setSleepEvent('sleep');
    setSelectedDate(new Date());
    // Больше не делаем navigation.navigate('ActivityHistory', ...)
  };

  // Форматирование даты и времени
  const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const formatTime = (date: Date) => `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 16 }}>
      <Text variant="headlineLarge" style={{ marginBottom: 16, color: '#3730A3', fontWeight: 'bold', textAlign: 'center' }}>
        {child ? child.name : 'Ребенок не выбран'}
      </Text>
      <FlatList
        data={activityTypes}
        numColumns={3}
        keyExtractor={item => item.value}
        contentContainerStyle={{ alignItems: 'center', marginBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: item.color,
              width: 100,
              height: 100,
              borderRadius: 16,
              margin: 8,
              alignItems: 'center',
              justifyContent: 'center',
              elevation: selected === item.value ? 8 : 2,
              borderWidth: selected === item.value ? 2 : 0,
              borderColor: selected === item.value ? '#7C3AED' : 'transparent',
            }}
            onPress={() => setSelected(item.value)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={item.icon as any} size={40} color="#3730A3" />
            <Text style={{ color: '#3730A3', fontWeight: 'bold', fontSize: 15, marginTop: 8 }}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      {selected && (
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }}>
          <Text variant="titleMedium" style={{ marginBottom: 12, color: '#7C3AED', textAlign: 'center', ...darkText }}>
            {activityTypes.find(a => a.value === selected)?.label}
          </Text>
          {selected === 'sleep' && (
            <SegmentedButtons
              value={sleepEvent}
              onValueChange={v => setSleepEvent(v as 'sleep' | 'wake')}
              buttons={[
                { value: 'sleep', label: 'Уснул' },
                { value: 'wake', label: 'Проснулся' },
              ]}
              style={{ marginBottom: 12, borderRadius: 16 }}
            />
          )}
          {Platform.OS === 'web' ? (
            <input
              type="datetime-local"
              value={selectedDate.toISOString().slice(0, 16)}
              onChange={e => setSelectedDate(new Date(e.target.value))}
              style={{
                ...inputStyle,
                border: '1px solid #ccc',
                padding: 8,
                fontSize: 16,
                borderRadius: 16,
                width: '100%',
                marginBottom: 12,
                color: darkText.color,
              }}
            />
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={{ flex: 1, marginRight: 8, borderRadius: 16 }} textColor="#7C3AED">
                {formatDate(selectedDate)}
              </Button>
              <Button mode="outlined" onPress={() => setShowTimePicker(true)} style={{ flex: 1, marginLeft: 8, borderRadius: 16 }} textColor="#7C3AED">
                {formatTime(selectedDate)}
              </Button>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={(_event: any, d?: Date) => {
                    setShowDatePicker(false);
                    if (d) setSelectedDate(new Date(d.setHours(selectedDate.getHours(), selectedDate.getMinutes())));
                  }}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  display="default"
                  onChange={(_event: any, d?: Date) => {
                    setShowTimePicker(false);
                    if (d) setSelectedDate(new Date(selectedDate.setHours(d.getHours(), d.getMinutes())));
                  }}
                />
              )}
            </View>
          )}
          {(selected === 'feeding' || selected === 'water') && (
            <TextInput
              label="Количество (мл)"
              value={amount}
              onChangeText={v => setAmount(v.replace(/[^0-9]/g, ''))}
              style={{ ...inputStyle, marginBottom: 12 }}
              mode="outlined"
              keyboardType="numeric"
              inputMode="numeric"
              placeholderTextColor={darkText.color}
            />
          )}
          {selected === 'diaper' && (
            <TextInput
              label="Тип (мокрый/грязный)"
              value={details}
              onChangeText={setDetails}
              style={{ ...inputStyle, marginBottom: 12 }}
              mode="outlined"
              placeholderTextColor={darkText.color}
            />
          )}
          <Button mode="contained" onPress={handleAdd} style={{ ...buttonStyle, marginBottom: 8 }} buttonColor="#7C3AED">
            Сохранить
          </Button>
          <Button onPress={() => setSelected(null)} textColor="#7C3AED" style={buttonStyle}>Отмена</Button>
        </View>
      )}
      <View style={{ marginTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text variant="titleMedium" style={{ color: '#3730A3', marginRight: 8 }}>История за сегодня</Text>
          <Button mode="text" compact onPress={() => navigation.navigate('ActivityHistory', { childId })} textColor="#7C3AED" style={{ borderRadius: 16, height: 32, minWidth: 0, paddingHorizontal: 8 }}>
            Показать все
          </Button>
        </View>
        {history.length === 0 ? (
          <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 16 }}>Нет записей</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => {
              const typeInfo = activityTypes.find(a => a.value === item.type);
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                  <MaterialCommunityIcons name={typeInfo?.icon as any} size={28} color="#7C3AED" style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', color: '#3730A3' }}>{typeInfo?.label || item.type}</Text>
                    <Text style={{ color: '#64748B', fontSize: 13 }}>{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    {item.amount !== undefined && <Text style={{ color: '#64748B', fontSize: 13 }}>Количество: {item.amount} мл</Text>}
                    {item.details && <Text style={{ color: '#64748B', fontSize: 13 }}>{item.type === 'sleep' ? item.details : `Детали: ${item.details}`}</Text>}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
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
    <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 20 }}>
      {child && (
        <Text style={{ fontSize: 24, color: '#3730A3', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>{child.name}</Text>
      )}
      <Button
        mode="outlined"
        icon="calendar"
        onPress={() => setShowDate(true)}
        style={{ alignSelf: 'center', borderRadius: 16, marginBottom: 16, minWidth: 180 }}
        textColor="#7C3AED"
        labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
      >
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
        style={{ marginBottom: 20, borderRadius: 16, backgroundColor: '#fff' }}
        density="regular"
        theme={{ colors: { secondaryContainer: '#7C3AED' } }}
      />
      {filtered.length === 0 ? (
        <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 48, fontSize: 18, fontWeight: '500' }}>Нет записей</Text>
      ) : (
        filtered.map(a => (
          <Card key={a.id} style={{ marginBottom: 14, borderRadius: 16, backgroundColor: '#fff', elevation: 2 }}>
            <Card.Title
              title={<Text style={{ color: '#3730A3', fontWeight: 'bold', fontSize: 18 }}>{activityLabels[a.type] || a.type}</Text>}
              subtitle={<Text style={{ color: '#64748B', fontSize: 14 }}>{new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>}
              left={props => <MaterialCommunityIcons {...props} name={a.type === 'feeding' ? 'baby-bottle' : a.type === 'sleep' ? 'bed' : a.type === 'diaper' ? 'emoticon-poop' : a.type === 'bath' ? 'bathtub' : a.type === 'water' ? 'cup-water' : 'clock'} size={32} color="#7C3AED" style={{ marginRight: 8 }} />}
            />
            <Card.Content>
              {a.amount !== undefined && <Text style={{ color: '#64748B', fontSize: 14 }}>Количество: {a.amount} мл</Text>}
              {a.details && <Text style={{ color: '#64748B', fontSize: 14 }}>{a.type === 'sleep' ? a.details : `Детали: ${a.details}`}</Text>}
            </Card.Content>
          </Card>
        ))
      )}
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
