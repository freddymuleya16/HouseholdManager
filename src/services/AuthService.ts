 
import   { UserEntity, User, UserRole, UserStatus } from '@/entities/User';
import { userRepository } from '@/repositories/repo';
import jwt, { HeaderOptions } from "expo-jwt";
import { v4 as uuidv4 } from 'uuid';

// Authentication Configuration
interface AuthConfig {
  jwtSecret: string;
  jwtExpiration: any;
  refreshTokenExpiration: any;
}

// Token Payload Interface
interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Login Credentials Interface
interface LoginCredentials {
  email: string;
  password: string;
}

// Registration Credentials Interface
interface RegisterCredentials extends LoginCredentials {
  username: string;
  confirmPassword: string;
}

export class AuthService {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  // User Registration
  async register(credentials: RegisterCredentials): Promise<User> {
    // Validate registration input
    this.validateRegistration(credentials);

    // Check if user already exists
    const existingUser = await userRepository.find({ 
      email: credentials.email.toLowerCase() 
    });

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Create user entity
    const newUser = await UserEntity.create({
      username: credentials.username,
      email: credentials.email,
      password: credentials.password
    });

    // Save user to database
    return await userRepository.create(newUser);
  }

  // User Login
  async login(credentials: LoginCredentials): Promise<{
    user: Partial<User>,
    accessToken: string,
    refreshToken: string
  }> {
    // Find user by email
    const users = await userRepository.find({ 
      email: credentials.email.toLowerCase() 
    });
    const user = users[0];

    // Validate user existence and password
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check account status
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('Account is not active');
    }

    // Verify password
    const isPasswordValid = await UserEntity.verifyPassword(
      credentials.password, 
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Update last login
    await userRepository.update(user.id, { 
      lastLogin: new Date() 
    });

    return {
      user: UserEntity.serialize(user),
      accessToken,
      refreshToken
    };
  }

  // Generate Access Token
  private generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    
    return jwt.encode(payload, this.config.jwtSecret );
  }

  // Generate Refresh Token
  private generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.encode(payload, this.config.jwtSecret );
  }

  // Verify and Refresh Access Token
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string,
    user: Partial<User>
  }> {
    try {
      // Verify refresh token
      const decoded = jwt.decode(
        refreshToken, 
        this.config.jwtSecret
      ) as TokenPayload;

      // Find user
      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      return {
        accessToken: newAccessToken,
        user: UserEntity.serialize(user)
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Password Reset Initiation
  async initiatePasswordReset(email: string): Promise<string> {
    // Find user by email
    const users = await userRepository.find({ 
      email: email.toLowerCase() 
    });
    const user = users[0];

    if (!user) {
      throw new Error('No user found with this email');
    }

    // Generate password reset token
    const { token, expires } = UserEntity.generatePasswordResetToken();

    // Update user with reset token
    await userRepository.update(user.id, {
      passwordResetToken: token,
      passwordResetExpires: expires
    });

    return token;
  }

  // Perform Password Reset
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find user with valid reset token
    const users = await userRepository.find({ 
      passwordResetToken: token 
    });
    const user = users[0];

    if (!user) {
      throw new Error('Invalid reset token');
    }

    // Check token expiration
    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new Error('Reset token has expired');
    }

    // Create new password hash
    const salt = await UserEntity.create({ 
      username: user.username, 
      email: user.email, 
      password: newPassword 
    }).then(u => u.salt);

    const passwordHash = await UserEntity.verifyPassword(
      newPassword, 
      await UserEntity.create({ 
        username: user.username, 
        email: user.email, 
        password: newPassword 
      }).then(u => u.passwordHash)
    );

    // Update user with new password and clear reset token
    await userRepository.update(user.id, {
      passwordHash: passwordHash.toString(),
      salt,
      passwordResetToken: undefined,
      passwordResetExpires: undefined
    });
  }

  // Validate Registration Input
  private validateRegistration(credentials: RegisterCredentials): void {
    // Validate password match
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Additional custom validations can be added here
  }

  // Authorization Helpers
  async checkAuthorization(
    userId: string, 
    requiredRole: UserRole
  ): Promise<boolean> {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      return false;
    }

    return UserEntity.hasRole(user, requiredRole);
  }
}

// Example configuration
const authConfig: AuthConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: '1h',
  refreshTokenExpiration: '7d'
};

const authService = new AuthService(authConfig);

export default authService;