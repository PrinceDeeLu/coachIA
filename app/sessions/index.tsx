import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, SafeAreaView, RefreshControl
} from 'react-native'
import { getSessions } from '../../services/api'
import { COLORS, SPACING } from '../../constants'

type Exercise = { exercise_name: string; sets: number; reps: number; weight_kg: number }
type Session  = { id: string; session_date: string; recovery_score: number | null; total_volume_kg: number | null; ai_modified: boolean; session_exercises: Exercise[] }

export default function SessionsScreen() {
  const [sessions, setSessions]   = useState<Session[]>([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expanded, setExpanded]   = useState<string | null>(null)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const data = await getSessions()
      setSessions(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <SafeAreaView style={s.safe}>
      <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Mes séances</Text>
        <Text style={s.headerSub}>{sessions.length} séances enregistrées</Text>
      </View>

      {sessions.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>Aucune séance pour l'instant.</Text>
          <Text style={s.emptyHint}>Génère ton premier plan depuis l'onglet Plan.</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />}
          renderItem={({ item }) => {
            const isOpen = expanded === item.id
            const date   = new Date(item.session_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
            const totalVol = item.session_exercises?.reduce((acc, e) => acc + e.sets * e.reps * e.weight_kg, 0) ?? 0

            return (
              <TouchableOpacity style={s.card} onPress={() => setExpanded(isOpen ? null : item.id)} activeOpacity={0.8}>
                <View style={s.cardHeader}>
                  <View>
                    <Text style={s.cardDate}>{date}</Text>
                    <Text style={s.cardSub}>{item.session_exercises?.length ?? 0} exercices · {Math.round(totalVol)} kg total</Text>
                  </View>
                  <View style={s.cardRight}>
                    {item.recovery_score != null && (
                      <View style={[s.recovBadge, { backgroundColor: item.recovery_score >= 70 ? COLORS.successLight : COLORS.dangerLight }]}>
                        <Text style={[s.recovText, { color: item.recovery_score >= 70 ? COLORS.success : COLORS.danger }]}>
                          {item.recovery_score}%
                        </Text>
                      </View>
                    )}
                    {item.ai_modified && (
                      <View style={s.aiBadge}>
                        <Text style={s.aiText}>IA</Text>
                      </View>
                    )}
                  </View>
                </View>

                {isOpen && item.session_exercises?.length > 0 && (
                  <View style={s.exercises}>
                    {item.session_exercises.map((ex, i) => (
                      <View key={i} style={s.exRow}>
                        <Text style={s.exName}>{ex.exercise_name}</Text>
                        <Text style={s.exDetail}>{ex.sets}x{ex.reps} · {ex.weight_kg}kg</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.background },
  header:       { padding: SPACING.lg, borderBottomWidth: 0.5, borderColor: COLORS.border },
  headerTitle:  { fontSize: 22, fontWeight: '500', color: COLORS.text },
  headerSub:    { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  list:         { padding: SPACING.lg, gap: SPACING.sm },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  emptyText:    { fontSize: 16, fontWeight: '500', color: COLORS.text },
  emptyHint:    { fontSize: 13, color: COLORS.textMuted },
  card:         { backgroundColor: COLORS.surface, borderRadius: 14, padding: SPACING.lg },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardDate:     { fontSize: 15, fontWeight: '500', color: COLORS.text, textTransform: 'capitalize' },
  cardSub:      { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
  cardRight:    { flexDirection: 'row', gap: SPACING.xs, alignItems: 'center' },
  recovBadge:   { borderRadius: 20, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  recovText:    { fontSize: 11, fontWeight: '500' },
  aiBadge:      { backgroundColor: COLORS.primaryLight, borderRadius: 20, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  aiText:       { fontSize: 11, fontWeight: '500', color: COLORS.primary },
  exercises:    { marginTop: SPACING.md, gap: SPACING.xs, borderTopWidth: 0.5, borderColor: COLORS.border, paddingTop: SPACING.md },
  exRow:        { flexDirection: 'row', justifyContent: 'space-between' },
  exName:       { fontSize: 13, color: COLORS.text },
  exDetail:     { fontSize: 13, color: COLORS.textMuted },
})
