import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Searchbar, FAB, Card, Title, Paragraph, Chip, Button, Menu, Divider, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  AddDevice: undefined;
  DeviceDetails: { deviceId: number };
  EditDevice: { deviceId: number };
  CreateLoan: { deviceId: number };
  LoanDetails: { loanId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Device {
  id: number;
  nombre: string;
  categoria: string;
  estado: string;
  ubicacion?: string;
  ultimo_mantenimiento?: string;
  codigo_qr?: string;
  supervisor_id?: number;
  supervisorNombre?: string; // Para mostrar el nombre del supervisor
  lastUpdated?: string; // Si lo necesitas para UI
}

// Mock data para pruebas (ajusta los nombres de las propiedades)
const mockDevices: Device[] = [
  { 
    id: 1, 
    nombre: 'MacBook Pro', 
    categoria: 'Hardware', 
    estado: 'Available',
    ubicacion: 'Main Office',
    supervisor_id: 1,
    supervisorNombre: 'John Doe',
    ultimo_mantenimiento: '2023-05-01'
  },
  { 
    id: 2, 
    nombre: 'Dell XPS', 
    categoria: 'Hardware', 
    estado: 'In Use',
    ubicacion: 'Engineering Dept',
    supervisor_id: 2,
    supervisorNombre: 'Jane Smith',
    ultimo_mantenimiento: '2023-04-28'
  },
  { 
    id: 3, 
    nombre: 'iPad Pro', 
    categoria: 'Hardware', 
    estado: 'Maintenance',
    ubicacion: 'IT Department',
    supervisor_id: 3,
    supervisorNombre: 'Mike Johnson',
    ultimo_mantenimiento: '2023-05-03'
  },
  { 
    id: 4, 
    nombre: 'Adobe Creative Suite', 
    categoria: 'Software', 
    estado: 'Available',
    ubicacion: 'Design Dept',
    supervisor_id: 4,
    supervisorNombre: 'Sarah Williams',
    ultimo_mantenimiento: '2023-04-25'
  },
  { 
    id: 5, 
    nombre: 'Projector', 
    categoria: 'Hardware',
    estado: 'In Use',
    ubicacion: 'Conference Room',
    supervisor_id: 1,
    supervisorNombre: 'John Doe',
    ultimo_mantenimiento: '2023-05-02'
  },
];

const DevicesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [devices, setDevices] = useState(mockDevices);
  const [filteredDevices, setFilteredDevices] = useState(mockDevices);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Available' | 'In Use' | 'Maintenance' | 'Hardware' | 'Software'>('All');

  // In a real app, we would fetch data here
  useEffect(() => {
    // Simulating data fetch
    const fetchDevices = async () => {
      // In a real app, this would be an API call
      setDevices(mockDevices);
      setFilteredDevices(mockDevices);
    };

    fetchDevices();
  }, []);

  // Handle search
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      applyFilter(activeFilter);
    } else {
      const filtered = devices.filter(device => 
        device.nombre.toLowerCase().includes(query.toLowerCase()) ||
        device.categoria.toLowerCase().includes(query.toLowerCase()) ||
        (device.ubicacion ?? '').toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDevices(filtered);
    }
  };

  // Apply filter
  const applyFilter = (filterType: 'All' | 'Available' | 'In Use' | 'Maintenance' | 'Hardware' | 'Software') => {
    setActiveFilter(filterType);
    let filtered = devices;
    
    if (filterType === 'Available') {
      filtered = devices.filter(device => device.estado === 'Available');
    } else if (filterType === 'In Use') {
      filtered = devices.filter(device => device.estado === 'In Use');
    } else if (filterType === 'Maintenance') {
      filtered = devices.filter(device => device.estado === 'Maintenance');
    } else if (filterType === 'Hardware') {
      filtered = devices.filter(device => device.categoria === 'Hardware');
    } else if (filterType === 'Software') {
      filtered = devices.filter(device => device.categoria === 'Software');
    }
    
    // If there's an active search, apply that too
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(device => 
        device.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (device.ubicacion ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredDevices(filtered);
    setFilterMenuVisible(false);
  };

  // Delete device
  const deleteDevice = (id: number) => {
    Alert.alert(
      'Delete Device',
      'Are you sure you want to delete this device?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // In a real app, this would be an API call
            const updatedDevices = devices.filter(device => device.id !== id);
            setDevices(updatedDevices);
            setFilteredDevices(updatedDevices.filter(device => {
              if (activeFilter === 'All') return true;
              if (activeFilter === 'Available') return device.estado === 'Available';
              if (activeFilter === 'In Use') return device.estado === 'In Use';
              if (activeFilter === 'Maintenance') return device.estado === 'Maintenance';
              if (activeFilter === 'Hardware') return device.categoria === 'Hardware';
              if (activeFilter === 'Software') return device.categoria === 'Software';
              return true;
            }));
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  // Render device card
  const renderDeviceCard = ({ item }: { item: Device }) => {
    // Set status color
    let statusColor = '#4CD964'; // Available - green
    if (item.estado === 'In Use') statusColor = '#007AFF'; // Blue
    if (item.estado === 'Maintenance') statusColor = '#FF9500'; // Orange

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>{item.nombre}</Title>
            <Chip 
              mode="outlined" 
              style={[styles.statusChip, { borderColor: statusColor }]}
              textStyle={{ color: statusColor }}
            >
              {item.estado}
            </Chip>
          </View>
          
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Icon name="shape" size={16} color="#8e8e93" style={styles.detailIcon} />
              <Paragraph>{item.categoria}</Paragraph>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="map-marker" size={16} color="#8e8e93" style={styles.detailIcon} />
              <Paragraph>{item.ubicacion}</Paragraph>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="account" size={16} color="#8e8e93" style={styles.detailIcon} />
              <Paragraph>{item.supervisorNombre}</Paragraph>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="calendar" size={16} color="#8e8e93" style={styles.detailIcon} />
              <Paragraph>Último mantenimiento: {item.ultimo_mantenimiento}</Paragraph>
            </View>
          </View>
        </Card.Content>
        
        <Card.Actions>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('DeviceDetails', { deviceId: item.id })}
          >
            View
          </Button>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('EditDevice', { deviceId: item.id })}
          >
            Edit
          </Button>
          <Button 
            mode="text" 
            onPress={() => deleteDevice(item.id)}
            textColor="#FF3B30"
          >
            Delete
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search devices"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <IconButton
              icon="filter-variant"
              size={24}
              onPress={() => setFilterMenuVisible(true)}
              style={styles.filterButton}
            />
          }
        >
          <Menu.Item onPress={() => applyFilter('All')} title="All Devices" />
          <Divider />
          <Menu.Item onPress={() => applyFilter('Available')} title="Available" />
          <Menu.Item onPress={() => applyFilter('In Use')} title="In Use" />
          <Menu.Item onPress={() => applyFilter('Maintenance')} title="Maintenance" />
          <Divider />
          <Menu.Item onPress={() => applyFilter('Hardware')} title="Hardware" />
          <Menu.Item onPress={() => applyFilter('Software')} title="Software" />
        </Menu>
      </View>
      
      {activeFilter !== 'All' && (
        <View style={styles.activeFilterContainer}>
          <Chip 
            mode="outlined" 
            onClose={() => applyFilter('All')}
            style={styles.activeFilterChip}
          >
            Filter: {activeFilter}
          </Chip>
        </View>
      )}
      
      <FlatList
        data={filteredDevices}
        renderItem={renderDeviceCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddDevice')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    alignSelf: 'center',
  },
  activeFilterContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  activeFilterChip: {
    alignSelf: 'flex-start',
  },
  listContainer: {
    padding: 8,
  },
  card: {
    marginBottom: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    height: 26,
  },
  cardDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
});

export default DevicesScreen;