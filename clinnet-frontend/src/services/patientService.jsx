// Simulates API calls for patients. Replace with actual fetch or axios.
// import axios from 'axios';
// const API_URL = 'http://localhost:8000/api/patients/';

// Import DOMPurify for sanitizing user input
// DOMPurify is a library that helps prevent XSS attacks by sanitizing HTML and preventing script injection
import DOMPurify from 'dompurify';

// Dummy data
const dummyPatients = [
    { id: 1, name: 'Alice Wonderland', dob: '1990-05-15', contact: '555-1234', insurance: 'BlueCross A123' },
    { id: 2, name: 'Bob The Builder', dob: '1985-11-20', contact: '555-5678', insurance: 'United Health B456' },
    { id: 3, name: 'Charlie Chaplin', dob: '1978-03-10', contact: '555-9900', insurance: 'Cigna C789' },
];


export const getPatients = async (filters = {}) => {
    console.log('Simulating fetching patients with filters:', DOMPurify.sanitize(JSON.stringify(filters)));
    // Replace with actual API call:
    // const response = await axios.get(API_URL, {
    //    params: filters,
    //    headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    // });
    // return response.data;

    // --- Placeholder Logic ---
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
    let results = dummyPatients;
    if (filters.name) {
        results = results.filter(p => p.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    // Add other filters here...
    return results;
    // --- End Placeholder ---
}

export const getPatientById = async (id) => {
    const patientId = parseInt(id, 10); // Ensure ID is a number
    console.log('Simulating fetching patient with ID:', patientId);
    // Replace with actual API call:
    // const response = await axios.get(`${API_URL}${patientId}/`, {
    //    headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    // });
    // return response.data;

     // --- Placeholder Logic ---
    await new Promise(resolve => setTimeout(resolve, 450)); // Simulate network delay
    const patient = dummyPatients.find(p => p.id === patientId);
    return patient || null; // Return null if not found
     // --- End Placeholder ---
}

// Import DOMPurify for sanitizing user input
// DOMPurify is a DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, MathML and SVG

export const createPatient = async (patientData) => {
    console.log('Simulating creating patient:', DOMPurify.sanitize(JSON.stringify(patientData)));
    // Replace with actual API call:
    // const response = await axios.post(API_URL, patientData, {
    //    headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    // });
    // return response.data;

    // --- Placeholder Logic ---
     await new Promise(resolve => setTimeout(resolve, 700));
     const newId = Math.max(...dummyPatients.map(p => p.id), 0) + 1;
     const newPatient = { ...patientData, id: newId };
     dummyPatients.push(newPatient); // Add to our dummy list
     console.log("Updated dummy patients:", DOMPurify.sanitize(JSON.stringify(dummyPatients)));
     return newPatient;
     // --- End Placeholder ---
}

// Add updatePatient, deletePatient etc. as needed