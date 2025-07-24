import * as React from 'react';
import { Text, Button, Avatar, TextInput, HelperText, Dialog, Portal, Appbar } from 'react-native-paper';
import { View, Platform, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { useAppState } from '../../AppState';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ChildProfileScreen({ route, navigation }: any) {
  const { childId, isNew } = route.params || {};
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
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F3F4F6' }}>
      <Text variant="headlineMedium" style={{ marginBottom: 24, color: '#3730A3', fontWeight: 'bold' }}>{isNew ? 'Добавить ребенка' : 'Редактировать профиль'}</Text>
      <Avatar.Icon icon="account-child" size={72} style={{ alignSelf: 'center', marginBottom: 24, backgroundColor: '#A5B4FC' }} color="#3730A3" />
      <TextInput
        label="Имя"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 12, backgroundColor: '#fff', borderRadius: 16, height: 48, fontSize: 16, color: '#1E1B1C' }}
        mode="outlined"
        placeholder="Имя"
        placeholderTextColor="#1E1B1C"
        theme={{ colors: { text: '#1E1B1C', placeholder: '#1E1B1C', primary: '#7C3AED', background: '#fff' } }}
      />
      <DateInput />
      <HelperText type="error" visible={!name.trim() || !dob} style={{ color: '#EF4444', fontWeight: '500' }}>
        Имя и дата рождения обязательны
      </HelperText>
      <Button mode="contained" onPress={handleSave} disabled={!name.trim() || !dob} style={{ borderRadius: 16, marginBottom: 8, backgroundColor: '#7C3AED' }} labelStyle={{ color: '#fff', fontWeight: 'bold' }}>
        Сохранить
      </Button>
      {!isNew && (
        <Button mode="outlined" onPress={() => setShowDialog(true)} style={{ borderRadius: 16, marginBottom: 8, borderColor: '#EF4444' }} labelStyle={{ color: '#EF4444', fontWeight: 'bold' }}>
          Удалить
        </Button>
      )}
      <Button onPress={() => navigation.goBack()} style={{ borderRadius: 16 }} labelStyle={{ color: '#7C3AED', fontWeight: 'bold' }}>Отмена</Button>
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
