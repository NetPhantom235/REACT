import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Headline, HelperText, Divider, Menu, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  QRScanner: { returnScreen: string };
  AddDevice: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddDeviceScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [status, setStatus] = useState('Available');
  
  // Menu state
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [supervisorMenuVisible, setSupervisorMenuVisible] = useState(false);
  
  // Mock data for dropdowns
  const categories = ['Hardware', 'Software', 'Peripheral', 'Network', 'Other'];
  const statuses = ['Available', 'In Use', 'Maintenance'];
  const supervisors = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    { id: '4', name: 'Sarah Williams' },
    { id: '5', name: 'Robert Brown' },
  ];
  
  // Validation
  const hasNameError = () => name.trim() === '';
  const hasCategoryError = () => category.trim() === '';
  const hasLocationError = () => location.trim() === '';
  const hasSupervisorError = () => supervisor.trim() === '';
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (hasNameError() || hasCategoryError() || hasLocationError() || hasSupervisorError()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    // In a real app, this would be an API call to save the device
    Alert.alert(
      'Success',
      'Device added successfully',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };
  
  // Handle scan QR code
  const handleScanQR = () => {
    navigation.navigate('QRScanner', { returnScreen: 'AddDevice' });
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Headline style={styles.headline}>Add New Device</Headline>
        
        <TextInput
          label="Device Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          error={hasNameError()}
        />
        <HelperText type="error" visible={hasNameError()}>
          Device name is required
        </HelperText>
        
        <View style={styles.dropdownContainer}>
          <TextInput
            label="Category *"
            value={category}
            mode="outlined"
            style={styles.input}
            error={hasCategoryError()}
            right={<TextInput.Icon icon="menu-down" onPress={() => setCategoryMenuVisible(true)} />}
            showSoftInputOnFocus={false}
            onPressIn={() => setCategoryMenuVisible(true)}
          />
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={{ x: 0, y: 0 }}
            style={styles.menu}
          >
            {categories.map((cat) => (
              <Menu.Item
                key={cat}
                title={cat}
                onPress={() => {
                  setCategory(cat);
                  setCategoryMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </View>
        <HelperText type="error" visible={hasCategoryError()}>
          Category is required
        </HelperText>
        
        <TextInput
          label="Location *"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          style={styles.input}
          error={hasLocationError()}
        />
        <HelperText type="error" visible={hasLocationError()}>
          Location is required
        </HelperText>
        
        <View style={styles.dropdownContainer}>
          <TextInput
            label="Supervisor *"
            value={supervisor}
            mode="outlined"
            style={styles.input}
            error={hasSupervisorError()}
            right={<TextInput.Icon icon="menu-down" onPress={() => setSupervisorMenuVisible(true)} />}
            showSoftInputOnFocus={false}
            onPressIn={() => setSupervisorMenuVisible(true)}
          />
          <Menu
            visible={supervisorMenuVisible}
            onDismiss={() => setSupervisorMenuVisible(false)}
            anchor={{ x: 0, y: 0 }}
            style={styles.menu}
          >
            {supervisors.map((sup) => (
              <Menu.Item
                key={sup.id}
                title={sup.name}
                onPress={() => {
                  setSupervisor(sup.name);
                  setSupervisorMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </View>
        <HelperText type="error" visible={hasSupervisorError()}>
          Supervisor is required
        </HelperText>
        
        <View style={styles.dropdownContainer}>
          <TextInput
            label="Status"
            value={status}
            mode="outlined"
            style={styles.input}
            right={<TextInput.Icon icon="menu-down" onPress={() => setStatusMenuVisible(true)} />}
            showSoftInputOnFocus={false}
            onPressIn={() => setStatusMenuVisible(true)}
          />
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={{ x: 0, y: 0 }}
            style={styles.menu}
          >
            {statuses.map((stat) => (
              <Menu.Item
                key={stat}
                title={stat}
                onPress={() => {
                  setStatus(stat);
                  setStatusMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleScanQR}
            style={[styles.button, styles.scanButton]}
            icon="qrcode-scan"
          >
            Scan QR Code
          </Button>
          
          <Button 
            mode="contained" 
            onPress={handleSubmit}
            style={styles.button}
            disabled={hasNameError() || hasCategoryError() || hasLocationError() || hasSupervisorError()}
          >
            Add Device
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  headline: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    position: 'relative',
  },
  menu: {
    width: '90%',
    marginTop: 60,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    marginVertical: 8,
  },
  scanButton: {
    backgroundColor: '#5856D6',
  },
});

export default AddDeviceScreen;