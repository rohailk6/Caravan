// screens/DriverMainScreen.tsx
// Driver screen: offline (post a ride, view my rides) + online (radar, accept/reject requests)

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  acceptBooking,
  getBookingRequests,
  getMyRides,
  getProfile,
  rejectBooking,
} from '../api';

const { width, height } = Dimensions.get('window');

const AVATAR_COLORS = ['#FF6B6B', '#4D9EFF', '#FFD93D', '#6BCB77', '#9B59B6'];
const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function DriverMainScreen() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');
  const [driverProfile, setDriverProfile] = useState<any>(null);

  // Real data
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [myRides, setMyRides] = useState<any[]>([]);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animations
  const radarScale = useRef(new Animated.Value(1)).current;
  const radarOpacity = useRef(new Animated.Value(0.6)).current;
  const sidebarSlide = useRef(new Animated.Value(-width * 0.75)).current;
  const requestSlide = useRef(new Animated.Value(height)).current;
  const radarAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    loadProfile();
    loadMyRides();
  }, []);

  useEffect(() => {
    if (isOnline) {
      startRadarAnimation();
      startPolling();
    } else {
      stopRadarAnimation();
      stopPolling();
      setActiveRequest(null);
      requestSlide.setValue(height);
    }
    return () => stopPolling();
  }, [isOnline]);

  // Slide request card in/out
  useEffect(() => {
    if (activeRequest) {
      Animated.spring(requestSlide, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(requestSlide, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [activeRequest]);

  const loadProfile = async () => {
    try {
      const profile = await getProfile();
      setDriverProfile(profile);
    } catch {
      console.log('Could not load driver profile');
    }
  };

  const loadMyRides = async () => {
    try {
      const response = await getMyRides();
      setMyRides(response.rides || []);
    } catch {
      console.log('Could not load rides');
    }
  };

  // ── POLLING ───────────────────────────────────────────
  const startPolling = () => {
    fetchBookingRequests();
    pollingRef.current = setInterval(fetchBookingRequests, 5000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const response = await getBookingRequests();
      const requests = response.requests || [];
      setPendingRequests(requests);
      if (requests.length > 0 && !activeRequest) {
        setActiveRequest(requests[0]);
      } else if (requests.length === 0) {
        setActiveRequest(null);
      }
    } catch (e: any) {
      console.log('Could not fetch booking requests:', e.message);
    }
  };

  // ── ACCEPT ────────────────────────────────────────────
  const handleAccept = async () => {
    if (!activeRequest) return;
    try {
      await acceptBooking(activeRequest.id);
      Alert.alert('✅ Accepted!', `Booking for ${activeRequest.rider_name} confirmed!`);
      setActiveRequest(null);
      fetchBookingRequests();
      loadMyRides();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Could not accept booking');
    }
  };

  // ── REJECT ────────────────────────────────────────────
  const handleReject = async () => {
    if (!activeRequest) return;
    Alert.alert(
      'Reject Request',
      `Reject ${activeRequest.rider_name}'s booking?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectBooking(activeRequest.id);
              const remaining = pendingRequests.filter(r => r.id !== activeRequest.id);
              setActiveRequest(remaining.length > 0 ? remaining[0] : null);
              setPendingRequests(remaining);
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.detail || 'Could not reject booking');
            }
          },
        },
      ]
    );
  };

  // ── RADAR ANIMATION ───────────────────────────────────
  const startRadarAnimation = () => {
    radarAnimRef.current = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(radarScale, { toValue: 2.5, duration: 2000, useNativeDriver: true }),
          Animated.timing(radarScale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(radarOpacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
          Animated.timing(radarOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    radarAnimRef.current.start();
  };

  const stopRadarAnimation = () => {
    radarAnimRef.current?.stop();
    radarScale.setValue(1);
    radarOpacity.setValue(0.6);
  };

  // ── SIDEBAR ───────────────────────────────────────────
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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('caravan_token');
          toggleSidebar();
          router.replace('/login2');
        },
      },
    ]);
  };

  // ─────────────────────────────────────────────────────
  // OFFLINE CONTENT
  // ─────────────────────────────────────────────────────
  const renderRideCard = ({ item }: { item: any }) => (
    <View style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <View style={styles.rideRouteInfo}>
          <View style={styles.routeIndicators}>
            <View style={styles.pickupDot} />
            <View style={styles.routeLine} />
            <View style={styles.dropoffDot} />
          </View>
          <View style={styles.addresses}>
            <Text style={styles.address} numberOfLines={2}>
              {item.start_location?.name || 'Pickup location'}
            </Text>
            <View style={styles.addressSpacer} />
            <Text style={styles.address} numberOfLines={2}>
              {item.end_location?.name || 'Drop-off location'}
            </Text>
          </View>
        </View>
        <View style={styles.earningsContainer}>
          <Text style={styles.earnings}>PKR {item.price_per_seat}</Text>
          <Text style={styles.earningsLabel}>/seat</Text>
        </View>
      </View>
      <View style={styles.rideFooter}>
        <View style={styles.vehicleBadge}>
          <Text style={styles.vehicleBadgeText}>{item.vehicle_type || 'Mini'}</Text>
        </View>
        <View style={styles.passengerCount}>
          <Ionicons name="person" size={14} color="#4D9EFF" />
          <Text style={styles.passengerCountText}>
            {item.available_seats - item.booked_seats} seats left
          </Text>
        </View>
        <Text style={styles.rideDate}>
          {item.ride_date} • {item.ride_time}
        </Text>
      </View>
    </View>
  );

  const renderOfflineContent = () => (
    <ScrollView style={styles.offlineContent} showsVerticalScrollIndicator={false}>
      {/* ── POST A RIDE BANNER ──────────────────────────── */}
      <View style={styles.postRideBanner}>
        <View style={styles.postRideBannerLeft}>
          <View style={styles.postRideIconCircle}>
            <Ionicons name="add-circle" size={32} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.postRideBannerTitle}>Ready to plan a trip?</Text>
            <Text style={styles.postRideBannerSubtitle}>
              Post a scheduled ride and let riders book their seats in advance
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.postRideButton}
          onPress={() => router.push('/post-ride')}
          activeOpacity={0.85}
        >
          <Ionicons name="car-sport-outline" size={20} color="#fff" />
          <Text style={styles.postRideButtonText}>Post a Ride</Text>
        </TouchableOpacity>
      </View>

      {/* ── PROMO CARD ───────────────────────────────────── */}
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

      {/* ── MY RIDES ─────────────────────────────────────── */}
      <View style={styles.myRidesSection}>
        <View style={styles.myRidesHeader}>
          <Text style={styles.myRidesSectionTitle}>My Posted Rides</Text>
          <TouchableOpacity onPress={loadMyRides}>
            <Ionicons name="refresh-outline" size={20} color="#4D9EFF" />
          </TouchableOpacity>
        </View>

        {myRides.length === 0 ? (
          <View style={styles.emptyRides}>
            <Ionicons name="car-outline" size={44} color="#CBD5E0" />
            <Text style={styles.emptyRidesTitle}>No rides posted yet</Text>
            <Text style={styles.emptyRidesSubtitle}>
              Tap "Post a Ride" above to create your first scheduled ride
            </Text>
          </View>
        ) : (
          myRides.map((item) => (
            <View key={item.id}>{renderRideCard({ item })}</View>
          ))
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ─────────────────────────────────────────────────────
  // ONLINE CONTENT
  // ─────────────────────────────────────────────────────
  const renderOnlineContent = () => (
    <View style={styles.onlineContent}>
      {/* Map/radar background */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapGrid}>
          {[...Array(20)].map((_, i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>
        <View style={styles.radarContainer}>
          <Animated.View
            style={[
              styles.radarPulse,
              { transform: [{ scale: radarScale }], opacity: radarOpacity },
            ]}
          />
          <View style={styles.radarCenter}>
            <Ionicons name="car-sport" size={24} color="#4D9EFF" />
          </View>
        </View>
      </View>

      {/* "Quick post" button floating on online map for convenience */}
      <TouchableOpacity
        style={styles.onlinePostBtn}
        onPress={() => router.push('/post-ride')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.onlinePostBtnText}>Schedule a Ride</Text>
      </TouchableOpacity>

      {/* Searching / pending message */}
      {!activeRequest && (
        <View style={styles.searchingCard}>
          <View style={styles.searchingIndicator}>
            <Ionicons name="search" size={20} color="#4D9EFF" />
          </View>
          <Text style={styles.searchingText}>
            {pendingRequests.length > 0
              ? `${pendingRequests.length} pending request${pendingRequests.length > 1 ? 's' : ''}...`
              : 'Searching for passengers...'}
          </Text>
          <Text style={styles.searchingSubtext}>
            We'll show you a request as soon as a rider books
          </Text>
        </View>
      )}

      {/* ── BOOKING REQUEST CARD ─────────────────────────── */}
      {activeRequest && (
        <Animated.View
          style={[
            styles.activeRequestCard,
            { transform: [{ translateY: requestSlide }] },
          ]}
        >
          <View style={styles.requestHandle} />

          <View style={styles.requestHeader}>
            <View style={styles.requestPassenger}>
              <View
                style={[
                  styles.requestAvatar,
                  { backgroundColor: getAvatarColor(activeRequest.rider_name || 'R') },
                ]}
              >
                <Text style={styles.avatarText}>
                  {activeRequest.rider_name?.charAt(0).toUpperCase() || 'R'}
                </Text>
              </View>
              <View>
                <Text style={styles.requestName}>{activeRequest.rider_name}</Text>
                <Text style={styles.requestSubtext}>
                  {activeRequest.seats_requested} seat{activeRequest.seats_requested > 1 ? 's' : ''} requested
                </Text>
              </View>
            </View>
            {pendingRequests.length > 1 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>
                  +{pendingRequests.length - 1} more
                </Text>
              </View>
            )}
          </View>

          <View style={styles.requestRoute}>
            <View style={styles.routeIndicators}>
              <View style={styles.pickupDot} />
              <View style={styles.routeLine} />
              <View style={styles.dropoffDot} />
            </View>
            <View style={styles.addresses}>
              <Text style={styles.requestAddress} numberOfLines={2}>
                {activeRequest.start_location?.name || 'Pickup location'}
              </Text>
              <View style={styles.addressSpacer} />
              <Text style={styles.requestAddress} numberOfLines={2}>
                {activeRequest.end_location?.name || 'Drop-off location'}
              </Text>
            </View>
          </View>

          <View style={styles.requestInfo}>
            <View style={styles.requestInfoItem}>
              <Text style={styles.requestInfoLabel}>Fare</Text>
              <Text style={styles.requestInfoValue}>
                PKR {activeRequest.price_per_seat || '—'}
              </Text>
            </View>
            <View style={styles.requestInfoItem}>
              <Text style={styles.requestInfoLabel}>Date</Text>
              <Text style={styles.requestInfoValueSmall}>
                {activeRequest.ride_date || '—'}
              </Text>
            </View>
            <View style={styles.requestInfoItem}>
              <Text style={styles.requestInfoLabel}>Booking</Text>
              <Text style={styles.requestInfoValueSmall}>
                #{activeRequest.id?.slice(-6).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.requestActions}>
            <TouchableOpacity style={styles.declineButton} onPress={handleReject}>
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.acceptButtonText}>Accept Request</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />

      {/* ── HEADER ──────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
          <Ionicons name="menu" size={28} color="#2A66B5" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusToggle,
            isOnline ? styles.statusOnline : styles.statusOffline,
          ]}
          onPress={() => setIsOnline(prev => !prev)}
        >
          <View style={styles.statusDot} />
          <Text style={[styles.statusText, isOnline && styles.statusTextOnline]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </TouchableOpacity>

        {/* Post Ride shortcut in header when offline */}
        {!isOnline && (
          <TouchableOpacity
            style={styles.headerPostBtn}
            onPress={() => router.push('/postride')}
          >
            <Ionicons name="add-circle-outline" size={28} color="#2A66B5" />
          </TouchableOpacity>
        )}

        {isOnline && (
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={28} color="#2A66B5" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      {isOnline ? renderOnlineContent() : renderOfflineContent()}

      {/* ── BOTTOM NAV ──────────────────────────────────── */}
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
          <Text style={[styles.navLabel, activeTab === 'requests' && styles.navLabelActive]}>
            Requests
          </Text>
        </TouchableOpacity>

        {/* Center: Post Ride */}
        <TouchableOpacity
          style={styles.navItemCenter}
          onPress={() => router.push('/post-ride')}
        >
          <View style={styles.navPostButton}>
            <Ionicons name="add" size={28} color="#fff" />
          </View>
          <Text style={styles.navLabelCenter}>Post Ride</Text>
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
          <Text style={[styles.navLabel, activeTab === 'wallet' && styles.navLabelActive]}>
            Wallet
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── SIDEBAR OVERLAY ─────────────────────────────── */}
      {showSidebar && (
        <TouchableOpacity
          style={styles.sidebarOverlay}
          activeOpacity={1}
          onPress={toggleSidebar}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: sidebarSlide }] }]}
        pointerEvents={showSidebar ? 'auto' : 'none'}
      >
        <View style={styles.sidebarHeader}>
          <View style={styles.profileSection}>
            <View style={[styles.sidebarAvatar, { backgroundColor: '#4D9EFF' }]}>
              <Text style={styles.sidebarAvatarText}>
                {driverProfile?.name?.charAt(0).toUpperCase() || 'D'}
              </Text>
            </View>
            <Text style={styles.profileName}>{driverProfile?.name || 'Driver'}</Text>
            <View style={styles.sidebarRating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.sidebarRatingText}>4.95 (88)</Text>
            </View>
          </View>
        </View>

        <View style={styles.sidebarContent}>
          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => {
              toggleSidebar();
              router.push('/post-ride');
            }}
          >
            <Ionicons name="car-sport-outline" size={20} color="#4D9EFF" />
            <Text style={[styles.sidebarItemText, { color: '#4D9EFF', fontWeight: '700' }]}>
              Post a Ride
            </Text>
          </TouchableOpacity>
          <View style={styles.sidebarDivider} />
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="wallet-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="notifications-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="settings-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="help-circle-outline" size={20} color="#718096" />
            <Text style={styles.sidebarItemText}>Help</Text>
          </TouchableOpacity>
          <View style={styles.sidebarDivider} />
          <TouchableOpacity style={styles.sidebarItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
            <Text style={[styles.sidebarItemText, { color: '#FF6B6B' }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.passengerModeButton}
          onPress={() => {
            toggleSidebar();
            router.push('/riderMainScreen');
          }}
        >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7FF' },

  // ── HEADER ────────────────────────────────────────────
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
  menuButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
  },
  statusOffline: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  statusOnline: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  statusText: { fontSize: 15, fontWeight: '700', color: '#718096' },
  statusTextOnline: { color: '#fff' },
  headerPostBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  filterButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },

  // ── OFFLINE ───────────────────────────────────────────
  offlineContent: { flex: 1 },

  // Post Ride Banner
  postRideBanner: {
    margin: 16,
    backgroundColor: '#2A66B5',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#2A66B5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  postRideBannerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
  },
  postRideIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postRideBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    flex: 1,
  },
  postRideBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
    lineHeight: 18,
  },
  postRideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4D9EFF',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  postRideButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Promo card
  promotionCard: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  promotionText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    marginLeft: 12,
    fontWeight: '500',
  },
  promotionActions: { flexDirection: 'row', width: '100%', marginTop: 12, gap: 8 },
  promotionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  promotionButtonText: { fontSize: 14, fontWeight: '600', color: '#2A66B5' },
  laterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 4,
  },
  laterButtonText: { fontSize: 14, color: '#718096' },

  // My Rides section
  myRidesSection: { paddingHorizontal: 16 },
  myRidesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  myRidesSectionTitle: { fontSize: 16, fontWeight: '700', color: '#2A66B5' },
  emptyRides: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyRidesTitle: { fontSize: 16, fontWeight: '600', color: '#A0AEC0' },
  emptyRidesSubtitle: {
    fontSize: 13,
    color: '#CBD5E0',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Ride card
  rideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rideHeader: { flexDirection: 'row', marginBottom: 10 },
  rideRouteInfo: { flex: 1, flexDirection: 'row' },
  earningsContainer: { alignItems: 'flex-end' },
  earnings: { fontSize: 18, fontWeight: 'bold', color: '#2A66B5' },
  earningsLabel: { fontSize: 12, color: '#718096' },
  rideFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  rideDate: { fontSize: 11, color: '#A0AEC0' },

  // ── ONLINE ────────────────────────────────────────────
  onlineContent: { flex: 1 },
  mapPlaceholder: { flex: 1, backgroundColor: '#E8F4FD', position: 'relative' },
  mapGrid: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', flexWrap: 'wrap' },
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

  // "Schedule a Ride" pill on online map
  onlinePostBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2A66B5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 6,
  },
  onlinePostBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Searching card
  searchingCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 80,           // leave room for schedule button
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
  searchingText: { fontSize: 15, fontWeight: '600', color: '#2A66B5', marginBottom: 6 },
  searchingSubtext: { fontSize: 13, color: '#718096', textAlign: 'center' },

  // ── REQUEST CARD ──────────────────────────────────────
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
  requestPassenger: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  requestName: { fontSize: 18, fontWeight: '600', color: '#2A66B5' },
  requestSubtext: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  requestRoute: { flexDirection: 'row', marginBottom: 20 },
  requestAddress: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  requestInfo: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  requestInfoItem: { flex: 1, backgroundColor: '#F0F7FF', padding: 12, borderRadius: 12 },
  requestInfoLabel: { fontSize: 11, color: '#718096', marginBottom: 4 },
  requestInfoValue: { fontSize: 16, fontWeight: '700', color: '#2A66B5' },
  requestInfoValueSmall: { fontSize: 13, fontWeight: '700', color: '#2A66B5' },
  requestActions: { flexDirection: 'row', gap: 12 },
  declineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  declineButtonText: { fontSize: 16, fontWeight: '600', color: '#718096' },
  acceptButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4D9EFF',
    alignItems: 'center',
  },
  acceptButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // ── SHARED ────────────────────────────────────────────
  routeIndicators: { width: 24, alignItems: 'center', marginRight: 12 },
  pickupDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50' },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
    minHeight: 20,
  },
  dropoffDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF6B6B' },
  addresses: { flex: 1, justifyContent: 'space-between' },
  address: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  addressSpacer: { height: 8 },
  vehicleBadge: {
    backgroundColor: '#4D9EFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vehicleBadgeText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  passengerCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  passengerCountText: { fontSize: 13, color: '#718096' },

  // ── BOTTOM NAV ────────────────────────────────────────
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
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navLabel: { fontSize: 12, color: '#718096' },
  navLabelActive: { color: '#4D9EFF', fontWeight: '600' },
  navItemCenter: { flex: 1, alignItems: 'center', marginTop: -20 },
  navPostButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2A66B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#2A66B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  navLabelCenter: { fontSize: 12, color: '#2A66B5', fontWeight: '700' },

  // ── SIDEBAR ───────────────────────────────────────────
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
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sidebarHeader: {
    backgroundColor: '#F0F7FF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileSection: { alignItems: 'center' },
  sidebarAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sidebarAvatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  profileName: { fontSize: 18, fontWeight: '600', color: '#2A66B5', marginBottom: 4 },
  sidebarRating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sidebarRatingText: { fontSize: 14, color: '#718096' },
  sidebarContent: { flex: 1, paddingTop: 8 },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  sidebarItemText: { fontSize: 16, color: '#2A66B5' },
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
  passengerModeText: { fontSize: 16, fontWeight: '700', color: '#2A66B5' },
  socialIcons: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingBottom: 32 },
  socialIcon: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
});