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
  getLoanProducts: async (occupation) => {
    const url = occupation ? `${API_BASE}/loans/products?occupation=${encodeURIComponent(occupation)}` : `${API_BASE}/loans/products`;
    const res = await fetch(url);
    return res.json();
  },

  getLoanProductById: async (id) => {
    const res = await fetch(`${API_BASE}/loans/products/${encodeURIComponent(id)}`);
    return res.json();
  },

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

  // Realtime Repayment & Loan Overview
  getCustomerLoanOverview: async () => {
    const res = await fetch(`${API_BASE}/loans/customer/overview`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  processRepayment: async (repaymentData) => {
    const res = await fetch(`${API_BASE}/loans/repayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(repaymentData)
    });
    return res.json();
  },

  // Realtime Draft Sync
  saveDraft: async (draftData) => {
    const res = await fetch(`${API_BASE}/loans/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(draftData)
    });
    return res.json();
  },

  getDraft: async () => {
    const res = await fetch(`${API_BASE}/loans/draft`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  deleteDraft: async () => {
    const res = await fetch(`${API_BASE}/loans/draft`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  // Realtime Discussion & Actor Clarification Comments
  addLoanComment: async (applicationId, content, attachments = []) => {
    const res = await fetch(`${API_BASE}/loans/application/${applicationId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ content, attachments })
    });
    return res.json();
  },

  getLoanComments: async (applicationId) => {
    const res = await fetch(`${API_BASE}/loans/application/${applicationId}/comments`, {
      headers: { ...getAuthHeaders() }
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

  appraiseApplication: async (id, decision, note, actionRequiredReason, approvedAmount, expectedVersion = null) => {
    const res = await fetch(`${API_BASE}/admin/applications/${id}/appraise`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ decision, note, actionRequiredReason, approvedAmount, expectedVersion })
    });
    return res.json();
  },

  // CDC State Reconciliation
  reconcileApplication: async (id, fromVersion = 0) => {
    const res = await fetch(`${API_BASE}/loans/application/${id}/reconcile?fromVersion=${fromVersion}`, {
      headers: { ...getAuthHeaders() }
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
