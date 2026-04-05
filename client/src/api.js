const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('document', file);
  const res = await fetch(`${API_BASE}/upload/file`, { method: 'POST', body: formData });
  return res.json();
}

export async function uploadText(content) {
  const res = await fetch(`${API_BASE}/upload/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  return res.json();
}

export async function generateConfig({ content, chunks, gatewayType, environment, securityProfile, integrationTypes }) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, chunks, gatewayType, environment, securityProfile, integrationTypes })
  });
  return res.json();
}

export async function getTemplates() {
  const res = await fetch(`${API_BASE}/templates`);
  return res.json();
}

export async function getTemplate(id) {
  const res = await fetch(`${API_BASE}/templates/${id}`);
  return res.json();
}

export async function getTemplateConfig(id) {
  const res = await fetch(`${API_BASE}/templates/${id}/config`);
  return res.json();
}

export async function getAuditHistory(limit = 50) {
  const res = await fetch(`${API_BASE}/history/audit?limit=${limit}`);
  return res.json();
}

export async function getConfigHistory(limit = 20) {
  const res = await fetch(`${API_BASE}/history/configs?limit=${limit}`);
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
