import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'

import { v4 as uuidv4 } from 'uuid';
//import { compare, hash } from "react-native-simple-bcrypt";

import JWT, { SupportedAlgorithms } from 'expo-jwt';
//import { createHash, randomBytes } from 'crypto';
import * as Crypto from 'expo-crypto';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
  exp: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  email: string;
  passwordHash: string;
  roles: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface RefreshToken {
  token: string;
  userId: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

class AuthService {
  private db;
  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly jwtSecret: string;
  private readonly accessTokenExpiry: number = 15 * 60; // 15 minutes in seconds
  private readonly refreshTokenExpiry: number = 7 * 24 * 60 * 60; // 7 days in seconds
  private readonly resetTokenExpiry: number = 24 * 60 * 60; // 24 hours in seconds

  constructor(firebaseConfig: any, jwtSecret: string) {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    this.jwtSecret = jwtSecret;
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<TokenPayload> {
    try {
      // Find user by email
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where('email', '==', credentials.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid email or password');
      }

      const userDoc = querySnapshot.docs[0];
      const user = userDoc.data() as User;

      // Verify password
      //const isPasswordValid = await compare(credentials.password, user.passwordHash);
      const isPasswordValid =  credentials.password == user.passwordHash;
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Store refresh token in Firestore
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      // Store tokens locally
      await this.storeTokensLocally(tokens);

      return this.decodeToken(tokens.accessToken);
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async register(credentials: RegisterCredentials): Promise<TokenPayload> {
    this.validateRegistration(credentials);

    try {
      // Check if email already exists
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where('email', '==', credentials.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error('Email already in use');
      }

      //const passwordHash = await hash(credentials.password);
      const passwordHash = credentials.password;

      // Create user in Firestore
      const userId = uuidv4();
      const now = Timestamp.now();

      const user: User = {
        id: userId,
        email: credentials.email,
        passwordHash,
        roles: ['user'],
        createdAt: now,
        updatedAt: now
      };

      await setDoc(doc(this.db, 'users', userId), user);

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Store refresh token in Firestore
      await this.storeRefreshToken(userId, tokens.refreshToken);

      // Store tokens locally
      await this.storeTokensLocally(tokens);

      return this.decodeToken(tokens.accessToken);
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (refreshToken) {
        // Delete refresh token from Firestore
        const tokensRef = collection(this.db, 'refreshTokens');
        const q = query(tokensRef, where('token', '==', refreshToken));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const tokenDoc = querySnapshot.docs[0];
          await updateDoc(doc(this.db, 'refreshTokens', tokenDoc.id), {
            invalidated: true
          });
        }
      }
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      await this.clearTokens();
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      // Find user by email
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Don't reveal if email exists or not
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const user = userDoc.data() as User;

      // Generate reset token
      const resetToken = this.generateResetToken();
      const resetTokenHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        resetToken
      );

      const now = Timestamp.now();
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + this.resetTokenExpiry * 1000));

      const resetTokenData: PasswordResetToken = {
        token: resetTokenHash,
        userId: user.id,
        expiresAt,
        createdAt: now
      };

      await setDoc(doc(this.db, 'passwordResetTokens', resetTokenHash), resetTokenData);

      // In a real application, you would send an email or SMS with the reset link
      console.log(`Reset token for ${email}: ${resetToken}`);

      // Note: In production, you'd integrate with a notification service for mobile
      // Example: await sendResetNotification(email, resetToken);
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    this.validatePassword(newPassword);

    try {
      // Hash the provided token to compare with stored hash
      const tokenHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        token
      );

      // Find token in Firestore
      const tokenRef = doc(this.db, 'passwordResetTokens', tokenHash);
      const tokenDoc = await getDoc(tokenRef);

      if (!tokenDoc.exists()) {
        throw new Error('Invalid or expired password reset token');
      }

      const resetToken = tokenDoc.data() as PasswordResetToken;
      const now = Timestamp.now();

      // Check if token is expired
      if (resetToken.expiresAt.toMillis() < now.toMillis()) {
        throw new Error('Password reset token has expired');
      }

      const salt = await BcryptReactNative.getSalt(10);
      const passwordHash = await BcryptReactNative.hash(newPassword, salt);

      // Update user's password
      const userRef = doc(this.db, 'users', resetToken.userId);
      await updateDoc(userRef, {
        passwordHash,
        updatedAt: now
      });

      // Invalidate the reset token
      await updateDoc(tokenRef, {
        invalidated: true
      });
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // Token Management
  async refreshAccessToken(): Promise<void> {
    const refreshToken = await this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Verify refresh token in Firestore
      const tokensRef = collection(this.db, 'refreshTokens');
      const q = query(tokensRef, where('token', '==', refreshToken));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid refresh token');
      }

      const tokenDoc = querySnapshot.docs[0];
      const storedToken = tokenDoc.data() as RefreshToken;

      // Check if token is expired
      const now = Timestamp.now();
      if (storedToken.expiresAt.toMillis() < now.toMillis()) {
        throw new Error('Refresh token has expired');
      }

      // Get user
      const userRef = doc(this.db, 'users', storedToken.userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const user = userDoc.data() as User;

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Store new refresh token
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      // Invalidate old refresh token
      await updateDoc(doc(this.db, 'refreshTokens', tokenDoc.id), {
        invalidated: true
      });

      // Update local storage
      await this.storeTokensLocally(tokens);
    } catch (error) {
      await this.clearTokens();
      throw error;
    }
  }

  // Helper Methods
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + this.refreshTokenExpiry * 1000));

    const refreshTokenData: RefreshToken = {
      token,
      userId,
      expiresAt,
      createdAt: now
    };

    await setDoc(doc(this.db, 'refreshTokens', uuidv4()), refreshTokenData);
  }

  private generateResetToken(): string {
    return this.generateRandomHex(32);
  }

  private generateTokens(user: User): AuthTokens {
    const accessToken = JWT.encode(
      {
        userId: user.id,
        email: user.email,
        roles: user.roles
      },
      this.jwtSecret,
      {
        algorithm: SupportedAlgorithms.HS512
      });

    const refreshToken = this.generateRandomHex(40);

    return { accessToken, refreshToken };
  }

  generateRandomHex(byteCount: number) {
    const randomBytes = Crypto.getRandomBytes(byteCount); // returns Uint8Array
    const hex = [...randomBytes].map(b => b.toString(16).padStart(2, '0')).join('');
    return hex;
  };


  private async storeTokensLocally(tokens: AuthTokens): Promise<void> {
    await AsyncStorage.setItem(this.tokenKey, tokens.accessToken);
    await AsyncStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
  }

  private async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem(this.tokenKey);
    await AsyncStorage.removeItem(this.refreshTokenKey);
  }

  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(this.tokenKey);
  }

  private async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(this.refreshTokenKey);
  }

  async decodeToken(token?: string | null): Promise<TokenPayload> {
    if (!token) {
      token = await this.getAccessToken();
    }

    if (!token) {
      throw new Error('No token available');
    }

    try {
      return await JWT.decode(token, this.jwtSecret, { exp: this.accessTokenExpiry });
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private validateRegistration(credentials: RegisterCredentials): void {
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (credentials.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error('Invalid email format');
    }
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }

  // Authorization Helpers
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = await this.decodeToken(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  async getUserRoles(): Promise<string[]> {
    try {
      const decoded = await this.decodeToken();
      return decoded.roles || [];
    } catch {
      return [];
    }
  }

  async hasRole(role: string): Promise<boolean> {
    const roles = await this.getUserRoles();
    return roles.includes(role);
  }

  async getUserData(): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        return null;
      }

      const decoded = await this.decodeToken();
      const userRef = doc(this.db, 'users', decoded.userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const user = userDoc.data() as User;
      // Remove sensitive data
      const { passwordHash, ...userData } = user;

      return userData;
    } catch {
      return null;
    }
  }

  // API Interceptor - For use with axios or similar HTTP client
  getAuthHeader = async (): Promise<{ Authorization: string } | undefined> => {
    const token = await this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }

  // Secure Storage Check - Useful for app initialization
  async checkAndRefreshAuth(): Promise<boolean> {
    try {
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        const refreshToken = await this.getRefreshToken();
        if (refreshToken) {
          await this.refreshAccessToken();
          return await this.isAuthenticated();
        }
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // Error Handling
  private handleAuthError(error: any): void {
    console.error('Auth Error:', error);
    throw error;
  }
}

// Usage Example
const firebaseConfig = {
  apiKey: "AIzaSyAXxRwvfV7kLjpLRBEOQxHvO4CLEI7_arA",
  authDomain: "household-manager-11a8d.firebaseapp.com",
  projectId: "household-manager-11a8d",
  storageBucket: "household-manager-11a8d.firebasestorage.app",
  messagingSenderId: "513639398069",
  appId: "1:513639398069:web:7130875371dbd6c6ea9cfc"
};

const jwtSecret = "YOUR_JWT_SECRET_KEY"; // Use a secure environment variable in production

const authService = new AuthService(firebaseConfig, jwtSecret);

export default authService;