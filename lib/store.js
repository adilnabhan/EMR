'use client'

import { supabase } from './supabase'

// ============ PATIENTS ============
export async function getPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('getPatients error:', error); return [] }
  return data
}

export async function getPatientById(id) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) { console.error('getPatientById error:', error); return null }
  return data
}

export async function addPatient(patientData) {
  const { data, error } = await supabase
    .from('patients')
    .insert([patientData])
    .select()
    .single()
  if (error) { console.error('addPatient error:', error); return null }
  return data
}

export async function deletePatient(id) {
  const { error } = await supabase.from('patients').delete().eq('id', id)
  if (error) console.error('deletePatient error:', error)
}

// ============ ROOMS ============
export async function getRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('id', { ascending: true })
  if (error) { console.error('getRooms error:', error); return [] }
  return data
}

export async function updateRoomStatus(id, status) {
  const { error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('id', id)
  if (error) console.error('updateRoomStatus error:', error)
}

// ============ BOOKINGS ============
export async function getBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, patient:patients(*), room:rooms(*)')
    .order('created_at', { ascending: false })
  if (error) { console.error('getBookings error:', error); return [] }
  return data
}

export async function getBookingById(id) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, patient:patients(*), room:rooms(*)')
    .eq('id', id)
    .single()
  if (error) { console.error('getBookingById error:', error); return null }

  // Also fetch treatments and payments
  const { data: treatments } = await supabase
    .from('treatments')
    .select('*')
    .eq('booking_id', id)
    .order('date', { ascending: false })

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', id)
    .order('created_at', { ascending: false })

  return { ...data, treatments: treatments || [], payments: payments || [] }
}

export async function createBooking(bookingData) {
  // Get room price
  const { data: room } = await supabase
    .from('rooms')
    .select('price_per_day')
    .eq('id', bookingData.room_id)
    .single()

  const total = bookingData.days * (room?.price_per_day || 0)
  const advance = bookingData.advance || 0
  const balance = total - advance

  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      patient_id: bookingData.patient_id,
      room_id: bookingData.room_id,
      days: bookingData.days,
      total,
      advance,
      balance,
      status: 'active',
    }])
    .select()
    .single()

  if (error) { console.error('createBooking error:', error); return null }

  // Mark room as occupied
  await updateRoomStatus(bookingData.room_id, 'occupied')

  // Record advance payment if any
  if (advance > 0) {
    await addPayment({ booking_id: data.id, amount: advance, type: 'advance' })
  }

  return data
}

export async function dischargeBooking(id) {
  // Get booking with treatments and payments
  const booking = await getBookingById(id)
  if (!booking) return null

  const treatmentTotal = (booking.treatments || []).reduce((s, t) => s + Number(t.cost), 0)
  const totalPaid = (booking.payments || []).reduce((s, p) => s + Number(p.amount), 0)
  const grandTotal = Number(booking.total) + treatmentTotal
  const finalBalance = grandTotal - totalPaid

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'discharged', total: grandTotal, balance: finalBalance })
    .eq('id', id)
    .select()
    .single()

  if (error) { console.error('dischargeBooking error:', error); return null }

  // Free up the room
  await updateRoomStatus(booking.room_id, 'available')

  return { ...data, treatments: booking.treatments, payments: booking.payments }
}

// ============ TREATMENTS ============
export async function getTreatments(bookingId) {
  let query = supabase.from('treatments').select('*').order('date', { ascending: false })
  if (bookingId) query = query.eq('booking_id', bookingId)
  const { data, error } = await query
  if (error) { console.error('getTreatments error:', error); return [] }
  return data
}

export async function addTreatment(treatmentData) {
  const { data, error } = await supabase
    .from('treatments')
    .insert([treatmentData])
    .select()
    .single()

  if (error) { console.error('addTreatment error:', error); return null }

  // Recalculate booking balance
  await recalculateBookingBalance(treatmentData.booking_id)

  return data
}

// ============ PAYMENTS ============
export async function getPayments(bookingId) {
  let query = supabase.from('payments').select('*').order('created_at', { ascending: false })
  if (bookingId) query = query.eq('booking_id', bookingId)
  const { data, error } = await query
  if (error) { console.error('getPayments error:', error); return [] }
  return data
}

export async function addPayment(paymentData) {
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select()
    .single()

  if (error) { console.error('addPayment error:', error); return null }

  // Recalculate booking balance
  await recalculateBookingBalance(paymentData.booking_id)

  return data
}

// Helper: recalculate a booking's balance after treatment/payment changes
async function recalculateBookingBalance(bookingId) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('total, room_id, days')
    .eq('id', bookingId)
    .single()
  if (!booking) return

  const { data: room } = await supabase
    .from('rooms')
    .select('price_per_day')
    .eq('id', booking.room_id)
    .single()

  const roomTotal = booking.days * (room?.price_per_day || 0)

  const { data: treatments } = await supabase
    .from('treatments')
    .select('cost')
    .eq('booking_id', bookingId)
  const treatmentTotal = (treatments || []).reduce((s, t) => s + Number(t.cost), 0)

  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('booking_id', bookingId)
  const totalPaid = (payments || []).reduce((s, p) => s + Number(p.amount), 0)

  const grandTotal = roomTotal + treatmentTotal
  const balance = grandTotal - totalPaid

  await supabase
    .from('bookings')
    .update({ total: grandTotal, balance })
    .eq('id', bookingId)
}

// ============ LEADS ============
export async function getLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('getLeads error:', error); return [] }
  return data
}

export async function addLead(leadData) {
  const { data, error } = await supabase
    .from('leads')
    .insert([{ ...leadData, status: 'new' }])
    .select()
    .single()
  if (error) { console.error('addLead error:', error); return null }
  return data
}

export async function updateLeadStatus(id, status) {
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
  if (error) console.error('updateLeadStatus error:', error)
}

export async function convertLeadToPatient(id) {
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()
  if (!lead) return null

  const patient = await addPatient({ name: lead.name, age: 0, aadhaar: '', blood_group: '', phone: lead.phone })
  await updateLeadStatus(id, 'converted')
  return patient
}

// ============ EMPLOYEES ============
export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('getEmployees error:', error); return [] }
  return data
}

export async function addEmployee(empData) {
  const { data, error } = await supabase
    .from('employees')
    .insert([empData])
    .select()
    .single()
  if (error) { console.error('addEmployee error:', error); return null }
  return data
}

export async function deleteEmployee(id) {
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) console.error('deleteEmployee error:', error)
}

// ============ DASHBOARD STATS ============
export async function getDashboardStats() {
  const [
    { count: totalPatients },
    { data: bookingsData },
    { data: roomsData },
    { data: paymentsData },
    { count: totalLeads },
    { count: totalEmployees },
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('status, balance'),
    supabase.from('rooms').select('status'),
    supabase.from('payments').select('amount'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('employees').select('*', { count: 'exact', head: true }),
  ])

  const activeBookings = (bookingsData || []).filter(b => b.status === 'active').length
  const availableRooms = (roomsData || []).filter(r => r.status === 'available').length
  const occupiedRooms = (roomsData || []).filter(r => r.status === 'occupied').length
  const totalRevenue = (paymentsData || []).reduce((s, p) => s + Number(p.amount), 0)
  const pendingPayments = (bookingsData || []).filter(b => b.status === 'active').reduce((s, b) => s + Number(b.balance), 0)

  return {
    totalPatients: totalPatients || 0,
    activeBookings,
    availableRooms,
    occupiedRooms,
    totalRooms: 9,
    totalRevenue,
    pendingPayments,
    totalLeads: totalLeads || 0,
    totalEmployees: totalEmployees || 0,
  }
}

// ============ PATIENT 360 LOOKUP ============
export async function getPatientFullDetails(patientIdOrPhone) {
  let patientQuery = supabase.from('patients').select('*')
  
  // Distinguish phone number from UUID string
  if (!isNaN(patientIdOrPhone) && patientIdOrPhone.toString().length >= 10) {
    patientQuery = patientQuery.eq('phone', patientIdOrPhone)
  } else {
    patientQuery = patientQuery.eq('id', patientIdOrPhone)
  }
  
  const { data: patient, error } = await patientQuery.maybeSingle()
  if (!patient || error) return null

  // Get Bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, room:rooms(*)')
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false })

  const bookingIds = bookings?.map(b => b.id) || []

  let treatments = []
  let payments = []
  if (bookingIds.length > 0) {
    const { data: tData } = await supabase
      .from('treatments')
      .select('*')
      .in('booking_id', bookingIds)
      .order('date', { ascending: false })
    treatments = tData || []

    const { data: pData } = await supabase
      .from('payments')
      .select('*')
      .in('booking_id', bookingIds)
      .order('created_at', { ascending: false })
    payments = pData || []
  }

  return { ...patient, bookings: bookings || [], treatments, payments }
}
