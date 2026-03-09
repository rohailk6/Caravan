// api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'http://192.168.18.110:8000';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// Automatically attach the token to every request
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('caravan_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

// ─── AUTH FUNCTIONS ───────────────────────────────────
export const signup = async (userData: {
    name: string;
    email: string;
    phone: string;
    emergency_contact: string;
    gender: string;
    password: string;
}) => {
    const response = await api.post('/auth/signup', userData);

    // ← FIXED: handles both 'token' and 'access_token' from backend
    const token = response.data.token || response.data.access_token;
    if (token) {
        await AsyncStorage.setItem('caravan_token', token);
    }

    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('caravan_token', response.data.token);
    return response.data;
};

export const logout = async () => {
    await AsyncStorage.removeItem('caravan_token');
};

export const setRole = async (role: 'driver' | 'rider') => {
    const response = await api.put('/auth/set-role', { role });
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// ─── VEHICLE FUNCTIONS ────────────────────────────────
export const addVehicle = async (vehicleData: {
    vehicle_type: string;
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
    seats: number;
}) => {
    const response = await api.post('/users/vehicle', vehicleData);
    return response.data;
};

export const getMyVehicles = async () => {
    const response = await api.get('/users/my-vehicles');
    return response.data;
};

// ─── RIDE FUNCTIONS ───────────────────────────────────
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
    const response = await api.post('/rides/', rideData);
    return response.data;
};

export const searchRides = async (date?: string) => {
    const params = date ? { date } : {};
    const response = await api.get('/rides/search', { params });
    return response.data;
};

export const getMyRides = async () => {
    const response = await api.get('/rides/my-rides');
    return response.data;
};

// ─── BOOKING FUNCTIONS ────────────────────────────────
export const bookRide = async (rideId: string, seats: number = 1) => {
    const response = await api.post('/bookings/', {
        ride_id: rideId,
        seats_requested: seats
    });
    return response.data;
};

export const getMyBookings = async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
};

export const getBookingRequests = async () => {
    const response = await api.get('/bookings/requests');
    return response.data;
};

export const acceptBooking = async (bookingId: string) => {
    const response = await api.put(`/bookings/${bookingId}/accept`);
    return response.data;
};

export const rejectBooking = async (bookingId: string) => {
    const response = await api.put(`/bookings/${bookingId}/reject`);
    return response.data;
};