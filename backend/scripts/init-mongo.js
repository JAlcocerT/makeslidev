// MongoDB initialization script for MakeSlidev
// This script creates the database and initial collections

print('Starting MakeSlidev MongoDB initialization...');

// Switch to the makeslidev database
db = db.getSiblingDB('makeslidev');

// Create collections
db.createCollection('templates');
db.createCollection('users');
db.createCollection('presentations');

// Create indexes for better performance
db.templates.createIndex({ "name": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.presentations.createIndex({ "userId": 1 });
db.presentations.createIndex({ "templateId": 1 });
db.presentations.createIndex({ "createdAt": -1 });

// Insert sample data if needed
db.templates.insertMany([
  {
    name: "business-pitch",
    title: "Business Pitch",
    description: "Professional business pitch template with problem-solution structure",
    category: "Business",
    slideCount: 7,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "tech-presentation",
    title: "Tech Presentation", 
    description: "Technical presentation template for showcasing technology solutions",
    category: "Technology",
    slideCount: 8,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('MakeSlidev MongoDB initialization completed successfully!');
print('Collections created: templates, users, presentations');
print('Sample templates inserted: business-pitch, tech-presentation');
