import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatientById } from '../services/patientService'; // Placeholder service
import { useAuth } from '../hooks/useAuth';



const PatientDetailPage = () => {
  const { patientId } = useParams(); // Get patientId from URL
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return; // Should not happen with route setup, but good check
      setLoading(true);
      setError('');
      try {
        const data = await getPatientById(patientId);
        if (data) {
          setPatient(data);
        } else {
          setError('Patient not found.');
        }
      } catch (err) {
        setError('Failed to fetch patient details.');
        // console.error(err); // Removed to prevent potential information leakage
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]); // Re-fetch if patientId changes

  return (
    <div>
      <Link to="/patients">&larr; Back to Patient List</Link>
      <h2 style={{marginTop: '15px'}}>Patient Details</h2>

      {loading && <p>Loading patient information...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {patient && !loading && !error && (
        <div>
          <h3>{patient.name}</h3>
          <p><strong>ID:</strong> {patient.id}</p>
          <p><strong>Date of Birth:</strong> {patient.dob}</p>
          <p><strong>Contact:</strong> {patient.contact || 'N/A'}</p>
          <p><strong>Insurance:</strong> {patient.insurance || 'N/A'}</p>

          <hr style={{margin: '20px 0'}} />

          {/* Conditional sections based on role */}
          {user?.role === 'doctor' && (
            <div>
              <h4>Clinical Notes (Doctor View)</h4>
              {/* Placeholder for notes list/editor component */}
              <p>[Clinical notes section - requires further components]</p>
              <button>Add New Note</button>
            </div>
          )}

           {user?.role === 'admin' && (
            <div>
              <h4>Admin Actions</h4>
               <button>Edit Demographics</button>
               <button style={{marginLeft: '10px', background: 'orange'}}>View Audit Log</button>
            </div>
           )}

           {user?.role === 'frontdesk' && (
               <div>
                   <h4>Appointments</h4>
                   <p>[Appointment history/scheduling actions - requires components]</p>
                   <button>Schedule New Appointment</button>
               </div>
           )}
        </div>
      )}
       {!patient && !loading && !error && (
           <p>Could not load patient data.</p>
       )}
    </div>
  );
};

export default PatientDetailPage;