const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Auth API (UC1)
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(profileData)
    });
    return res.json();
  },

  // Customer Loan APIs (UC2 & UC3)
  simulateLoan: async (amount, termMonths, annualInterestRate) => {
    const res = await fetch(`${API_BASE}/loans/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, termMonths, annualInterestRate })
    });
    return res.json();
  },

  ocrExtract: async (file, docType) => {
    const formData = new FormData();
    if (file) formData.append('document', file);
    formData.append('docType', docType || 'cccd');

    const res = await fetch(`${API_BASE}/loans/ocr-extract`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: formData
    });
    return res.json();
  },

  submitLoanApplication: async (applicationData) => {
    const res = await fetch(`${API_BASE}/loans/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(applicationData)
    });
    return res.json();
  },

  getMyApplications: async () => {
    const res = await fetch(`${API_BASE}/loans/my-applications`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  getApplicationDetail: async (id) => {
    const res = await fetch(`${API_BASE}/loans/application/${id}`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  resubmitDocuments: async (id, updatedDocuments) => {
    const res = await fetch(`${API_BASE}/loans/application/${id}/resubmit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ updatedDocuments })
    });
    return res.json();
  },

  // Notifications (UC5.1)
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/loans/notifications`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE}/loans/notifications/${id}/read`, {
      method: 'PUT',
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  // Admin & Credit Officer APIs (UC4)
  getAdminApplications: async (riskGrade = 'ALL', status = 'ALL', search = '') => {
    const query = new URLSearchParams({ riskGrade, status, search }).toString();
    const res = await fetch(`${API_BASE}/admin/applications?${query}`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  appraiseApplication: async (id, decision, note, actionRequiredReason, approvedAmount) => {
    const res = await fetch(`${API_BASE}/admin/applications/${id}/appraise`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ decision, note, actionRequiredReason, approvedAmount })
    });
    return res.json();
  },

  getScoringRules: async () => {
    const res = await fetch(`${API_BASE}/admin/scoring-rules`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  updateScoringRules: async (ruleConfig) => {
    const res = await fetch(`${API_BASE}/admin/scoring-rules`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(ruleConfig)
    });
    return res.json();
  },

  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  }
};
