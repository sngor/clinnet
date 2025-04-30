import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatients } from '../services/patientService'; // Placeholder service
import { useAuth } from '../hooks/useAuth';

const PatientListPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Get user info if needed for actions

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError('');
      try {
        // TODO: Add filtering options if needed, e.g., getPatients({ name: '...' })
        const data = await getPatients();
        setPatients(data);
      } catch (err) {
        setError('Failed to fetch patients.');
        // console.error(err); // Avoid logging potentially sensitive info
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div>
      <h2>Patient List</h2>

      {/* TODO: Add search/filter inputs here */}

      {/* Optional: Add Patient button for authorized roles */}
      {(user?.role === 'admin' || user?.role === 'frontdesk') && (
          <button style={{ marginBottom: '15px' }}>Add New Patient</button>
          // This button would likely navigate to a new patient form page or open a modal
      )}

      {loading && <p>Loading patients...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Date of Birth</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.id}</td>
                <td>{patient.name}</td>
                <td>{patient.dob}</td>
                <td>{patient.contact}</td>
                <td>
                  <Link to={`/patients/${patient.id}`}>View Details</Link>
                  {/* Add Edit/Delete buttons based on role if needed */}
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No patients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientListPage;