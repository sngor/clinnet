// src/features/services/data/initialServices.js

/**
 * Initial services data for demonstration purposes
 * In a real application, this would come from an API
 */
export const initialServices = [
  {
    id: 1,
    name: "General Consultation",
    description: "Standard medical consultation with a general practitioner",
    category: "consultation",
    price: 100.00,
    discountPercentage: 0,
    duration: 30, // in minutes
    active: true
  },
  {
    id: 2,
    name: "Specialist Consultation",
    description: "Consultation with a medical specialist",
    category: "consultation",
    price: 150.00,
    discountPercentage: 0,
    duration: 45,
    active: true
  },
  {
    id: 3,
    name: "Blood Test - Basic Panel",
    description: "Standard blood work including CBC, metabolic panel",
    category: "laboratory",
    price: 75.00,
    discountPercentage: 0,
    duration: 15,
    active: true
  },
  {
    id: 4,
    name: "X-Ray - Single View",
    description: "Single view X-ray imaging",
    category: "imaging",
    price: 120.00,
    discountPercentage: 0,
    duration: 20,
    active: true
  },
  {
    id: 5,
    name: "Annual Physical",
    description: "Comprehensive annual physical examination",
    category: "examination",
    price: 200.00,
    discountPercentage: 10,
    duration: 60,
    active: true
  },
  {
    id: 6,
    name: "Vaccination - Flu",
    description: "Annual influenza vaccination",
    category: "vaccination",
    price: 45.00,
    discountPercentage: 0,
    duration: 10,
    active: true
  },
  {
    id: 7,
    name: "Physical Therapy Session",
    description: "One-hour physical therapy session",
    category: "therapy",
    price: 85.00,
    discountPercentage: 0,
    duration: 60,
    active: true
  },
  {
    id: 8,
    name: "MRI Scan",
    description: "Magnetic Resonance Imaging scan",
    category: "imaging",
    price: 850.00,
    discountPercentage: 0,
    duration: 45,
    active: true
  },
  {
    id: 9,
    name: "Dental Cleaning",
    description: "Basic dental cleaning and examination",
    category: "procedure",
    price: 120.00,
    discountPercentage: 5,
    duration: 45,
    active: true
  },
  {
    id: 10,
    name: "Mental Health Consultation",
    description: "Initial consultation with mental health professional",
    category: "consultation",
    price: 175.00,
    discountPercentage: 0,
    duration: 50,
    active: true
  }
];