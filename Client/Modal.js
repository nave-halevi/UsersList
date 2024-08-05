import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal as RNModal } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

const Modal = ({ visible, onClose, newUser, setNewUser, handleSave}) => {
    const handleCancel = () => {
        setNewUser({ firstName: '', lastName: '', phoneNumber: '', email: '', role: '' });
        onClose();
    };
       // פונקציה לקבלת כותרת המודל
       const modalTitleName = (user) => {
        return user.firstName === '' ? 'Add User' : 'Edit User';
    };
 
    
    //   if (!visible) return null;
    
    return (
    <RNModal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{modalTitleName(newUser)}</Text>{}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={newUser.firstName}
          onChangeText={(text) => setNewUser({ ...newUser, firstName: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={newUser.lastName}
          onChangeText={(text) => setNewUser({ ...newUser, lastName: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={newUser.phoneNumber}
          onChangeText={(text) => setNewUser({ ...newUser, phoneNumber: text })}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={newUser.email}
          onChangeText={(text) => setNewUser({ ...newUser, email: text })}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Role"
          value={newUser.role}
          onChangeText={(text) => setNewUser({ ...newUser, role: text })}
        />   
        
{/*       
        <SelectDropdown
          data={['Manager', 'Waiter']}
          defaultValue={newUser.role}
          onSelect={(selectedItem) => setNewUser({ ...newUser, role: selectedItem })}
          buttonTextAfterSelection={(selectedItem) => selectedItem}
          rowTextForSelection={(item) => item}
        /> */}
        <View style={styles.buttonContainer}>
          <Button title="Save" onPress={handleSave} />
          <Button title="Cancel" onPress={handleCancel} />
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  dropdownButton: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  }


});

export default Modal;
