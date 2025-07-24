import * as React from 'react';
import { Text, Button, Card } from 'react-native-paper';
import { View, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useAppState } from '../../AppState';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ActivityHistoryScreen({ route, navigation }: any) {
  const { childId } = route.params || {};
  const { children, activities } = useAppState();
  const child = children.find(c => c.id === childId);

  const activityTypes = [
    { value: 'all', label: 'Все', icon: 'apps' },
    { value: 'feeding', label: 'Кормление', icon: 'baby-bottle' },
    { value: 'sleep', label: 'Сон', icon: 'bed' },
    { value: 'diaper', label: 'Подгузник', icon: 'emoticon-poop' },
    { value: 'bath', label: 'Купание', icon: 'bathtub' },
    { value: 'water', label: 'Вода', icon: 'cup-water' },
  ];

  const [selectedType, setSelectedType] = React.useState('all');
  const [period, setPeriod] = React.useState<'day' | 'week' | 'month' | 'year'>('day');
  const [date, setDate] = React.useState(new Date());
  const [showDate, setShowDate] = React.useState(false);

  // Фильтрация по периоду
  const getPeriodStart = () => {
    const d = new Date(date);
    if (period === 'day') {
      d.setHours(0,0,0,0);
      return d;
    }
    if (period === 'week') {
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      d.setHours(0,0,0,0);
      return d;
    }
    if (period === 'month') {
      d.setDate(1);
      d.setHours(0,0,0,0);
      return d;
    }
    if (period === 'year') {
      d.setMonth(0,1);
      d.setHours(0,0,0,0);
      return d;
    }
    return d;
  };
  const periodStart = getPeriodStart();
  const periodEnd = new Date(periodStart);
  if (period === 'day') periodEnd.setDate(periodEnd.getDate() + 1);
  if (period === 'week') periodEnd.setDate(periodEnd.getDate() + 7);
  if (period === 'month') periodEnd.setMonth(periodEnd.getMonth() + 1);
  if (period === 'year') periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const filtered = activities.filter(a => {
    if (childId && a.childId !== childId) return false;
    const t = new Date(a.time);
    if (t < periodStart || t >= periodEnd) return false;
    if (selectedType !== 'all' && a.type !== selectedType) return false;
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 20 }}>
      {child && (
        <Text style={{ fontSize: 24, color: '#3730A3', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>{child.name}</Text>
      )}
      {/* Сетка карточек-активностей */}
      <FlatList
        data={activityTypes}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.value}
        contentContainerStyle={{ marginBottom: 24, alignItems: 'center', paddingHorizontal: 0 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: selectedType === item.value ? '#7C3AED' : '#fff',
              borderRadius: 16,
              width: 96,
              height: 96,
              margin: 8,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: selectedType === item.value ? 2 : 1,
              borderColor: selectedType === item.value ? '#7C3AED' : '#ccc',
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: selectedType === item.value ? 4 : 1,
            }}
            onPress={() => setSelectedType(item.value)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name={item.icon as any} size={36} color={selectedType === item.value ? '#fff' : '#7C3AED'} />
            <Text style={{ color: selectedType === item.value ? '#fff' : '#3730A3', fontWeight: 'bold', fontSize: 15, marginTop: 8, textAlign: 'center' }}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      {/* Фильтр по периоду */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 20, paddingHorizontal: 0 }}>
        {['day','week','month','year'].map(p => (
          <Button
            key={p}
            mode={period === p ? 'contained' : 'outlined'}
            onPress={() => setPeriod(p as any)}
            style={{ borderRadius: 16, marginHorizontal: 2, minWidth: 90, paddingHorizontal: 0 }}
            buttonColor={period === p ? '#7C3AED' : undefined}
            textColor={period === p ? '#fff' : '#7C3AED'}
            labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
          >
            {p === 'day' ? 'День' : p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Год'}
          </Button>
        ))}
        <Button icon="calendar" mode="text" onPress={() => setShowDate(true)} style={{ borderRadius: 16, marginLeft: 8, minWidth: 48, paddingHorizontal: 0 }} textColor="#7C3AED">{''}</Button>
      </ScrollView>
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
      {/* Список активностей */}
      {filtered.length === 0 ? (
        <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 48, fontSize: 18, fontWeight: '500' }}>Нет записей</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={({ item: a }) => (
            <Card style={{ marginBottom: 20, borderRadius: 16, backgroundColor: '#fff', elevation: 2 }}>
              <Card.Title
                title={<Text style={{ color: '#3730A3', fontWeight: 'bold', fontSize: 18 }}>{activityTypes.find(t => t.value === a.type)?.label || a.type}</Text>}
                subtitle={<Text style={{ color: '#64748B', fontSize: 14 }}>{new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>}
                left={props => <MaterialCommunityIcons {...props} name={activityTypes.find(t => t.value === a.type)?.icon as any} size={32} color="#7C3AED" style={{ marginRight: 8 }} />}
              />
              <Card.Content>
                {a.amount !== undefined && <Text style={{ color: '#64748B', fontSize: 14 }}>{a.amount} мл</Text>}
                {a.details && <Text style={{ color: '#64748B', fontSize: 14 }}>{a.type === 'sleep' ? a.details : a.type === 'diaper' ? a.details : `Детали: ${a.details}`}</Text>}
              </Card.Content>
            </Card>
          )}
        />
      )}
    </View>
  );
}
