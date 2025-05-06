import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Searchbar, FAB, Card, Title, Paragraph, Chip, Button, Menu, Divider, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the navigation param list for this stack
type RootStackParamList = {
  SupervisorDetails: { supervisorId: string };
  EditSupervisor: { supervisorId: string };
  AddSupervisor: undefined;
  // Add other screens if needed
};

// Supervisor type definition
interface Supervisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  permission: 'Admin' | 'Basic' | 'Auditor';
  status: 'Active' | 'Inactive';
  registrationDate: string;
}

// Mock data for supervisors
const mockSupervisors: Supervisor[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john.doe@example.com', 
    phone: '555-123-4567',
    permission: 'Admin',
    status: 'Active',
    registrationDate: '2023-01-15'
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'jane.smith@example.com', 
    phone: '555-987-6543',
    permission: 'Basic',
    status: 'Active',
    registrationDate: '2023-02-20'
  },
  { 
    id: '3', 
    name: 'Mike Johnson', 
    email: 'mike.johnson@example.com', 
    phone: '555-456-7890',
    permission: 'Auditor',
    status: 'Active',
    registrationDate: '2023-03-10'
  },
  { 
    id: '4', 
    name: 'Sarah Williams', 
    email: 'sarah.williams@example.com', 
    phone: '555-789-0123',
    permission: 'Basic',
    status: 'Inactive',
    registrationDate: '2023-01-05'
  },
  { 
    id: '5', 
    name: 'Robert Brown',
    email: 'robert.brown@example.com',
    phone: '555-234-5678',
    permission: 'Admin',
    status: 'Active',
    registrationDate: '2023-04-12'
  }
];
const SupervisorsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [supervisors, setSupervisors] = useState(mockSupervisors);
  const [filteredSupervisors, setFilteredSupervisors] = useState(mockSupervisors);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // In a real app, we would fetch data here
  useEffect(() => {
    // Simulating data fetch
    const fetchSupervisors = async () => {
      // In a real app, this would be an API call
      setSupervisors(mockSupervisors);
      setFilteredSupervisors(mockSupervisors);
    };

    fetchSupervisors();
  }, []);

  // Handle search
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      applyFilter(activeFilter);
    } else {
      const filtered = supervisors.filter(supervisor => 
        supervisor.name.toLowerCase().includes(query.toLowerCase()) ||
        supervisor.email.toLowerCase().includes(query.toLowerCase()) ||
        supervisor.phone.includes(query)
      );
      setFilteredSupervisors(filtered);
    }
  };

  // Apply filter
  const applyFilter = (filterType: string) => {
    setActiveFilter(filterType);
    let filtered = supervisors;
    
    if (filterType === 'Admin') {
      filtered = supervisors.filter(supervisor => supervisor.permission === 'Admin');
    } else if (filterType === 'Basic') {
      filtered = supervisors.filter(supervisor => supervisor.permission === 'Basic');
    } else if (filterType === 'Auditor') {
      filtered = supervisors.filter(supervisor => supervisor.permission === 'Auditor');
    } else if (filterType === 'Active') {
      filtered = supervisors.filter(supervisor => supervisor.status === 'Active');
    } else if (filterType === 'Inactive') {
      filtered = supervisors.filter(supervisor => supervisor.status === 'Inactive');
    }
    
    // If there's an active search, apply that too
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(supervisor => 
        supervisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supervisor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supervisor.phone.includes(searchQuery)
      );
    }
    
    setFilteredSupervisors(filtered);
    setFilterMenuVisible(false);
  };

  // Delete supervisor
  const deleteSupervisor = (id: string) => {
    Alert.alert(
      'Delete Supervisor',
      'Are you sure you want to delete this supervisor?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // In a real app, this would be an API call
            const updatedSupervisors = supervisors.filter(supervisor => supervisor.id !== id);
            setSupervisors(updatedSupervisors);
            setFilteredSupervisors(updatedSupervisors.filter(supervisor => {
              if (activeFilter === 'All') return true;
              if (activeFilter === 'Admin') return supervisor.permission === 'Admin';
              if (activeFilter === 'Basic') return supervisor.permission === 'Basic';
              if (activeFilter === 'Auditor') return supervisor.permission === 'Auditor';
              if (activeFilter === 'Active') return supervisor.status === 'Active';
              if (activeFilter === 'Inactive') return supervisor.status === 'Inactive';
              return true;
            }));
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  // Render supervisor card
  const renderSupervisorCard = ({ item }: { item: Supervisor }) => {
    // Set permission color
    let permissionColor = '#007AFF'; // Basic - blue
    if (item.permission === 'Admin') permissionColor = '#FF9500'; // Orange
    if (item.permission === 'Auditor') permissionColor = '#5856D6'; // Purple

    // Set status color
    let statusColor = '#4CD964'; // Active - green
    if (item.status === 'Inactive') statusColor = '#8E8E93'; // Gray

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>{item.name}</Title>
            <View style={styles.chipContainer}>
              <Chip 
                mode="outlined" 
                style={[styles.permissionChip, { borderColor: permissionColor }]}
                textStyle={{ color: permissionColor }}
              >
                {item.permission}
              </Chip>
              <Chip 
                mode="outlined" 
                style={[styles.statusChip, { borderColor: statusColor }]}
                textStyle={{ color: statusColor }}
              >
                {item.status}
              </Chip>
            </View>
          </View>
          
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Icon name="email" size={16} color="#8e8e93" style={styles.detailIcon} />
              <Paragraph>{item.email}</Paragraph>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="phone" size={16} color="#8e8e93" style={styles.detailIcon} />
              <Paragraph>{item.phone}</Paragraph>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="calendar" size={16} color="#8e8e93" style={styles.detailIcon} />
              <Paragraph>Registered: {item.registrationDate}</Paragraph>
            </View>
          </View>
        </Card.Content>
        
        <Card.Actions>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('SupervisorDetails', { supervisorId: item.id })}
          >
            View
          </Button>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('EditSupervisor', { supervisorId: item.id })}
          >
            Edit
          </Button>
          <Button 
            mode="text" 
            onPress={() => deleteSupervisor(item.id)}
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
          placeholder="Search supervisors"
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
          <Menu.Item onPress={() => applyFilter('All')} title="All Supervisors" />
          <Divider />
          <Menu.Item onPress={() => applyFilter('Admin')} title="Admin" />
          <Menu.Item onPress={() => applyFilter('Basic')} title="Basic" />
          <Menu.Item onPress={() => applyFilter('Auditor')} title="Auditor" />
          <Divider />
          <Menu.Item onPress={() => applyFilter('Active')} title="Active" />
          <Menu.Item onPress={() => applyFilter('Inactive')} title="Inactive" />
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
        data={filteredSupervisors}
        renderItem={renderSupervisorCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddSupervisor')}
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  permissionChip: {
    height: 26,
    marginBottom: 4,
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

export default SupervisorsScreen;