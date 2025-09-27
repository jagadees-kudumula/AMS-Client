import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ScheduleManagement = () => {
    return (
        <View style={styles.container}>
            <Text>Welcome to the Schedule Management Screen!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ScheduleManagement;