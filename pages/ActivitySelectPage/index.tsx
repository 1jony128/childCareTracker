import * as React from 'react';
import { Text, Button, Card, Avatar, TextInput, Appbar } from 'react-native-paper';
import { View, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useAppState } from '../../AppState';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ActivitySelectScreen({ route, navigation }: any) {
  const { childId } = route.params || {};
  const { children, addActivity, activities } = useAppState();
  const child = children.find(c => c.id === childId);

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

  const [selected, setSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadSelected = async () => {
      let last = null;
      if (Platform.OS === 'web') {
        last = localStorage.getItem('lastActivityType');
      } else {
        last = await AsyncStorage.getItem('lastActivityType');
      }
      if (last && activityTypes.some(a => a.value === last)) {
        setSelected(last);
      } else {
        setSelected(activityTypes[0].value);
      }
    };
    loadSelected();
  }, []);

  React.useEffect(() => {
    if (selected) {
      if (Platform.OS === 'web') {
        localStorage.setItem('lastActivityType', selected);
      } else {
        AsyncStorage.setItem('lastActivityType', selected);
      }
    }
  }, [selected]);

  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [sleepEvent, setSleepEvent] = React.useState<'sleep' | 'wake'>('sleep');

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
  };

  const formatTime = (date: Date) => `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;

  React.useEffect(() => {
    if (selected) {
      const now = new Date();
      now.setSeconds(0);
      now.setMilliseconds(0);
      setSelectedDate(now);
    }
  }, [selected]);

  React.useEffect(() => {
    if (selected === 'diaper') {
      setDetails('Мокрый');
    }
  }, [selected]);

  const inputStyle = { backgroundColor: '#F8FAFC', borderRadius: 16, height: 48, fontSize: 16 };
  const buttonStyle = { borderRadius: 16 };
  const darkText = { color: 'rgb(30,27,28)' };

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
            <View style={{ flexDirection: 'row', marginBottom: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#ccc' }}>
              {['sleep', 'wake'].map(val => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setSleepEvent(val as 'sleep' | 'wake')}
                  style={{
                    flex: 1,
                    backgroundColor: sleepEvent === val ? '#7C3AED' : 'transparent',
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: sleepEvent === val ? '#fff' : '#3730A3', fontWeight: 'bold', fontSize: 16 }}>
                    {val === 'sleep' ? 'Уснул' : 'Проснулся'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {(selected === 'feeding' || selected === 'water') && (
            Platform.OS === 'web' ? (
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                style={{
                  color: darkText.color,
                  background: '#F8FAFC',
                  border: '1px solid #ccc',
                  borderRadius: 16,
                  fontSize: 16,
                  height: 48,
                  padding: 8,
                  width: '100%',
                  marginBottom: 12,
                }}
                placeholder="Количество (мл)"
              />
            ) : (
              <TextInput
                label="Количество (мл)"
                value={amount}
                onChangeText={v => setAmount(v.replace(/[^0-9]/g, ''))}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  fontSize: 16,
                  height: 48,
                  paddingHorizontal: 8,
                  color: darkText.color,
                  marginBottom: 12,
                }}
                mode="flat"
                keyboardType="numeric"
                inputMode="numeric"
                placeholderTextColor={darkText.color}
              />
            )
          )}
          {selected === 'diaper' && (
            <View style={{ flexDirection: 'row', marginBottom: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#ccc' }}>
              {['wet', 'dirty'].map(val => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setDetails(val === 'wet' ? 'Мокрый' : 'Грязный')}
                  style={{
                    flex: 1,
                    backgroundColor: details === (val === 'wet' ? 'Мокрый' : 'Грязный') ? '#7C3AED' : 'transparent',
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: details === (val === 'wet' ? 'Мокрый' : 'Грязный') ? '#fff' : '#3730A3', fontWeight: 'bold', fontSize: 16 }}>
                    {val === 'wet' ? 'Мокрый' : 'Грязный'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {/* Выбор времени для всех активностей */}
          {Platform.OS === 'web' ? (
            <input
              type="time"
              value={formatTime(selectedDate)}
              onChange={e => {
                const [hour, minute] = e.target.value.split(':').map(Number);
                const today = new Date();
                today.setHours(hour);
                today.setMinutes(minute);
                today.setSeconds(0);
                today.setMilliseconds(0);
                setSelectedDate(today);
              }}
              style={{
                color: darkText.color,
                background: '#F8FAFC',
                border: '1px solid #ccc',
                borderRadius: 16,
                fontSize: 16,
                height: 48,
                padding: 8,
                width: '100%',
                marginBottom: 12,
              }}
            />
          ) : (
            <View style={{ marginBottom: 12 }}>
              <Button mode="outlined" onPress={() => setShowTimePicker(true)} style={{ borderRadius: 16 }} textColor="#7C3AED">
                {formatTime(selectedDate)}
              </Button>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  display="default"
                  onChange={(_event: any, d?: Date) => {
                    setShowTimePicker(false);
                    if (d) {
                      const today = new Date();
                      today.setHours(d.getHours());
                      today.setMinutes(d.getMinutes());
                      today.setSeconds(0);
                      today.setMilliseconds(0);
                      setSelectedDate(today);
                    }
                  }}
                />
              )}
            </View>
          )}
          <Button mode="contained" onPress={handleAdd} style={{ ...buttonStyle, marginBottom: 8 }} buttonColor="#7C3AED" textColor="#fff">
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
