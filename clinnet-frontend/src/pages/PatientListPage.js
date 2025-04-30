import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { getPatients } from '../services/patientService'; // Placeholder service
import { useAuth } from '../hooks/useAuth'; // If you need user info

const PatientListPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth(); // Get user info if needed (e.g., for filtering)

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError('');
      try {
        // Pass search term to the service if implemented
        const data = await getPatients({ name: searchTerm /* other filters */ });
        setPatients(data);
      } catch (err) {
        setError('Failed to fetch patients.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
    // Re-fetch when searchTerm changes (add debounce in real app)
  }, [searchTerm]);

  const handleSearchChange = (event) => {
      setSearchTerm(event.target.value);
  }

  // Basic filter based on search term (can be done server-side ideally)
//   const filteredPatients = patients.filter(p =>
//     p.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );


  return (
    <div>
      <h2>Patient List</h2>
      <p>Welcome, {user?.username}! You have '{user?.role}' privileges.</p>

      <div>
          <label htmlFor="searchPatients">Search Patients: </label>
          <input
            type="text"
            id="searchPatients"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Enter patient name..."
            style={{marginBottom: '15px'}}
          />
          {/* Button to explicitly trigger search if not searching on type */}
          {/* <button onClick={() => fetchPatients()}>Search</button> */}
      </div>

      {loading && <p>Loading patients...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
            {user?.role === 'frontdesk' || user?.role === 'admin' ? (
                <button onClick={() => alert('Navigate to New Patient Form!')} style={{marginBottom: '15px'}}>
                    Register New Patient
                </button>
            ) : null}
            {patients.length === 0 ? (
                <p>No patients found.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                {patients.map((patient) => (
                    <li key={patient.id} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
                    {/* Link to the detail page */}
                    <Link to={`/patients/${patient.id}`}>
                        <strong>{patient.name}</strong>
                    </Link>
                    <div>DOB: {patient.dob}</div>
                    {/* Add more summary info as needed */}
                    </li>
                ))}
                </ul>
            )}
        </>
      )}
    </div>
  );
};

export default PatientListPage;