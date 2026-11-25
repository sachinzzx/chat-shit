import React from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from 'expo-status-bar';

import AllUsers from "./screens/AllUsers";
import StackNavigation from "./screens/Stack";
import ImagePickerScreen from "./screens/ImagePicker";
import CameraScreen from "./screens/CameraScreen";
import RawCameraScreen from "./screens/RawCameraScreen";

import { theme } from "./theme";
import Icon from "./components/Icon";

const Tab = createBottomTabNavigator();

function CustomCrimsonTabBar({ state, descriptors, navigation }) {
  // Hide dock when inside individual Chat room if desired, or keep accessible
  const currentRoute = state.routes[state.index];
  const nestedState = currentRoute.state;
  const isInsideChatRoom = nestedState && nestedState.routes[nestedState.index]?.name === 'Chat';
  if (isInsideChatRoom) {
    return null;
  }

  return (
    <View style={styles.dockWrapper}>
      <View style={styles.floatingDock}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Center big glowing '+' orb (CameraScreen / Quick Snap / New Action)
          if (route.name === 'CameraScreen') {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate('AllUsers')}
                activeOpacity={0.85}
                style={styles.centerOrbContainer}
              >
                <View style={styles.centerOrbOuterGlow}>
                  <View style={styles.centerOrbInner}>
                    <Text style={styles.centerOrbPlus}>+</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }

          let iconName = 'chat';
          let hasCrown = false;
          if (route.name === 'Conversations') iconName = 'chat';
          if (route.name === 'AllUsers') iconName = 'users';
          if (route.name === 'ImagePickerScreen') iconName = 'image';
          if (route.name === 'RawCameraScreen') {
            iconName = 'camera';
            hasCrown = true;
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabSlot}
            >
              <View style={styles.iconBox}>
                <Icon
                  name={iconName}
                  size={20}
                  color={isFocused ? '#FFFFFF' : '#9CA3AF'}
                />
                {hasCrown && (
                  <View style={styles.tabCrownBadge}>
                    <Text style={styles.tabCrownEmoji}>👑</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {label}
              </Text>
              {isFocused && (
                <View style={styles.activeIndicatorRow}>
                  <View style={styles.activeLine} />
                  <View style={styles.activeDot} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={theme.colors.bg} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Conversations"
            tabBar={(props) => <CustomCrimsonTabBar {...props} />}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Tab.Screen
              name="Conversations"
              component={StackNavigation}
              options={{ tabBarLabel: 'Chats' }}
            />
            <Tab.Screen
              name="AllUsers"
              component={AllUsers}
              options={{ tabBarLabel: 'Squad' }}
            />
            <Tab.Screen
              name="CameraScreen"
              component={CameraScreen}
              options={{ tabBarLabel: 'Create' }}
            />
            <Tab.Screen
              name="ImagePickerScreen"
              component={ImagePickerScreen}
              options={{ tabBarLabel: 'Media' }}
            />
            <Tab.Screen
              name="RawCameraScreen"
              component={RawCameraScreen}
              options={{ tabBarLabel: 'HUD Cam' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  dockWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 22 : 12,
    left: 14,
    right: 14,
    alignItems: 'center',
  },
  floatingDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(14, 4, 7, 0.94)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 36, 36, 0.55)',
    borderRadius: 30,
    height: 66,
    width: '100%',
    paddingHorizontal: 12,
    shadowColor: '#FF1A1A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 12,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  iconBox: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCrownBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    transform: [{ rotate: '15deg' }],
  },
  tabCrownEmoji: {
    fontSize: 11,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#FF4D4D',
    fontWeight: '800',
  },
  activeIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 4,
    gap: 2,
  },
  activeLine: {
    width: 14,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#FF2424',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF2424',
  },
  centerOrbContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  centerOrbOuterGlow: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 20, 20, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 45, 45, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF1A1A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 14,
    elevation: 14,
  },
  centerOrbInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#140407',
    borderWidth: 2,
    borderColor: '#FF2E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOrbPlus: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
    marginTop: -2,
  },
});
