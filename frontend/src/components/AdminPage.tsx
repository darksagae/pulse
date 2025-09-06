import React, { useState } from 'react';
import ugFlag from '../assets/images/ug.png';
import adminImg from '../assets/images/admin.png';
import './PageStyles.css';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for admin dashboard
  const systemStats = {
    totalUsers: 1247,
    activeSessions: 89,
    documentsProcessed: 3456,
    systemUptime: '99.9%',
    pendingApprovals: 23,
    completedToday: 156
  };

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Submitted National ID Application', time: '2 minutes ago', type: 'document' },
    { id: 2, user: 'Jane Smith', action: 'Completed Vehicle Registration', time: '5 minutes ago', type: 'completion' },
    { id: 3, user: 'Mike Johnson', action: 'Login from new device', time: '10 minutes ago', type: 'security' },
    { id: 4, user: 'Sarah Wilson', action: 'Updated profile information', time: '15 minutes ago', type: 'profile' },
    { id: 5, user: 'David Brown', action: 'Submitted Passport Application', time: '20 minutes ago', type: 'document' }
  ];

  const departmentStats = [
    { name: 'NIRA', documents: 1245, completed: 1180, pending: 65, efficiency: 94.8 },
    { name: 'URSB', documents: 892, completed: 834, pending: 58, efficiency: 93.5 },
    { name: 'Immigration', documents: 567, completed: 523, pending: 44, efficiency: 92.2 },
    { name: 'Finance', documents: 445, completed: 401, pending: 44, efficiency: 90.1 },
    { name: 'Health', documents: 234, completed: 198, pending: 36, efficiency: 84.6 }
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'High server load detected', time: '5 minutes ago' },
    { id: 2, type: 'info', message: 'Scheduled maintenance completed', time: '1 hour ago' },
    { id: 3, type: 'success', message: 'Backup completed successfully', time: '2 hours ago' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'completion': return '✅';
      case 'security': return '🔒';
      case 'profile': return '👤';
      default: return '📋';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="page-container" style={{ backgroundImage: `url(${ugFlag})` }}>
      <div className="page-content">
        <div className="page-header">
          <img src={adminImg} alt="Admin" className="page-icon" />
          <h1 className="page-title">Admin Portal</h1>
          <p className="page-subtitle">System Administration & Management Dashboard</p>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button 
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            System Settings
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard">
            {/* System Overview Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-number">{systemStats.totalUsers.toLocaleString()}</div>
                <div className="stat-change positive">+12% this month</div>
              </div>
              <div className="stat-card">
                <h3>Active Sessions</h3>
                <div className="stat-number">{systemStats.activeSessions}</div>
                <div className="stat-change neutral">Live now</div>
              </div>
              <div className="stat-card">
                <h3>Documents Processed</h3>
                <div className="stat-number">{systemStats.documentsProcessed.toLocaleString()}</div>
                <div className="stat-change positive">+8% this week</div>
              </div>
              <div className="stat-card">
                <h3>System Uptime</h3>
                <div className="stat-number">{systemStats.systemUptime}</div>
                <div className="stat-change positive">Excellent</div>
              </div>
              <div className="stat-card">
                <h3>Pending Approvals</h3>
                <div className="stat-number">{systemStats.pendingApprovals}</div>
                <div className="stat-change warning">Needs attention</div>
              </div>
              <div className="stat-card">
                <h3>Completed Today</h3>
                <div className="stat-number">{systemStats.completedToday}</div>
                <div className="stat-change positive">+15% vs yesterday</div>
              </div>
            </div>

            {/* Department Performance */}
            <div className="department-performance">
              <h3>Department Performance</h3>
              <div className="performance-grid">
                {departmentStats.map((dept, index) => (
                  <div key={index} className="performance-card">
                    <div className="dept-header">
                      <h4>{dept.name}</h4>
                      <span className="efficiency-badge">{dept.efficiency}%</span>
                    </div>
                    <div className="dept-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total Documents</span>
                        <span className="stat-value">{dept.documents}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value success">{dept.completed}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Pending</span>
                        <span className="stat-value warning">{dept.pending}</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${dept.efficiency}%`,
                          backgroundColor: dept.efficiency > 90 ? '#10b981' : dept.efficiency > 80 ? '#f59e0b' : '#ef4444'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity & Alerts */}
            <div className="admin-activity-grid">
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                      <div className="activity-content">
                        <h4>{activity.user}</h4>
                        <p>{activity.action}</p>
                        <small>{activity.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="system-alerts">
                <h3>System Alerts</h3>
                <div className="alerts-list">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="alert-item">
                      <div 
                        className="alert-indicator" 
                        style={{ backgroundColor: getAlertColor(alert.type) }}
                      ></div>
                      <div className="alert-content">
                        <p>{alert.message}</p>
                        <small>{alert.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="admin-users">
            <div className="users-header">
              <h3>User Management</h3>
              <div className="user-actions">
                <button className="action-btn primary">Add User</button>
                <button className="action-btn secondary">Export Users</button>
              </div>
            </div>
            
            <div className="users-filters">
              <select className="filter-select">
                <option>All Roles</option>
                <option>Citizens</option>
                <option>Officials</option>
                <option>Admins</option>
              </select>
              <select className="filter-select">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
              <input type="text" placeholder="Search users..." className="search-input" />
            </div>

            <div className="users-table">
              <div className="table-header">
                <div>User</div>
                <div>Role</div>
                <div>Department</div>
                <div>Status</div>
                <div>Last Active</div>
                <div>Actions</div>
              </div>
              <div className="table-row">
                <div className="user-info">
                  <div className="user-avatar">JD</div>
                  <div>
                    <div className="user-name">John Doe</div>
                    <div className="user-email">john.doe@email.com</div>
                  </div>
                </div>
                <div>Citizen</div>
                <div>-</div>
                <div><span className="status-badge active">Active</span></div>
                <div>2 minutes ago</div>
                <div className="user-actions">
                  <button className="action-btn-small primary">Edit</button>
                  <button className="action-btn-small secondary">View</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="admin-departments">
            <h3>Department Management</h3>
            <div className="departments-admin-grid">
              {departmentStats.map((dept, index) => (
                <div key={index} className="dept-admin-card">
                  <div className="dept-admin-header">
                    <h4>{dept.name}</h4>
                    <span className="dept-status active">Active</span>
                  </div>
                  <div className="dept-metrics">
                    <div className="metric">
                      <span className="metric-label">Efficiency</span>
                      <span className="metric-value">{dept.efficiency}%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Pending</span>
                      <span className="metric-value">{dept.pending}</span>
                    </div>
                  </div>
                  <div className="dept-actions">
                    <button className="action-btn-small primary">Manage</button>
                    <button className="action-btn-small secondary">Reports</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="admin-analytics">
            <h3>System Analytics</h3>
            <div className="analytics-grid">
              <div className="chart-container">
                <h4>Document Processing Trends</h4>
                <div className="chart-placeholder">
                  📊 Chart visualization would go here
                </div>
              </div>
              <div className="chart-container">
                <h4>User Activity</h4>
                <div className="chart-placeholder">
                  📈 Activity chart would go here
                </div>
              </div>
              <div className="chart-container">
                <h4>Department Performance</h4>
                <div className="chart-placeholder">
                  📉 Performance chart would go here
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="admin-settings">
            <h3>System Settings</h3>
            <div className="settings-sections">
              <div className="setting-section">
                <h4>General Settings</h4>
                <div className="setting-item">
                  <label>System Name</label>
                  <input type="text" defaultValue="PublicPulse" />
                </div>
                <div className="setting-item">
                  <label>Maintenance Mode</label>
                  <input type="checkbox" />
                </div>
              </div>
              <div className="setting-section">
                <h4>Document Settings</h4>
                <div className="setting-item">
                  <label>Max File Size (MB)</label>
                  <input type="number" defaultValue="10" />
                </div>
                <div className="setting-item">
                  <label>Auto-approve Threshold</label>
                  <input type="number" defaultValue="90" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="admin-security">
            <h3>Security Dashboard</h3>
            <div className="security-grid">
              <div className="security-card">
                <h4>Login Attempts</h4>
                <div className="security-metric">23 failed attempts today</div>
              </div>
              <div className="security-card">
                <h4>Active Sessions</h4>
                <div className="security-metric">{systemStats.activeSessions} active</div>
              </div>
              <div className="security-card">
                <h4>Security Score</h4>
                <div className="security-metric">95/100</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;