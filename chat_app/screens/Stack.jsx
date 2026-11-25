import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ConversationScreen from './ConversationScreen';
import ChatScreen from './ChatScreen';
import { theme } from '../theme';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
    return (
        <Stack.Navigator
            initialRouteName='Conversation'
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                    backgroundColor: theme.colors.bg,
                },
            }}
        >
            <Stack.Screen name="Conversation" component={ConversationScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
};

export default StackNavigation;
