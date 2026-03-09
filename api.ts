// api.ts  ─  Single unified API file for Carvaan
//
// IMPORT PATTERNS SUPPORTED:
//   import ApiService from '../api'                       ← PostRideScreen default import
//   import ApiService from '../services/api'              ← if file lives in services/
//   import { bookRide, cancelBooking, ... } from '../api' ← DriverMainScreen / riderMainScreen
//
// TOKEN KEY: 'caravan_token'  (one key used everywhere)

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const BASE_URL = 'http://192.168.18.110:8000'; // ← update to your machine's IP

// ─────────────────────────────────────────────────────────────────────────────
// SHARED AXIOS INSTANCE
// ─────────────────────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Attach bearer token to every request
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('caravan_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally (clear stale token)
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('caravan_token');
        }
        return Promise.reject(error);
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
export const signup = async (userData: {
    name: string;
    email: string;
    phone: string;
    emergency_contact: string;
    gender: string;
    password: string;
}) => {
    const res = await api.post('/auth/signup', userData);
    const token = res.data.token || res.data.access_token;
    if (token) await AsyncStorage.setItem('caravan_token', token);
    return res.data;
};

export const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.token || res.data.access_token;
    if (token) await AsyncStorage.setItem('caravan_token', token);
    return res.data;
};

export const logout = async () => {
    await AsyncStorage.removeItem('caravan_token');
};

export const setRole = async (role: 'driver' | 'rider') => {
    const res = await api.put('/auth/set-role', { role });
    return res.data;
};

export const getProfile = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// VEHICLES
// ─────────────────────────────────────────────────────────────────────────────
export const addVehicle = async (vehicleData: {
    vehicle_type: string;
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
    seats: number;
}) => {
    const res = await api.post('/users/vehicle', vehicleData);
    return res.data;
};

export const getMyVehicles = async () => {
    const res = await api.get('/users/my-vehicles');
    return res.data;
};

export const updateProfile = async (data: {
    name?: string;
    emergency_contact?: string;
    profile_picture?: string;
}) => {
    const res = await api.put('/users/profile', data);
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// RIDES
// ─────────────────────────────────────────────────────────────────────────────
export const postRide = async (rideData: {
    start_location: { name: string; latitude: number; longitude: number };
    end_location: { name: string; latitude: number; longitude: number };
    available_seats: number;
    ride_date: string;
    ride_time: string;
    price_per_seat: number;
    vehicle_id: string;
    notes?: string;
}) => {
    const res = await api.post('/rides/', rideData);
    return res.data;
};

export const searchRides = async (date?: string) => {
    const params = date ? { date } : {};
    const res = await api.get('/rides/search', { params });
    return res.data;
};

export const getMyRides = async () => {
    const res = await api.get('/rides/my-rides');
    return res.data;
};

export const getRideDetails = async (rideId: string) => {
    const res = await api.get(`/rides/${rideId}`);
    return res.data;
};

export const cancelRide = async (rideId: string) => {
    const res = await api.put(`/rides/${rideId}/cancel`);
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────────────────────────────────────

/** Used by riderMainScreen */
export const bookRide = async (rideId: string, seats: number = 1) => {
    const res = await api.post('/bookings/', { ride_id: rideId, seats_requested: seats });
    return res.data;
};

/** Alias used by RiderFindRideScreen */
export const createBooking = async (rideId: string, seatsRequested: number = 1) => {
    const res = await api.post('/bookings/', { ride_id: rideId, seats_requested: seatsRequested });
    return res.data;
};

export const getMyBookings = async () => {
    const res = await api.get('/bookings/my-bookings');
    return res.data;
};

export const cancelBooking = async (bookingId: string) => {
    const res = await api.put(`/bookings/${bookingId}/cancel`);
    return res.data;
};

export const getBookingRequests = async () => {
    const res = await api.get('/bookings/requests');
    return res.data;
};

export const acceptBooking = async (bookingId: string) => {
    const res = await api.put(`/bookings/${bookingId}/accept`);
    return res.data;
};

export const rejectBooking = async (bookingId: string) => {
    const res = await api.put(`/bookings/${bookingId}/reject`);
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ApiService CLASS  ─  default export
//
// Satisfies:  import ApiService from '../services/api'   (PostRideScreen)
// Every method delegates to the named function above — zero logic duplication.
// ─────────────────────────────────────────────────────────────────────────────
class _ApiService {
    // AUTH
    signup        = signup;
    login         = login;
    logout        = logout;
    setRole       = setRole;
    getProfile    = getProfile;

    // VEHICLES
    addVehicle    = addVehicle;
    getMyVehicles = getMyVehicles;
    updateProfile = updateProfile;

    // RIDES
    postRide       = postRide;
    searchRides    = searchRides;
    getMyRides     = getMyRides;
    getRideDetails = getRideDetails;
    cancelRide     = cancelRide;

    // BOOKINGS
    createBooking      = createBooking;
    bookRide           = bookRide;
    getMyBookings      = getMyBookings;
    cancelBooking      = cancelBooking;
    getBookingRequests = getBookingRequests;
    acceptBooking      = acceptBooking;
    rejectBooking      = rejectBooking;
}

const ApiService = new _ApiService();
export default ApiService;