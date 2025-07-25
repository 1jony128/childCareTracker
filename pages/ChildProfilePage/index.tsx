import * as React from 'react';
import { Text, Button, Avatar, TextInput, HelperText, Dialog, Portal, Appbar } from 'react-native-paper';
import { View, Platform, TouchableOpacity, TextInput as RNTextInput, Dimensions, ScrollView } from 'react-native';
import { useAppState, ActivityType } from '../../AppState';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ChildProfileScreen({ route, navigation }: any) {
  const { childId, isNew, editMode } = route.params || {};
  const { children, addChild, updateChild, removeChild } = useAppState();
  const editing = !isNew && childId;
  const child = editing ? children.find(c => c.id === childId) : undefined;

  const [name, setName] = React.useState(child?.name || '');
  const [dob, setDob] = React.useState(child?.dob || '');
  const [showDialog, setShowDialog] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);

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
      updateChild({ ...child, name: name.trim(), dob, activities });
    } else {
      addChild({ name: name.trim(), dob, activities });
      navigation.replace('ChildrenList');
      return;
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (editing && child) {
      removeChild(child.id);
    }
    navigation.goBack();
  };

  const defaultActivityTypes = [
    { type: 'feeding', label: 'Кормление', icon: 'baby-bottle' },
    { type: 'sleep', label: 'Сон', icon: 'bed' },
    { type: 'diaper', label: 'Подгузник', icon: 'emoticon-poop' },
    { type: 'bath', label: 'Купание', icon: 'bathtub' },
    { type: 'water', label: 'Вода', icon: 'cup-water' },
  ];
  const proActivityTypes = [
    { type: 'walk', label: 'Прогулка', icon: 'walk' },
    { type: 'play', label: 'Игры', icon: 'puzzle' },
    { type: 'medicine', label: 'Лекарства', icon: 'pill' },
    { type: 'temperature', label: 'Температура', icon: 'thermometer' },
    { type: 'weight', label: 'Вес/рост', icon: 'scale-bathroom' },
    { type: 'milestone', label: 'Вехи', icon: 'star' },
    { type: 'doctor', label: 'Врач', icon: 'doctor' },
    { type: 'mood', label: 'Настроение', icon: 'emoticon-happy' },
    { type: 'spitup', label: 'Срыгивания', icon: 'emoticon-sad' },
    { type: 'tummytime', label: 'Животик', icon: 'baby-face-outline' },
  ];
  const allActivityTypes = [...defaultActivityTypes, ...proActivityTypes];

  const [activities, setActivities] = React.useState<{
    type: ActivityType;
    hidden?: boolean;
  }[]>(child?.activities || defaultActivityTypes.map(a => ({ type: a.type as ActivityType })));

  const toggleActivity = (type: ActivityType) => {
    setActivities(prev =>
      prev.some(a => a.type === type)
        ? prev.filter(a => a.type !== type)
        : [...prev, { type }]
    );
  };
  const toggleHidden = (type: ActivityType) => {
    setActivities(prev =>
      prev.map(a =>
        a.type === type ? { ...a, hidden: !a.hidden } : a
      )
    );
  };

  const windowHeight = Dimensions.get('window').height;

  // Компонент выбора даты
  function DateInput() {
    if (Platform.OS === 'web') {
      return (
        <View style={{ marginBottom: 12 }}>
          <label style={{ color: '#1E1B1C', fontWeight: 'bold', marginBottom: 4, fontSize: 16 }}>Дата рождения</label>
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 16,
              border: '1px solid #7C3AED',
              padding: '0 12px',
              fontSize: 16,
              color: '#1E1B1C',
              background: '#fff',
              marginTop: 4
            }}
          />
        </View>
      );
    }
    return (
      <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8} style={{ marginBottom: 12 }}>
        <TextInput
          label="Дата рождения (ГГГГ-ММ-ДД)"
          value={dob}
          editable={false}
          style={{ backgroundColor: '#fff', borderRadius: 16, height: 48, fontSize: 16, color: '#1E1B1C' }}
          mode="outlined"
          placeholder="Дата рождения (ГГГГ-ММ-ДД)"
          placeholderTextColor="#1E1B1C"
          theme={{ colors: { text: '#1E1B1C', placeholder: '#1E1B1C', primary: '#7C3AED', background: '#fff' } }}
        />
        {showDatePicker && (
          <DateTimePicker
            value={dob ? new Date(dob) : new Date()}
            mode="date"
            display="default"
            onChange={(_event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const yyyy = selectedDate.getFullYear();
                const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const dd = String(selectedDate.getDate()).padStart(2, '0');
                setDob(`${yyyy}-${mm}-${dd}`);
              }
            }}
          />
        )}
      </TouchableOpacity>
    );
  }

  if (editing && child && !editMode) {
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
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F3F4F6' }}>
      <Text variant="headlineMedium" style={{ marginBottom: 24, color: '#3730A3', fontWeight: 'bold' }}>{isNew ? 'Добавить ребенка' : 'Редактировать профиль'}</Text>
      <Avatar.Icon icon="account-child" size={72} style={{ alignSelf: 'center', marginBottom: 24, backgroundColor: '#A5B4FC' }} color="#3730A3" />
      {Platform.OS === 'web' ? (
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: '#1E1B1C', fontWeight: 'bold', marginBottom: 4, fontSize: 16 }}>Имя</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Имя"
            style={{
              width: '100%',
              height: 48,
              borderRadius: 16,
              border: '1px solid #7C3AED',
              padding: '0 12px',
              fontSize: 16,
              color: '#1E1B1C',
              background: '#fff',
              fontWeight: 600,
              marginTop: 4
            }}
          />
        </div>
      ) : (
        <TextInput
          label="Имя"
          value={name}
          onChangeText={setName}
          style={{ marginBottom: 12, backgroundColor: '#fff', borderRadius: 16, height: 48, fontSize: 16, color: '#1E1B1C', fontWeight: '600' }}
          mode="outlined"
          placeholder="Имя"
          placeholderTextColor="#1E1B1C"
          theme={{ colors: { text: '#1E1B1C', placeholder: '#1E1B1C', primary: '#7C3AED', background: '#fff' } }}
        />
      )}
      <DateInput />
      <HelperText type="error" visible={!name.trim() || !dob} style={{ color: '#EF4444', fontWeight: '500' }}>
        Имя и дата рождения обязательны
      </HelperText>
      <View style={{ marginBottom: 20, maxHeight: windowHeight * 0.4 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#3730A3', marginBottom: 8 }}>Активности ребёнка</Text>
        <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} showsVerticalScrollIndicator={true}>
          {allActivityTypes.map(act => {
            const selected = activities.some(a => a.type === act.type);
            const hidden = activities.find(a => a.type === act.type)?.hidden;
            return (
              <TouchableOpacity
                key={act.type}
                style={{
                  backgroundColor: selected ? (hidden ? '#E0E7FF' : '#7C3AED') : '#fff',
                  borderRadius: 16,
                  width: 90,
                  height: 90,
                  margin: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? (hidden ? '#A5B4FC' : '#7C3AED') : '#ccc',
                  opacity: hidden ? 0.5 : 1,
                }}
                onPress={() => toggleActivity(act.type as ActivityType)}
                onLongPress={selected ? () => toggleHidden(act.type as ActivityType) : undefined}
                activeOpacity={0.85}
              >
                <Avatar.Icon icon={act.icon} size={36} style={{ backgroundColor: 'transparent' }} color={selected ? (hidden ? '#A5B4FC' : '#fff') : '#7C3AED'} />
                <Text style={{ color: selected ? (hidden ? '#A5B4FC' : '#fff') : '#3730A3', fontWeight: 'bold', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{act.label}</Text>
                {selected && (
                  <Text style={{ fontSize: 10, color: hidden ? '#A5B4FC' : '#fff', marginTop: 2 }}>{hidden ? 'Скрыто' : 'Включено'}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={{ color: '#64748B', fontSize: 12, marginTop: 6 }}>
          Долгое нажатие — скрыть/показать активность (статистика сохранится)
        </Text>
      </View>
      <Button mode="contained" onPress={handleSave} disabled={!name.trim() || !dob} style={{ borderRadius: 16, marginBottom: 8, backgroundColor: '#7C3AED' }} labelStyle={{ color: '#fff', fontWeight: 'bold' }}>
        Сохранить
      </Button>
      {!isNew && (
        <Button mode="outlined" onPress={() => setShowDialog(true)} style={{ borderRadius: 16, marginBottom: 8, borderColor: '#EF4444' }} labelStyle={{ color: '#EF4444', fontWeight: 'bold' }}>
          Удалить
        </Button>
      )}
      <Button onPress={() => { isNew ? navigation.replace('ChildrenList') : navigation.goBack(); }} style={{ borderRadius: 16 }} labelStyle={{ color: '#7C3AED', fontWeight: 'bold' }}>Отмена</Button>
      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Удалить профиль?</Dialog.Title>
          <Dialog.Content>
            <Text>Вы уверены, что хотите удалить профиль ребенка?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)} labelStyle={{ color: '#7C3AED', fontWeight: 'bold' }}>Отмена</Button>
            <Button onPress={handleDelete} labelStyle={{ color: '#EF4444', fontWeight: 'bold' }}>Удалить</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
