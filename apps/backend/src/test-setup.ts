// Test setup file for backend tests
import 'reflect-metadata';
import '@testing-library/jest-dom';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test';

// Global Jest setup
declare global {
  // Jest globals are already available through @types/jest
  // This file is just to ensure proper setup
}
