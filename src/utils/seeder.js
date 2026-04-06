import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const users = [
  {
    name: "Super Admin",
    email: "admin@finance.com",
    password: "admin123",
    role: "admin",
    status: "active",
  },
  {
    name: "Alice Analyst",
    email: "analyst@finance.com",
    password: "analyst123",
    role: "analyst",
    status: "active",
  },
  {
    name: "Victor Viewer",
    email: "viewer@finance.com",
    password: "viewer123",
    role: "viewer",
    status: "active",
  },
];

const generateTransactions = (userId) => [
  { title: "Monthly Salary", amount: 75000, type: "income", category: "salary", date: new Date("2024-01-05"), notes: "January salary credit", createdBy: userId },
  { title: "Freelance Project", amount: 15000, type: "income", category: "freelance", date: new Date("2024-01-12"), notes: "Website design project", createdBy: userId },
  { title: "Stock Dividends", amount: 5000, type: "income", category: "investment", date: new Date("2024-01-20"), createdBy: userId },
  { title: "Apartment Rent", amount: 18000, type: "expense", category: "rent", date: new Date("2024-01-01"), notes: "January rent", createdBy: userId },
  { title: "Grocery Shopping", amount: 4200, type: "expense", category: "food", date: new Date("2024-01-08"), createdBy: userId },
  { title: "Electricity Bill", amount: 1800, type: "expense", category: "utilities", date: new Date("2024-01-10"), createdBy: userId },
  { title: "Metro Pass", amount: 900, type: "expense", category: "transport", date: new Date("2024-01-03"), createdBy: userId },
  { title: "Netflix + Spotify", amount: 1200, type: "expense", category: "entertainment", date: new Date("2024-01-15"), createdBy: userId },
  { title: "February Salary", amount: 75000, type: "income", category: "salary", date: new Date("2024-02-05"), createdBy: userId },
  { title: "Grocery Shopping", amount: 3900, type: "expense", category: "food", date: new Date("2024-02-10"), createdBy: userId },
  { title: "Gym Membership", amount: 2500, type: "expense", category: "healthcare", date: new Date("2024-02-01"), createdBy: userId },
  { title: "Online Course", amount: 3500, type: "expense", category: "education", date: new Date("2024-02-20"), notes: "Node.js advanced course", createdBy: userId },
  { title: "March Salary", amount: 80000, type: "income", category: "salary", date: new Date("2024-03-05"), notes: "Salary with appraisal", createdBy: userId },
  { title: "Flight Tickets", amount: 12000, type: "expense", category: "travel", date: new Date("2024-03-15"), notes: "Goa trip", createdBy: userId },
  { title: "Mutual Fund SIP", amount: 10000, type: "expense", category: "investment", date: new Date("2024-03-10"), createdBy: userId },
  { title: "Consulting Income", amount: 25000, type: "income", category: "business", date: new Date("2024-03-22"), createdBy: userId },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log(" Existing data cleared.");

    // Create users (password hashing handled by model hook)
    const createdUsers = await User.create(users);
    const adminUser = createdUsers.find((u) => u.role === "admin");
    console.log(` ${createdUsers.length} users seeded.`);

    // Seed transactions linked to admin user
    const transactions = generateTransactions(adminUser._id);
    await Transaction.create(transactions);
    console.log(`${transactions.length} transactions seeded.`);

    console.log("\n Database seeded successfully!\n");
    console.log("─────────────────────────────────────────");
    console.log("  Demo Credentials:");
    console.log("  Admin   → admin@finance.com   / admin123");
    console.log("  Analyst → analyst@finance.com / analyst123");
    console.log("  Viewer  → viewer@finance.com  / viewer123");
    console.log("─────────────────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error(" Seeder failed:", error.message);
    process.exit(1);
  }
};

seedDB();
