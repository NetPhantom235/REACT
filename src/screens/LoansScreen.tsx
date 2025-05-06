import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Searchbar, FAB, Card, Title, Paragraph, Chip, Button, Menu, Divider, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  LoanDetails: { loanId: string };
  CreateLoan: undefined;
  // Add other screens if needed
};

type LoansScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoanDetails'>;

// Loan type definition
type Loan = {
  id: string;
  deviceId: string;
  deviceName: string;
  supervisorId: string;
  supervisorName: string;
  loanDate: string;
  returnDate: string | null;
  status: string;
  notes: string;
};

// Mock data for loans
const mockLoans: Loan[] = [
  { 
    id: '1', 
    deviceId: '1',
    deviceName: 'MacBook Pro',
    supervisorId: '1',
    supervisorName: 'John Doe',
    loanDate: '2023-05-01',
    returnDate: null,
    status: 'Active',
    notes: 'For development work'
  },
  { 
    id: '2', 
    deviceId: '2',
    deviceName: 'Dell XPS',
    supervisorId: '2',
    supervisorName: 'Jane Smith',
    loanDate: '2023-04-28',
    returnDate: null,
    status: 'Active',
    notes: 'For client presentation'
  },
  { 
    id: '3', 
    deviceId: '5',
    deviceName: 'Projector',
    supervisorId: '1',
    supervisorName: 'John Doe',
    loanDate: '2023-05-02',
    returnDate: null,
    status: 'Active',
    notes: 'For team meeting'
  },
  { 
    id: '4', 
    deviceId: '3',
    deviceName: 'iPad Pro',
    supervisorId: '3',
    supervisorName: 'Mike Johnson',
    loanDate: '2023-04-20',
    returnDate: '2023-04-30',
    status: 'Returned',
    notes: 'For field work'
  },
  { 
    id: '5', 
    deviceId: '4',
    deviceName: 'Surface Pro',
    supervisorId: '4',
    supervisorName: 'Emily Davis',
    loanDate: '2023-04-15',
    returnDate: '2023-04-25',
    status: 'Returned',
    notes: 'For design project'
  },
];

const LoansScreen = () => {
  const navigation = useNavigation<LoansScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [loans, setLoans] = useState(mockLoans);
  const [filteredLoans, setFilteredLoans] = useState(mockLoans);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // In a real app, we would fetch data here
  useEffect(() => {
    // Simulating data fetch
    const fetchLoans = async () => {
      // In a real app, this would be an API call
      setLoans(mockLoans);
      setFilteredLoans(mockLoans);
    };

    fetchLoans();
  }, []);

  // Handle search
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      applyFilter(activeFilter);
    } else {
      const filtered = loans.filter(loan => 
        loan.deviceName.toLowerCase().includes(query.toLowerCase()) ||
        loan.supervisorName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLoans(filtered);
    }
  };

  // Apply filter
  const applyFilter = (filterType: string) => {
    setActiveFilter(filterType);
    let filtered = loans;
    
    if (filterType === 'Active') {
      filtered = loans.filter(loan => loan.status === 'Active');
    } else if (filterType === 'Returned') {
      filtered = loans.filter(loan => loan.status === 'Returned');
    } else if (filterType === 'Recent') {
      // Sort by loan date, most recent first
      filtered = [...loans].sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime());
    }
    
    // If there's an active search, apply that too
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(loan => 
        loan.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.supervisorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredLoans(filtered);
    setFilterMenuVisible(false);
  };

  // Return device (complete loan)
  const returnDevice = (id: string) => {
    Alert.alert(
      'Return Device',
      'Mark this device as returned?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Return',
          onPress: () => {
            // In a real app, this would be an API call
            const updatedLoans = loans.map(loan => {
              if (loan.id === id) {
                return {
                  ...loan,
                  returnDate: new Date().toISOString().split('T')[0],
                  status: 'Returned'
                };
              }
              return loan;
            });
            setLoans(updatedLoans);
  setFilteredLoans(
    updatedLoans.filter(loan => {
      if (activeFilter === 'Active') return loan.status === 'Active';
      if (activeFilter === 'Returned') return loan.status === 'Returned';
      return true;
    })
  );
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Render loan card
  const renderLoanCard = ({ item }: { item: Loan }) => {
    // Set status color
    let statusColor = '#007AFF'; // Active - blue
    if (item.status === 'Returned') statusColor = '#4CD964'; // Green

    // Calculate loan duration
    const loanDate = new Date(item.loanDate);
    const returnDate = item.returnDate ? new Date(item.returnDate) : new Date();
    const loanDuration = Math.ceil((returnDate.getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>{item.deviceName}</Title>
            <Chip 
              mode="outlined" 
              style={[styles.statusChip, { borderColor: statusColor }]}
              textStyle={{ color: statusColor }}
            >
              {item.status}
            </Chip>
          </View>
          
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Icon name="account" size={16} color="#8e8e93" style={styles.detailIcon} />
              <Paragraph>Supervisor: {item.supervisorName}</Paragraph>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="calendar-arrow-right" size={16} color="#8e8e93" style={styles.detailIcon} />
              <Paragraph>Loan Date: {item.loanDate}</Paragraph>
            </View>
            
            {item.returnDate && (
              <View style={styles.detailRow}>
                <Icon name="calendar-arrow-left" size={16} color="#8e8e93" style={styles.detailIcon} />
                <Paragraph>Return Date: {item.returnDate}</Paragraph>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Icon name="clock-outline" size={16} color="#8e8e93" style={styles.detailIcon} />
              <Paragraph>Duration: {loanDuration} day{loanDuration !== 1 ? 's' : ''}</Paragraph>
            </View>
            
            {item.notes && (
              <View style={styles.detailRow}>
                <Icon name="note-text-outline" size={16} color="#8e8e93" style={styles.detailIcon} />
                <Paragraph>Notes: {item.notes}</Paragraph>
              </View>
            )}
          </View>
        </Card.Content>
        
        <Card.Actions>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('LoanDetails', { loanId: item.id })}
          >
            View
          </Button>
          {item.status === 'Active' && (
            <Button 
              mode="text" 
              onPress={() => returnDevice(item.id)}
              textColor="#4CD964"
            >
              Return
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search loans"
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
          <Menu.Item onPress={() => applyFilter('All')} title="All Loans" />
          <Divider />
          <Menu.Item onPress={() => applyFilter('Active')} title="Active Loans" />
          <Menu.Item onPress={() => applyFilter('Returned')} title="Returned Loans" />
          <Menu.Item onPress={() => applyFilter('Recent')} title="Most Recent" />
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
        data={filteredLoans}
        renderItem={renderLoanCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateLoan')}
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

export default LoansScreen;