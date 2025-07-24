import * as React from 'react';
import { Text, Button, Avatar, TextInput, HelperText, Dialog, Portal, Appbar } from 'react-native-paper';
import { View } from 'react-native';
import { useAppState } from '../../AppState';

export default function ChildProfileScreen({ route, navigation }: any) {
  const { childId, isNew } = route.params || {};
  const { children, addChild, updateChild, removeChild } = useAppState();
  const editing = !isNew && childId;
  const child = editing ? children.find(c => c.id === childId) : undefined;

  const [name, setName] = React.useState(child?.name || '');
  const [dob, setDob] = React.useState(child?.dob || '');
  const [showDialog, setShowDialog] = React.useState(false);

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
        style={{ marginBottom: 12, backgroundColor: '#F8FAFC', borderRadius: 16, height: 48, fontSize: 16 }}
        mode="outlined"
        placeholderTextColor="#1E1B1C"
      />
      <TextInput
        label="Дата рождения (ГГГГ-ММ-ДД)"
        value={dob}
        onChangeText={setDob}
        style={{ marginBottom: 12, backgroundColor: '#F8FAFC', borderRadius: 16, height: 48, fontSize: 16 }}
        mode="outlined"
        placeholderTextColor="#1E1B1C"
      />
      <HelperText type="error" visible={!name.trim() || !dob}>
        Имя и дата рождения обязательны
      </HelperText>
      <Button mode="contained" onPress={handleSave} disabled={!name.trim() || !dob} style={{ borderRadius: 16, marginBottom: 8 }}>
        Сохранить
      </Button>
      {!isNew && (
        <Button mode="outlined" onPress={() => setShowDialog(true)} style={{ borderRadius: 16, marginBottom: 8 }}>
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
