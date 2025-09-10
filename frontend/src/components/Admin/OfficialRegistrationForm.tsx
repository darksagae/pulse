import React, { useState } from 'react';
import { auth } from '../../lib/api';
import './Admin.css';
import '../../styles/glassmorphism.css';

interface OfficialRegistrationFormProps {
  onOfficialRegistered: (official: any) => void;
  onCancel: () => void;
  selectedDepartment?: string;
}

const OfficialRegistrationForm: React.FC<OfficialRegistrationFormProps> = ({ 
  onOfficialRegistered, 
  onCancel,
  selectedDepartment = ''
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    department_id: selectedDepartment,
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const departments = [
    { id: 'nira', name: 'NIRA (National ID)' },
    { id: 'ursb', name: 'URSB (Vehicle Registration)' },
    { id: 'immigration', name: 'Immigration (Passports & Visas)' },
    { id: 'finance', name: 'Finance (Government Revenue)' },
    { id: 'health', name: 'Health' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await auth.registerOfficial(formData);
      setSuccess(`Official registered successfully! Access Code: ${response.access_code}`);
      onOfficialRegistered(response);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-modal">
        <div className="modal-header">
          <h3>Register New Official</h3>
          <button onClick={onCancel} className="glass-btn glass-btn-sm">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="official-registration-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              className="glass-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@department.gov.ug"
              className="glass-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="0701234567"
              className="glass-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="department_id">Department *</label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              className="glass-select"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              className="glass-input"
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="glass-btn glass-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="glass-btn glass-btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register Official'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfficialRegistrationForm;
