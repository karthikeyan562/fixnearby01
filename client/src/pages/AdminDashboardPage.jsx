import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { VerificationBadge } from '../components/VerificationBadge';
import { ShieldCheck, Users, AlertOctagon, CheckCircle, XCircle, FileText, BarChart2 } from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications', 'users', 'reports'
  const [loading, setLoading] = useState(true);

  const loadAdminData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminStats(),
      api.getPendingProviders(),
      api.getAdminUsers(),
      api.getAdminReports(),
    ])
      .then(([statsRes, pendingRes, usersRes, reportsRes]) => {
        setStats(statsRes.data);
        setPendingProviders(pendingRes.data || []);
        setUsers(usersRes.data || []);
        setReports(reportsRes.data || []);
      })
      .catch((err) => console.warn('Admin fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyProvider = async (providerProfileId, status) => {
    try {
      const res = await api.verifyProvider(providerProfileId, status);
      if (res.success) {
        alert(`Provider verification ${status} successfully!`);
        loadAdminData();
      }
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change account status to ${newStatus}?`)) return;

    try {
      const res = await api.updateUserStatus(userId, newStatus);
      if (res.success) {
        loadAdminData();
      }
    } catch (err) {
      alert(`User status change error: ${err.message}`);
    }
  };

  const handleUpdateReport = async (reportId, status) => {
    try {
      const res = await api.updateReportStatus(reportId, status);
      if (res.success) {
        loadAdminData();
      }
    } catch (err) {
      alert(`Report update error: ${err.message}`);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#ffffff', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <ShieldCheck size={24} color="#a5b4fc" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Administrator Control Portal</h1>
          </div>
          <p style={{ color: '#c7d2fe', fontSize: '0.95rem' }}>
            Platform moderation, provider identity verification, user account management & analytics
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading administrative dashboard data...</div>
      ) : (
        <>
          {/* Stats Bar */}
          {stats && (
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Registered Users</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.2rem' }}>{stats.totalUsers}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats.totalCustomers} Customers • {stats.totalProviders} Providers</div>
              </div>

              <div className="card" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending Verifications</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#b45309', marginTop: '0.2rem' }}>{stats.pendingVerifications}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{stats.verifiedProviders} Verified Providers</div>
              </div>

              <div className="card" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Service Requests & Bookings</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7', marginTop: '0.2rem' }}>{stats.totalRequests}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats.completedBookings} Completed Bookings</div>
              </div>

              <div className="card" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Platform Service Value</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)', marginTop: '0.2rem' }}>₹{stats.revenueSum}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{stats.pendingReports} Active Reports</div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--surface-border)', pb: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('verifications')}
              className={`btn ${activeTab === 'verifications' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Pending Verifications ({pendingProviders.length})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            >
              User Accounts Management ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Reports & Moderation ({reports.length})
            </button>
          </div>

          {/* Tab 1: Pending Verifications */}
          {activeTab === 'verifications' && (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--secondary)' }}>
                Provider Identity Verification Queue
              </h3>

              {pendingProviders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  ✓ No provider verifications pending review right now!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingProviders.map((p) => (
                    <div key={p._id} style={{ border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{p.businessName}</div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          Applicant: {p.userId?.name} ({p.userId?.email}) • Phone: {p.userId?.phone}
                        </div>
                        <div style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
                          Categories: {p.serviceCategories?.join(', ')} | Exp: {p.experienceYears} yrs
                        </div>

                        {p.verificationDocs?.length > 0 && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
                            <strong>Uploaded Doc:</strong>{' '}
                            <a href={`http://localhost:5000${p.verificationDocs[0].docUrl}`} target="_blank" rel="noreferrer" style={{ fontWeight: '700' }}>
                              View Document File ({p.verificationDocs[0].docType})
                            </a>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleVerifyProvider(p._id, 'verified')}
                          className="btn btn-success btn-sm"
                        >
                          <CheckCircle size={15} /> Approve Verification
                        </button>

                        <button
                          onClick={() => handleVerifyProvider(p._id, 'rejected')}
                          className="btn btn-danger btn-sm"
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: User Accounts */}
          {activeTab === 'users' && (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--secondary)' }}>
                Registered User Accounts
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--surface-border)' }}>
                      <th style={{ padding: '0.75rem' }}>Name</th>
                      <th style={{ padding: '0.75rem' }}>Email</th>
                      <th style={{ padding: '0.75rem' }}>Role</th>
                      <th style={{ padding: '0.75rem' }}>City</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '600' }}>{u.name}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className="badge" style={{ background: u.role === 'admin' ? '#e0e7ff' : '#f1f5f9' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{u.location?.city || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge badge-${u.accountStatus === 'active' ? 'completed' : 'cancelled'}`}>
                            {u.accountStatus}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUserStatus(u._id, u.accountStatus)}
                              className={`btn ${u.accountStatus === 'active' ? 'btn-danger' : 'btn-success'} btn-sm`}
                            >
                              {u.accountStatus === 'active' ? 'Suspend Account' : 'Activate Account'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Reports */}
          {activeTab === 'reports' && (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--secondary)' }}>
                User Moderation Reports
              </h3>

              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No user complaints or listing reports submitted.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reports.map((r) => (
                    <div key={r._id} style={{ border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: '700' }}>Reason: {r.reason}</span>
                        <span className="badge badge-pending">{r.status}</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{r.description}</p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                        <span>Reporter: {r.reporterId?.name || 'User'}</span>
                        <span>Date: {new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>

                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <button onClick={() => handleUpdateReport(r._id, 'resolved')} className="btn btn-success btn-sm">
                            Mark Resolved
                          </button>
                          <button onClick={() => handleUpdateReport(r._id, 'dismissed')} className="btn btn-secondary btn-sm">
                            Dismiss Report
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
