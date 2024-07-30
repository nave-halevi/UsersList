import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';

const App = () => {
  // State hooks
  const [users, setUsers] = useState([]); // List of users fetched from the server
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', phoneNumber: '', email: '', role: '' }); // Data for new or edited user
  const [isEditing, setIsEditing] = useState(false); // Whether we are editing an existing user
  const [currentUserId, setCurrentUserId] = useState(null); // ID of the user being edited
  const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'asc' }); // Sorting configuration

  // Fetch users from the server when the component mounts
  useEffect(() => {
    fetch('http://10.0.2.2:3000/users')
      .then((response) => response.json())
      .then((data) => setUsers(data)) // Update state with fetched users
      .catch((error) => console.error('Error fetching users:', error)); // Log error if fetch fails
  }, []);

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  // Handle save action for adding or updating a user
  const handleSave = () => {
    // Validate input fields
    if (!newUser.firstName || !newUser.lastName || !newUser.phoneNumber || !newUser.email || !newUser.role) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      Alert.alert('Validation Error', 'Invalid email format.');
      return;
    }
    if (!/^\d{10}$/.test(newUser.phoneNumber)) {
      Alert.alert('Validation Error', 'Phone number must be 10 digits long.');
      return;
    }
    if (!['manager', 'waiter'].includes(newUser.role.toLowerCase())) {
      Alert.alert('Validation Error', 'Role must be either "Manager" or "Waiter".');
      return;
    }

    // Determine the request method and URL based on editing status
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `http://10.0.2.2:3000/users/${currentUserId}` : 'http://10.0.2.2:3000/users';

    // Send the request to the server
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })
    .then((response) => {
      console.log('Response status:', response.status); // Log response status
      return response.json();
    })
    .then((data) => {
      console.log('Response data:', data); // Log response data

      // Update state based on whether we are editing or adding a new user
      if (isEditing) {
        setUsers(users.map((user) => (user.id === currentUserId ? data : user)));
        setIsEditing(false);
        setCurrentUserId(null);
      } else {
        setUsers([...users, data]);
      }
      setNewUser({ firstName: '', lastName: '', phoneNumber: '', email: '', role: '' });
      toggleModal();
    })
    .catch((error) => console.error('Error saving user:', error));
  };

  // Handle delete action for a user
  const handleDelete = (id) => {
    fetch(`http://10.0.2.2:3000/users/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setUsers(users.filter((user) => user.id !== id)); // Remove deleted user from the list
      })
      .catch((error) => console.error('Error deleting user:', error));
  };

  // Handle edit action for a user
  const handleEdit = (user) => {
    setNewUser(user);
    setCurrentUserId(user.id);
    setIsEditing(true);
    toggleModal();
  };

  // Handle sorting of user list
  const handleSort = (key) => {
    let direction = 'asc';

    // Toggle sort direction if the same key is clicked
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    // Sort users based on the selected key and direction
    const sortedUsers = [...users].sort((a, b) => {
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        // For numeric values
        return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
      } else {
        // For text values
        if (a[key].toLowerCase() < b[key].toLowerCase()) {
          return direction === 'asc' ? -1 : 1;
        }
        if (a[key].toLowerCase() > b[key].toLowerCase()) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });

    setUsers(sortedUsers);
  };

  return (
    <View style={styles.container}>
      <Button title="Add User" onPress={toggleModal} />
      <View style={styles.tableHeader}>
        {/* Table headers with sorting functionality */}
        <TouchableOpacity onPress={() => handleSort('firstName')}>
          <View style={styles.headerColumn}>
            <Text style={styles.headerText}>First</Text>
            <Text style={styles.headerText}>Name</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSort('lastName')}>
          <View style={styles.headerColumn}>
            <Text style={styles.headerText}>Last</Text>
            <Text style={styles.headerText}>Name</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSort('phoneNumber')}>
          <View style={styles.headerColumn}>
            <Text style={styles.headerText}>Phone</Text>
            <Text style={styles.headerText}>Number</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSort('email')}>
          <Text style={styles.headerText}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSort('role')}>
          <Text style={styles.headerText}>Role</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Actions</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userText}>{item.firstName}</Text>
            <Text style={styles.userText}>{item.lastName}</Text>
            <Text style={styles.userText}>{item.phoneNumber}</Text>
            <Text style={styles.userText}>{item.email}</Text>
            <Text style={styles.userText}>{item.role}</Text>
            <View style={styles.actionButtons}>
              {/* Edit and delete buttons */}
              <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEdit(item)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item.id)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContent}>
          {/* Form for adding or editing a user */}
          <TextInput
            placeholder="First Name"
            value={newUser.firstName}
            onChangeText={(text) => setNewUser({ ...newUser, firstName: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Last Name"
            value={newUser.lastName}
            onChangeText={(text) => setNewUser({ ...newUser, lastName: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Phone Number"
            value={newUser.phoneNumber}
            onChangeText={(text) => setNewUser({ ...newUser, phoneNumber: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={newUser.email}
            onChangeText={(text) => setNewUser({ ...newUser, email: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Role"
            value={newUser.role}
            onChangeText={(text) => setNewUser({ ...newUser, role: text })}
            style={styles.input}
          />
          <Button title="Save" onPress={handleSave} />
          <Button title="Cancel" onPress={toggleModal} />
        </View>
      </Modal>
    </View>
  );
};

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // או 'space-around' או 'flex-start' בהתאם לצורך
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerColumn: {
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center', // יישור טקסט למרכז
    marginHorizontal: 12, // הוספת מרווח אופקי בין הכותרות
  
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userText: {
    flex: 1,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginHorizontal: 5,
    padding: 5,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});


export default App;
