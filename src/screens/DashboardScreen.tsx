import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, List, Divider, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// In a real app, this would come from a database or API
const mockData = {
  totalDevices: 42,
  activeDevices: 28,
  maintenanceDevices: 5,
  activeLoans: 15,
  alerts: [
    { id: 1, message: 'Device #1234 has been on loan for 8 days', severity: 'warning' },
    { id: 2, message: 'Device #5678 requires maintenance', severity: 'info' },
    { id: 3, message: 'Supervisor John Doe has 5 active loans', severity: 'warning' }
  ],
  recentActivity: [
    { id: 1, action: 'Loan Created', device: 'Laptop #1234', supervisor: 'John Doe', date: '2023-05-06' },
    { id: 2, action: 'Device Added', device: 'Tablet #5678', supervisor: 'Admin', date: '2023-05-05' },
    { id: 3, action: 'Loan Returned', device: 'Projector #9012', supervisor: 'Jane Smith', date: '2023-05-04' },
  ]
};

const DashboardScreen = () => {
  const [data, setData] = useState(mockData);

  // In a real app, we would fetch data here
  useEffect(() => {
    // Simulating data fetch
    const fetchData = async () => {
      // In a real app, this would be an API call
      setData(mockData);
    };

    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Device Manager Dashboard</Title>
        <Text style={styles.headerSubtitle}>Overview of your inventory system</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <Card.Content>
            <Icon name="laptop" size={30} color="#007AFF" style={styles.cardIcon} />
            <Title>{data.totalDevices}</Title>
            <Paragraph>Total Devices</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Icon name="laptop-check" size={30} color="#4CD964" style={styles.cardIcon} />
            <Title>{data.activeDevices}</Title>
            <Paragraph>Active Devices</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Icon name="tools" size={30} color="#FF9500" style={styles.cardIcon} />
            <Title>{data.maintenanceDevices}</Title>
            <Paragraph>In Maintenance</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Icon name="swap-horizontal" size={30} color="#5856D6" style={styles.cardIcon} />
            <Title>{data.activeLoans}</Title>
            <Paragraph>Active Loans</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.alertsCard}>
        <Card.Title title="Alerts" left={(props) => <Icon name="alert-circle" size={24} color="#FF3B30" />} />
        <Card.Content>
          {data.alerts.length > 0 ? (
            data.alerts.map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <Icon 
                  name={alert.severity === 'warning' ? 'alert-circle' : 'information'} 
                  size={20} 
                  color={alert.severity === 'warning' ? '#FF3B30' : '#007AFF'} 
                  style={styles.alertIcon} 
                />
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            ))
          ) : (
            <Text>No alerts at this time</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.activityCard}>
        <Card.Title title="Recent Activity" left={(props) => <Icon name="history" size={24} color="#007AFF" />} />
        <Card.Content>
          {data.recentActivity.map((activity) => (
            <View key={activity.id}>
              <List.Item
                title={activity.action}
                description={`${activity.device} - ${activity.supervisor}`}
                right={() => <Text style={styles.activityDate}>{activity.date}</Text>}
                left={() => {
                  let iconName = 'circle';
                  if (activity.action.includes('Loan Created')) iconName = 'arrow-right-circle';
                  if (activity.action.includes('Device Added')) iconName = 'plus-circle';
                  if (activity.action.includes('Loan Returned')) iconName = 'arrow-left-circle';
                  
                  return <Icon name={iconName} size={24} color="#007AFF" style={styles.activityIcon} />;
                }}
              />
              <Divider />
            </View>
          ))}
          <Button mode="text" style={styles.viewAllButton}>View All Activity</Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  statsCard: {
    width: '48%',
    marginBottom: 16,
    elevation: 2,
  },
  cardIcon: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  alertsCard: {
    margin: 8,
    elevation: 2,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIcon: {
    marginRight: 8,
  },
  alertText: {
    flex: 1,
  },
  activityCard: {
    margin: 8,
    marginBottom: 24,
    elevation: 2,
  },
  activityIcon: {
    marginRight: 8,
    alignSelf: 'center',
  },
  activityDate: {
    color: '#8e8e93',
    fontSize: 12,
    alignSelf: 'center',
  },
  viewAllButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
});

export default DashboardScreen;