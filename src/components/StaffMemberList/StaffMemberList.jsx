import {useState, useEffect, useCallback} from 'react';
import {useSearchParams} from 'react-router-dom';
import {staffMemberApi} from '../../services/api';
import {useAuth, StaffRole} from '../../context/AuthContext';
import ErrorModal from '../common/ErrorModal/ErrorModal.jsx';
import Pagination from '../common/Pagination/Pagination.jsx';
import styles from './StaffMemberList.module.css';
import RoleBadge from "../common/RoleBadge/RoleBadge.jsx";

const StaffMemberList = () => {
  const {selectedCompany} = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [staffMembers, setStaffMembers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 9,
    totalCount: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: StaffRole.Trainer
  });

  const pageSize = 9;
  const currentPage = Math.max(0, parseInt(searchParams.get('page') || '1', 10) - 1);
  const companyId = selectedCompany?.id;

  const fetchStaffMembers = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await staffMemberApi.getAll(companyId, {
        page: currentPage,
        pageSize: pageSize
      });

      const data = response.data;

      setStaffMembers(data.items || []);
      setPagination({
        page: (data.page || 1) - 1,
        pageSize: data.pageSize || pageSize,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 1
      });
    } catch (err) {
      console.error('Fetch error:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data || err.message);
      setStaffMembers([]);
      setPagination({
        page: 0,
        pageSize: pageSize,
        totalCount: 0,
        totalPages: 1
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, currentPage, pageSize]);

  const refreshStaffMembers = async () => {
    if (!companyId) return;
    try {
      const response = await staffMemberApi.getAll(companyId, {
        page: currentPage,
        pageSize: pageSize
      });

      const data = response.data;
      setStaffMembers(data.items || []);
      setPagination({
        page: (data.page || 1) - 1,
        pageSize: data.pageSize || pageSize,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 1
      });
    } catch (err) {
      console.error('Failed to refresh:', err);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchStaffMembers();
    }
  }, [fetchStaffMembers]);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams();
    if (newPage > 0) {
      newParams.set('page', String(newPage + 1));
    }
    setSearchParams(newParams, {replace: false});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        ...(formData.password && {password: formData.password})
      };

      if (editingMember) {
        await staffMemberApi.update(companyId, editingMember.id, requestData);
      } else {
        await staffMemberApi.create(companyId, {...requestData, password: formData.password});
      }

      await refreshStaffMembers();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleDelete = async (staffMemberId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await staffMemberApi.delete(companyId, staffMemberId);
        await refreshStaffMembers();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    let roleValue = member.role;
    if (typeof roleValue === 'string') {
      roleValue = StaffRole[roleValue] ?? StaffRole.Trainer;
    }
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      password: '',
      phone: member.phone,
      role: roleValue
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: StaffRole.Trainer
    });
    setEditingMember(null);
    setShowForm(false);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarClass = (role) => {
    const roleNum = typeof role === 'string' ? StaffRole[role] : role;
    switch (roleNum) {
      case StaffRole.Manager:
        return styles.avatarManager;
      case StaffRole.ReceptionEmployee:
        return styles.avatarReception;
      case StaffRole.Trainer:
        return styles.avatarTrainer;
      default:
        return styles.avatarTrainer;
    }
  };

  if (loading && staffMembers.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading staff members...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ErrorModal
        error={error}
        onClose={() => setError(null)}
      />

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Staff Members</h3>
          {pagination.totalCount > 0 && (
            <span className={styles.staffCount}>
              {pagination.totalCount} {pagination.totalCount === 1 ? 'member' : 'members'}
            </span>
          )}
        </div>
        <button
          className={`${styles.addBtn} ${showForm ? styles.addBtnCancel : ''}`}
          onClick={() => showForm ? resetForm() : setShowForm(true)}
        >
          {showForm ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Add Staff Member
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h4 className={styles.formTitle}>
              {editingMember ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h4>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  First Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                  maxLength={40}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Last Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                  maxLength={40}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Email <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  className={styles.formInput}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Phone <span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  className={styles.formInput}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Password {!editingMember && <span className={styles.required}>*</span>}
                </label>
                <input
                  type="password"
                  className={styles.formInput}
                  placeholder={editingMember ? "Leave empty to keep current" : "Enter password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingMember}
                />
                {editingMember && (
                  <span className={styles.passwordHint}>
                    Leave empty to keep current password
                  </span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Role <span className={styles.required}>*</span>
                </label>
                <select
                  className={styles.formSelect}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: parseInt(e.target.value)})}
                >
                  <option value={StaffRole.Manager}>Manager</option>
                  <option value={StaffRole.ReceptionEmployee}>Reception Employee</option>
                  <option value={StaffRole.Trainer}>Trainer</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {editingMember ? 'Update Member' : 'Create Member'}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <>
          <div className={styles.contentArea}>
            {staffMembers.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Specializations</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                  </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                  {staffMembers.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className={styles.cellName}>
                          <div className={`${styles.avatar} ${getAvatarClass(member.role)}`}>
                            {getInitials(member.firstName, member.lastName)}
                          </div>
                          <div className={styles.nameInfo}>
                            <span className={styles.fullName}>
                              {member.firstName} {member.lastName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.cellEmail}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                               strokeWidth="2">
                            <path
                              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                          {member.email}
                        </div>
                      </td>
                      <td>
                        <div className={styles.cellPhone}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                               strokeWidth="2">
                            <path
                              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                          {member.phone}
                        </div>
                      </td>
                      <td>
                        <span className="styles.roleBadge">
                          <RoleBadge role={member.role}/>
                        </span>
                      </td>
                      <td>
                        {member.specializations?.length > 0 ? (
                          <div className={styles.specializations}>
                            {member.specializations.map((spec, idx) => (
                              <span key={idx} className={styles.specTag}>
                                {spec.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className={styles.noSpecs}>No specializations</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => handleEdit(member)}
                            title="Edit staff member"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(member.id)}
                            title="Delete staff member"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path
                                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h4 className={styles.emptyTitle}>No staff members yet</h4>
                <p className={styles.emptyMessage}>
                  Add your first staff member to start managing your team.
                </p>
                <button className={styles.emptyAction} onClick={() => setShowForm(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Add First Staff Member
                </button>
              </div>
            )}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default StaffMemberList;