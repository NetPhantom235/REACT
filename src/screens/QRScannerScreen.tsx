import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  QRScanner: {
    returnScreen?: string;
  };
  CreateLoan: {
    deviceId: string;
  };
  DeviceDetails: {
    deviceId: string;
  };
};

type NavigationProp = import('@react-navigation/native').NavigationProp<RootStackParamList>;

const QRScannerScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'QRScanner'>>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState(RNCamera.Constants.FlashMode.off);
  
  // Determine which screen to return to based on where we came from
  const returnScreen = route.params?.returnScreen || 'Devices';
  const isForLoan = returnScreen === 'CreateLoan';

  useEffect(() => {
    // Camera permissions are handled by the RNCamera component
    // We'll just set a timeout to simulate permission check
    const checkPermissions = async () => {
      // In a real app, we would check permissions here
      setHasPermission(true);
    };
    
    checkPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    try {
      // In a real app, we would validate the QR code format here
      // For now, we'll assume the QR code contains a device ID
      const deviceId = data;
      
      if (isForLoan) {
        // If scanning for loan creation, return to CreateLoan with the device ID
        navigation.navigate('CreateLoan', { deviceId });
      } else {
        // Otherwise, navigate to device details
        navigation.navigate('DeviceDetails', { deviceId });
      }
    } catch (error) {
      Alert.alert(
        'Invalid QR Code',
        'The scanned QR code is not valid for this application.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === RNCamera.Constants.FlashMode.off
        ? RNCamera.Constants.FlashMode.torch
        : RNCamera.Constants.FlashMode.off
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera access is required to scan QR codes.</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        flashMode={flashMode}
        onBarCodeRead={scanned ? undefined : handleBarCodeScanned}
        captureAudio={false}
      >
        <View style={styles.overlay}>
          <View style={styles.unfilled} />
          <View style={styles.rowContainer}>
            <View style={styles.unfilled} />
            <View style={styles.scanner} />
            <View style={styles.unfilled} />
          </View>
          <View style={styles.unfilled} />
        </View>
        
        <View style={styles.controls}>
          <Button 
            mode="contained" 
            onPress={toggleFlash}
            style={styles.button}
            icon={flashMode === RNCamera.Constants.FlashMode.torch ? 'flash' : 'flash-off'}
          >
            {flashMode === RNCamera.Constants.FlashMode.torch ? 'Flash Off' : 'Flash On'}
          </Button>
          
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={styles.button}
            icon="arrow-left"
          >
            Cancel
          </Button>
        </View>
      </RNCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  rowContainer: {
    flexDirection: 'row',
    height: 200,
  },
  unfilled: {
    flex: 1,
  },
  scanner: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  button: {
    width: 150,
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default QRScannerScreen;