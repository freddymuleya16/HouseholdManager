import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcryptjs";

// Enum for user roles
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

// Enum for account status
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  DELETED = 'DELETED'
}

// Interface for user profile details
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  birthDate?: Date;
}

// Interface for authentication-related fields
export interface UserAuth {
  email: string;
  passwordHash: string;
  salt: string;
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

// Main User entity
export interface User {
  id: string;
  username: string;
  email: string;
  
  // Authentication fields
  passwordHash: string;
  salt: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Roles and Permissions
  role: UserRole;
  status: UserStatus;
  
  // Profile information
  profile?: UserProfile;
  
  // Security and Authentication
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Optional fields
  twoFactorSecret?: string;
  emailVerificationToken?: string;
  isEmailVerified: boolean;
}

// User creation and management class
export class UserEntity {
  // Create a new user with secure password handling
  static async create(data: {
    username: string;
    email: string;
    password: string;
    role?: UserRole;
    profile?: UserProfile;
  }): Promise<User> {
    // Validate email
    this.validateEmail(data.email);
    
    // Validate password strength
    this.validatePassword(data.password);
    
    // Generate salt and hash
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);
    
    // Create user object
    const user: User = {
      id: uuidv4(),
      username: data.username,
      email: data.email.toLowerCase(),
      passwordHash,
      salt,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: data.role || UserRole.USER,
      status: UserStatus.PENDING,
      profile: data.profile,
      isEmailVerified: false
    };
    
    return user;
  }

  // Verify user password
  static async verifyPassword(
    plainTextPassword: string, 
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  // Generate password reset token
  static generatePasswordResetToken(): {
    token: string;
    expires: Date;
  } {
    const token = uuidv4();
    const expires = new Date(Date.now() + 3600000); // 1 hour from now
    
    return { token, expires };
  }

  // Validate email format
  private static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  // Password strength validation
  private static validatePassword(password: string): void {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join('. '));
    }
  }

  // Update user profile
  static updateProfile(
    user: User, 
    profileUpdates: Partial<UserProfile>
  ): User {
    return {
      ...user,
      profile: {
        ...user.profile,
        ...profileUpdates
      },
      updatedAt: new Date()
    };
  }

  // Check user permissions
  static hasRole(user: User, role: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.MODERATOR]: 2,
      [UserRole.ADMIN]: 3
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[role];
  }

  // Two-factor authentication setup
  static setupTwoFactorAuth(user: User): User {
    // In a real implementation, you'd use a library like speakeasy
    const twoFactorSecret = uuidv4();
    
    return {
      ...user,
      twoFactorSecret,
      updatedAt: new Date()
    };
  }

  // Serialize user (remove sensitive information)
  static serialize(user: User): Partial<User> {
    const { 
      passwordHash, 
      salt, 
      passwordResetToken, 
      twoFactorSecret, 
      emailVerificationToken,
      ...safeUser 
    } = user;
    
    return safeUser;
  }
}

// Example usage
async function exampleUserManagement() {
  try {
    // Create a new user
    const newUser = await UserEntity.create({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'StrongP@ssw0rd!',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Software developer'
      }
    });

    // Verify password
    const isPasswordCorrect = await UserEntity.verifyPassword(
      'StrongP@ssw0rd!', 
      newUser.passwordHash
    );

    // Check user role
    const isAdmin = UserEntity.hasRole(newUser, UserRole.ADMIN);

    // Serialize for safe transmission
    const safeUserData = UserEntity.serialize(newUser);
  } catch (error) {
    console.error('User creation failed', error);
  }
}

export default UserEntity;