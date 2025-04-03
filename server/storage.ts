import { 
  type User, 
  type InsertUser, 
  type InternshipApplication, 
  type InsertInternshipApplication,
  UserModel,
  InternshipApplicationModel
} from "@shared/schema";

// MongoDB storage interface 
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createInternshipApplication(application: InsertInternshipApplication): Promise<InternshipApplication>;
  getAllInternshipApplications(): Promise<InternshipApplication[]>;
}

// MongoDB implementation
export class MongoDBStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id);
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ username });
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const newUser = new UserModel(insertUser);
      await newUser.save();
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createInternshipApplication(insertApplication: InsertInternshipApplication): Promise<InternshipApplication> {
    try {
      const newApplication = new InternshipApplicationModel({
        ...insertApplication,
        createdAt: new Date().toISOString(),
        status: "pending"
      });
      await newApplication.save();
      return newApplication;
    } catch (error) {
      console.error('Error creating internship application:', error);
      throw error;
    }
  }

  async getAllInternshipApplications(): Promise<InternshipApplication[]> {
    try {
      return await InternshipApplicationModel.find();
    } catch (error) {
      console.error('Error fetching all internship applications:', error);
      return [];
    }
  }
}

// Export MongoDB storage implementation
export const storage = new MongoDBStorage();
