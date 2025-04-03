# MongoDB Integration for NoPay Club

This project has been migrated from PostgreSQL (using Drizzle ORM) to MongoDB (using Mongoose) to create a complete MERN stack.

## MongoDB Configuration

The MongoDB connection is configured in `server/db.ts` which handles:
- Connecting to the MongoDB database
- Handling connection events
- Providing graceful shutdown

## MongoDB Models

The MongoDB models are defined in `shared/schema.ts`:
- User model for authentication
- InternshipApplication model for the internship application feature

## Environment Variables

For production, you need to set the `MONGODB_URI` environment variable:

```
# For production with MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nopay_club

# For production with a local MongoDB server
MONGODB_URI=mongodb://username:password@localhost:27017/nopay_club
```

### Development Environment

For development purposes, the application automatically uses an in-memory MongoDB server (using `mongodb-memory-server`) when no `MONGODB_URI` environment variable is provided. This makes development easier as:

1. No need to install MongoDB locally
2. Clean database on each restart
3. No conflicts between test data and production data

## Data Access Layer

The application uses a storage interface defined in `server/storage.ts` that abstracts database operations:

- `MongoDBStorage` class implements the `IStorage` interface
- All database operations are performed through this interface
- This approach provides a clean separation of concerns and makes the code easier to test

## Migration Notes

When migrating from PostgreSQL to MongoDB:

1. We've replaced Drizzle ORM with Mongoose
2. Changed data models to use MongoDB schemas
3. Updated storage implementation to use MongoDB queries
4. Added MongoDB connection management in server/db.ts
5. Updated environment variable requirements from DATABASE_URL to MONGODB_URI

## Deployment

See `DEPLOYMENT_GUIDE.md` for detailed instructions on deploying the application with MongoDB to a production environment.