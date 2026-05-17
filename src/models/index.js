export const UserModel = {
  id: null,
  name: '',
  email: '',
  role: '',
  createdAt: ''
}

export const TravelPlanModel = {
  id: null,
  userId: null,
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  budget: 0,
  notes: '',
  createdAt: '',
  destinations: [],
  activities: [],
  checklistItems: []
}

export const DestinationModel = {
  id: null,
  travelPlanId: null,
  name: '',
  location: '',
  arrivalDate: '',
  departureDate: '',
  description: '',
  notes: ''
}

export const ActivityModel = {
  id: null,
  travelPlanId: null,
  name: '',
  date: '',
  time: '',
  location: '',
  description: '',
  estimatedCost: 0,
  status: 'planned'
}

export const ExpenseModel = {
  id: null,
  travelPlanId: null,
  userId: null,
  name: '',
  category: '',
  amount: 0,
  date: '',
  description: ''
}

export const ChecklistItemModel = {
  id: null,
  travelPlanId: null,
  name: '',
  isCompleted: false
}