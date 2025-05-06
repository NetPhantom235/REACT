import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import DevicesScreen from '../screens/DevicesScreen';
import AddDeviceScreen from '../screens/AddDeviceScreen';
// import EditDeviceScreen from '../screens/EditDeviceScreen';
// import DeviceDetailsScreen from '../screens/DeviceDetailsScreen';
import SupervisorsScreen from '../screens/SupervisorsScreen';
// import AddSupervisorScreen from '../screens/AddSupervisorScreen';
// import EditSupervisorScreen from '../screens/EditSupervisorScreen';
// import SupervisorDetailsScreen from '../screens/SupervisorDetailsScreen';
import LoansScreen from '../screens/LoansScreen';
// import CreateLoanScreen from '../screens/CreateLoanScreen';
// import LoanDetailsScreen from '../screens/LoanDetailsScreen';
import QRScannerScreen from '../screens/QRScannerScreen';

// Stack navigators
const DevicesStack = createStackNavigator();
const SupervisorsStack = createStackNavigator();
const LoansStack = createStackNavigator();
const DashboardStack = createStackNavigator();

// Tab navigator
const Tab = createBottomTabNavigator();

// Device Stack Navigator
const DevicesStackNavigator = () => {
  return (
    <DevicesStack.Navigator>
      <DevicesStack.Screen name="Devices" component={DevicesScreen} />
      <DevicesStack.Screen name="AddDevice" component={AddDeviceScreen} options={{ title: 'Add Device' }} />
      {/* <DevicesStack.Screen name="EditDevice" component={EditDeviceScreen} options={{ title: 'Edit Device' }} /> */}
      {/* <DevicesStack.Screen name="EditDevice" component={EditDeviceScreen} options={{ title: 'Edit Device' }} /> */}
      <DevicesStack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan QR Code' }} />
    </DevicesStack.Navigator>
  );
};

// Supervisors Stack Navigator
const SupervisorsStackNavigator = () => {
  return (
    <SupervisorsStack.Navigator>
      <SupervisorsStack.Screen name="Supervisors" component={SupervisorsScreen} />
      <SupervisorsStack.Screen name="AddSupervisor" component={SupervisorsScreen} options={{ title: 'Add Supervisor' }} />
      {/* <SupervisorsStack.Screen name="EditSupervisor" component={EditSupervisorScreen} options={{ title: 'Edit Supervisor' }} /> */}
      {/* <SupervisorsStack.Screen name="SupervisorDetails" component={SupervisorDetailsScreen} options={{ title: 'Supervisor Details' }} /> */}
    </SupervisorsStack.Navigator>
  );
};

// Loans Stack Navigator
const LoansStackNavigator = () => {
  return (
    <LoansStack.Navigator>
      <LoansStack.Screen name="Loans" component={LoansScreen} />
      {/* <LoansStack.Screen name="CreateLoan" component={CreateLoanScreen} options={{ title: 'Create Loan' }} /> */}
      {/* <LoansStack.Screen name="LoanDetails" component={LoanDetailsScreen} options={{ title: 'Loan Details' }} /> */}
      <LoansStack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan QR Code' }} />
    </LoansStack.Navigator>
  );
};

// Dashboard Stack Navigator
const DashboardStackNavigator = () => {
  return (
    <DashboardStack.Navigator>
      <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
    </DashboardStack.Navigator>
  );
};

// Main Tab Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            if (route.name === 'DashboardTab') {
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
            } else if (route.name === 'DevicesTab') {
              iconName = focused ? 'laptop' : 'laptop-off';
            } else if (route.name === 'SupervisorsTab') {
              iconName = focused ? 'account-group' : 'account-group-outline';
            } else if (route.name === 'LoansTab') {
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-variant';
            } else {
              iconName = 'help-circle-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen 
          name="DashboardTab" 
          component={DashboardStackNavigator} 
          options={{ headerShown: false, title: 'Dashboard' }}
        />
        <Tab.Screen 
          name="DevicesTab" 
          component={DevicesStackNavigator} 
          options={{ headerShown: false, title: 'Devices' }}
        />
        <Tab.Screen 
          name="SupervisorsTab" 
          component={SupervisorsStackNavigator} 
          options={{ headerShown: false, title: 'Supervisors' }}
        />
        <Tab.Screen 
          name="LoansTab" 
          component={LoansStackNavigator} 
          options={{ headerShown: false, title: 'Loans' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;