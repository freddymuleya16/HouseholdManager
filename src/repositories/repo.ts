 
import adapter from "@/adapter/DatabaseAdapter";
import { User, UserRole, UserStatus } from "@/entities/User";
 
// Create repository with table mapping
export const userRepository = adapter.createRepository<User>({ 
  tableName: 'users',
  primaryKey: 'id'
});

// Optional: Custom repository methods
export const extendedUserRepository = {
  ...userRepository,
  
  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const results = await userRepository.find({ email } as Partial<User>);
    return results[0] || null;
  },
  
  // Find users by role
  async findByRole(role: UserRole): Promise<User[]> {
    return userRepository.find({ role } as Partial<User>);
  },
  
  // Find users by status
  async findByStatus(status: UserStatus): Promise<User[]> {
    return userRepository.find({ status } as Partial<User>);
  }
};