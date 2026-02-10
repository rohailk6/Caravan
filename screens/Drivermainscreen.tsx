// screens/DriverMainScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Mock data for ride history
const RIDE_HISTORY = [
  {
    id: '1',
    passenger: {
      name: 'Sundas',
      avatar: 'S',
      rating: 5.0,
      totalRatings: 2,
    },
    earnings: 365,
    distance: 2.1,
    vehicleType: 'Mini',
    pickupAddress: 'Centaurus Mall, Entrance from Western Side (F-8, F 8/4)',
    dropoffAddress: 'Umar Ali St (Pindora, Rawalpindi)',
    timestamp: 'Just now',
    passengers: 1,
  },
  {
    id: '2',
    passenger: {
      name: 'Zara',
      avatar: 'Z',
      rating: 4.71,
      totalRatings: 149,
    },
    earnings: 450,
    distance: 2.1,
    vehicleType: 'Mini',
    pickupAddress: 'Centaurus Islamabad (Nazim-ud-din Road, F 8/4 F-8, Islamabad)',
    dropoffAddress: 'Baba Roda Road (Kartar Pura, Rawalpindi)',
    timestamp: '43 sec.',
    passengers: 2,
  },
  {
    id: '3',
    passenger: {
      name: 'Mubashir',
      avatar: 'M',
      rating: 4.69,
      totalRatings: 405,
    },
    earnings: 795,
    distance: 2.2,
    vehicleType: 'Mini',
    pickupAddress: 'IDC Lab & Diagnostic Center F-8 (F-8, F 8 Markaz)',
    dropoffAddress: 'St 37',
    timestamp: '1 min',
    passengers: 3,
  },
];

// Avatar colors
const AVATAR_COLORS = ['#FF6B6B', '#4D9EFF', '#FFD93D', '#6BCB77', '#9B59B6'];

const getAvatarColor = (name: string) => {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export default function DriverMainScreen() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');
  const [showActiveRequest, setShowActiveRequest] = useState(false);
  
  // Animation values
  const radarScale = useRef(new Animated.Value(1)).current;
  const radarOpacity = useRef(new Animated.Value(0.6)).current;
  const sidebarSlide = useRef(new Animated.Value(-width * 0.75)).current;
  const requestSlide = useRef(new Animated.Value(height)).current;

  // Radar pulse animation
  useEffect(() => {
    if (isOnline) {
      const pulseAnimation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(radarScale, {
              toValue: 2.5,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(radarScale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(radarOpacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(radarOpacity, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseAnimation.start();
      
      // Simulate finding a passenger after 5 seconds
      const timer = setTimeout(() => {
        setShowActiveRequest(true);
        Animated.spring(requestSlide, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      }, 5000);

      return () => {
        pulseAnimation.stop();
        clearTimeout(timer);
      };
    } else {
      radarScale.setValue(1);
      radarOpacity.setValue(0.6);
    }
  }, [isOnline]);

  const toggleSidebar = () => {
    const toValue = showSidebar ? -width * 0.75 : 0;
    Animated.spring(sidebarSlide, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 7,
    }).start();
    setShowSidebar(!showSidebar);
  };

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      setShowActiveRequest(false);
      requestSlide.setValue(height);
    }
  };

  const renderRideCard = ({ item }: { item: typeof RIDE_HISTORY[0] }) => (
    <View style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <View style={styles.passengerInfo}>
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.passenger.name) }]}>
            <Text style={styles.avatarText}>{item.passenger.avatar}</Text>
          </View>
          <View style={styles.passengerDetails}>
            <Text style={styles.passengerName}>{item.passenger.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>
                {item.passenger.rating} ({item.passenger.totalRatings})
              </Text>
            </View>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </View>
        <View style={styles.earningsContainer}>
          <Text style={styles.distance}>~{item.distance}km</Text>
          <Text style={styles.earnings}>PKR {item.earnings}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#718096" />
        </TouchableOpacity>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeIndicators}>
          <View style={styles.pickupDot} />
          <View style={styles.routeLine} />
          <View style={styles.dropoffDot} />
        </View>
        <View style={styles.addresses}>
          <Text style={styles.address} numberOfLines={2}>
            {item.pickupAddress}
          </Text>
          <View style={styles.addressSpacer} />
          <Text style={styles.address} numberOfLines={2}>
            {item.dropoffAddress}
          </Text>
        </View>
      </View>

      <View style={styles.rideFooter}>
        <View style={styles.vehicleBadge}>
          <Text style={styles.vehicleBadgeText}>{item.vehicleType}</Text>
        </View>
        <View style={styles.passengerCount}>
          <Ionicons name="person" size={14} color="#4D9EFF" />
          <Text style={styles.passengerCountText}>{item.passengers} passenger{item.passengers > 1 ? 's' : ''}</Text>
        </View>
      </View>
    </View>
  );

  const renderOfflineContent = () => (
    <View style={styles.offlineContent}>
      {/* Promotion Card */}
      <View style={styles.promotionCard}>
        <Ionicons name="gift" size={24} color="#F59E0B" />
        <Text style={styles.promotionText}>
          Accept more rides to increase your weekly carpool earnings
        </Text>
        <View style={styles.promotionActions}>
          <TouchableOpacity style={styles.promotionButton}>
            <Text style={styles.promotionButtonText}>Set up tariffs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.laterButton}>
            <Ionicons name="notifications-off-outline" size={16} color="#718096" />
            <Text style={styles.laterButtonText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ride History */}
      <FlatList
        data={RIDE_HISTORY}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderOnlineContent = () => (
    <View style={styles.onlineContent}>
      {/* Map Background Placeholder */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapGrid}>
          {[...Array(20)].map((_, i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>
        
        {/* Radar Animation */}
        <View style={styles.radarContainer}>
          <Animated.View
            style={[
              styles.radarPulse,
              {
                transform: [{ scale: radarScale }],
                opacity: radarOpacity,
              },
            ]}
          />
          <View style={styles.radarCenter}>
            <Ionicons name="car-sport" size={24} color="#4D9EFF" />
          </View>
        </View>
      </View>

      {/* Searching Message */}
      {!showActiveRequest && (
        <View style={styles.searchingCard}>
          <View style={styles.searchingIndicator}>
            <Ionicons name="search" size={20} color="#4D9EFF" />
          </View>
          <Text style={styles.searchingText}>Searching for passengers within 5km...</Text>
          <Text style={styles.searchingSubtext}>We'll notify you when someone needs a ride</Text>
        </View>
      )}

      {/* Active Request Card */}
      {showActiveRequest && (
        <Animated.View
          style={[
            styles.activeRequestCard,
            { transform: [{ translateY: requestSlide }] },
          ]}
        >
          <View style={styles.requestHandle} />
          
          <View style={styles.requestHeader}>
            <View style={styles.requestPassenger}>
              <View style={[styles.requestAvatar, { backgroundColor: '#4D9EFF' }]}>
                <Text style={styles.avatarText}>Z</Text>
              </View>
              <View>
                <Text style={styles.requestName}>Zara</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>4.71 (149)</Text>
                </View>
              </View>
            </View>
            <View style={styles.requestDistance}>
              <Ionicons name="location" size={16} color="#4D9EFF" />
              <Text style={styles.requestDistanceText}>2.1 km away</Text>
            </View>
          </View>

          <View style={styles.requestRoute}>
            <View style={styles.routeIndicators}>
              <View style={styles.pickupDot} />
              <View style={styles.routeLine} />
              <View style={styles.dropoffDot} />
            </View>
            <View style={styles.addresses}>
              <Text style={styles.requestAddress} numberOfLines={2}>
                Centaurus Islamabad (Nazim-ud-din Road, F 8/4 F-8)
              </Text>
              <View style={styles.addressSpacer} />
              <Text style={styles.requestAddress} numberOfLines={2}>
                Baba Roda Road (Kartar Pura, Rawalpindi)
              </Text>
            </View>
          </View>

          <View style={styles.requestInfo}>
            <View style={styles.requestInfoItem}>
              <Text style={styles.requestInfoLabel}>Estimated Fare</Text>
              <Text style={styles.requestInfoValue}>PKR 450</Text>
            </View>
            <View style={styles.requestInfoItem}>
              <Text style={styles.requestInfoLabel}>Passengers</Text>
              <Text style={styles.requestInfoValue}>2</Text>
            </View>
          </View>

          <View style={styles.requestActions}>
            <TouchableOpacity style={styles.declineButton}>
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>Accept Request</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        <Stack.Screen options={{headerShown: false}} />
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
          <Ionicons name="menu" size={28} color="#2A66B5" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusToggle,
            isOnline ? styles.statusOnline : styles.statusOffline,
          ]}
          onPress={handleToggleOnline}
        >
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={28} color="#2A66B5" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {isOnline ? renderOnlineContent() : renderOfflineContent()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('requests')}
        >
          <Ionicons
            name="list"
            size={24}
            color={activeTab === 'requests' ? '#4D9EFF' : '#718096'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'requests' && styles.navLabelActive,
            ]}
          >
            Ride requests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('performance')}
        >
          <Ionicons
            name="stats-chart"
            size={24}
            color={activeTab === 'performance' ? '#4D9EFF' : '#718096'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'performance' && styles.navLabelActive,
            ]}
          >
            Performance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('wallet')}
        >
          <Ionicons
            name="wallet"
            size={24}
            color={activeTab === 'wallet' ? '#4D9EFF' : '#718096'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'wallet' && styles.navLabelActive,
            ]}
          >
            Wallet
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: sidebarSlide }] },
        ]}
      >
        <View style={styles.sidebarHeader}>
          <View style={styles.profileSection}>
            <View style={[styles.sidebarAvatar, { backgroundColor: '#4D9EFF' }]}>
              <Ionicons name="person" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.profileName}>Driver Name</Text>
            <View style={styles.sidebarRating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.sidebarRatingText}>4.95 (88)</Text>
            </View>
            <TouchableOpacity style={styles.viewProfileButton}>
              <Ionicons name="chevron-forward" size={20} color="#4D9EFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sidebarContent}>
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="car-sport" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>City</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="wallet-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="globe-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>City to City</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="cube-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Freight</Text>
          </TouchableOpacity>

          <View style={styles.sidebarDivider} />

          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="notifications-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Safety</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="settings-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="help-circle-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Help</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="chatbubble-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="create-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Online registration</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.passengerModeButton}>
          <Text style={styles.passengerModeText}>Passenger mode</Text>
        </TouchableOpacity>

        <View style={styles.socialIcons}>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-facebook" size={28} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-instagram" size={28} color="#E4405F" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <TouchableOpacity
          style={styles.sidebarOverlay}
          activeOpacity={1}
          onPress={toggleSidebar}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusToggle: {
    paddingHorizontal: 48,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
  },
  statusOffline: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF6B6B',
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A66B5',
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineContent: {
    flex: 1,
  },
  promotionCard: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  promotionText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
    fontWeight: '500',
  },
  promotionActions: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
    gap: 8,
  },
  promotionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  promotionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A66B5',
  },
  laterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 4,
  },
  laterButtonText: {
    fontSize: 14,
    color: '#718096',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  rideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rideHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  passengerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  passengerDetails: {
    justifyContent: 'center',
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A66B5',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#718096',
  },
  timestamp: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 2,
  },
  earningsContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  distance: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  earnings: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A66B5',
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  routeIndicators: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  dropoffDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
  },
  addresses: {
    flex: 1,
    justifyContent: 'space-between',
  },
  address: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  addressSpacer: {
    height: 8,
  },
  rideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleBadge: {
    backgroundColor: '#4D9EFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vehicleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  passengerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  passengerCountText: {
    fontSize: 13,
    color: '#718096',
  },
  onlineContent: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8F4FD',
    position: 'relative',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridLine: {
    width: width / 10,
    height: height / 10,
    borderWidth: 0.5,
    borderColor: '#CBD5E0',
  },
  radarContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4D9EFF',
  },
  radarCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchingCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  searchingIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A66B5',
    marginBottom: 6,
  },
  searchingSubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  activeRequestCard: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  requestHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  requestPassenger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A66B5',
  },
  requestDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  requestDistanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4D9EFF',
  },
  requestRoute: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  requestAddress: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  requestInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  requestInfoItem: {
    flex: 1,
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 12,
  },
  requestInfoLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  requestInfoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A66B5',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#718096',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4D9EFF',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#718096',
  },
  navLabelActive: {
    color: '#4D9EFF',
    fontWeight: '600',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  sidebarHeader: {
    backgroundColor: '#F0F7FF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
  },
  sidebarAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A66B5',
    marginBottom: 4,
  },
  sidebarRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sidebarRatingText: {
    fontSize: 14,
    color: '#718096',
  },
  viewProfileButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#2A66B5',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  passengerModeButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#C3E82E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  passengerModeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A66B5',
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingBottom: 32,
  },
  socialIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});