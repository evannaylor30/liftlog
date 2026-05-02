export type WeightUnit = 'kg' | 'lb'

export type WorkoutSummary = {
  totalWorkouts: number
  totalSets: number
  totalVolume: number
}

export type WorkoutSessionItem = {
  id: string
  startedAt: string
  name: string | null
  notes: string | null
  workoutExercises: WorkoutExerciseItem[]
}

export type WorkoutExerciseItem = {
  id: string
  sortOrder: number
  exercise: {
    id: string
    name: string
  }
  sets: SetEntryItem[]
}

export type SetEntryItem = {
  id: string
  setNumber: number
  reps: number
  weightLb: number
}

export type BodyweightLogItem = {
  id: string
  date: string
  weightLb: number
}

export type StepsLogItem = {
  id: string
  date: string
  steps: number
}

export type DashboardMetrics = {
  totals: {
    totalWorkouts: number
    totalSets: number
    totalVolumeLb: number
  }
  weightTrend: {
    latest7DayAvg: number | null
    points: Array<{
      date: string
      avgWeightLb: number
    }>
  }
  stepsTrend: {
    latest7DayAvg: number | null
    points: Array<{
      date: string
      avgSteps: number
    }>
  }
}
