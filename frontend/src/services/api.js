const API_BASE_URL = 'http://localhost:8000/api/queues'

export async function createQueue({ name, category, avgServiceTimeSeconds = 300 }) {
  const res = await fetch(`${API_BASE_URL}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      category,
      avg_service_time_seconds: parseInt(avgServiceTimeSeconds, 10),
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to create queue')
  }
  return res.json()
}

export async function getQueueDetails(queueId) {
  const res = await fetch(`${API_BASE_URL}/${queueId}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Queue not found')
  }
  return res.json()
}

export async function joinQueue(queueId, customerName, customerPhone = '') {
  const res = await fetch(`${API_BASE_URL}/${queueId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: customerName,
      customer_phone: customerPhone,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to join queue')
  }
  return res.json()
}

export async function getTicketStatus(queueId, ticketId) {
  const res = await fetch(`${API_BASE_URL}/${queueId}/status/${ticketId}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Ticket not found')
  }
  return res.json()
}

export async function callNextCustomer(queueId) {
  const res = await fetch(`${API_BASE_URL}/${queueId}/next`, {
    method: 'POST',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to call next customer')
  }
  return res.json()
}

export async function verifyCustomerOtp(queueId, ticketId, otp) {
  const res = await fetch(`${API_BASE_URL}/${queueId}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticket_id: ticketId,
      otp: otp.trim(),
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'OTP verification failed')
  }
  return res.json()
}

export async function completeCustomerService(queueId, ticketId) {
  const res = await fetch(`${API_BASE_URL}/${queueId}/complete/${ticketId}`, {
    method: 'POST',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to complete service')
  }
  return res.json()
}

export async function skipCustomer(queueId, ticketId) {
  const res = await fetch(`${API_BASE_URL}/${queueId}/skip/${ticketId}`, {
    method: 'POST',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to skip customer')
  }
  return res.json()
}

export async function getAdminDashboardData(queueId) {
  const res = await fetch(`${API_BASE_URL}/${queueId}/admin-dashboard`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to fetch admin dashboard')
  }
  return res.json()
}
