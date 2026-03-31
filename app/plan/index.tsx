import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, SafeAreaView, TextInput
} from 'react-native'
import { generatePlan } from '../../services/api'
import { COLORS, SPACING } from '../../constants'

type Exercise = { raw: string; sets: number | null; reps: number | null; weight_kg: number | null }
type Plan = { plan_text: string; exercises: Exercise[]; recovery_score: number; ai_modified: boolean }

export default function PlanScreen() {
  const [recovery, setRecovery] = useState(70)
  const [notes, setNotes]       = useState('')
  const [plan, setPlan]         = useState<Plan | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setPlan(null)
    try {
      const res = await generatePlan(recovery, notes || undefined)
      setPlan(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const recoveryColor = recovery >= 70 ? COLORS.success : recovery >= 40 ? '#854F0B' : COLORS.danger
  const recoveryBg    = recovery >= 70 ? COLORS.successLight : recovery >= 40 ? '#FAEEDA' : COLORS.dangerLight
  const recoveryLabel = recovery >= 70 ? 'Bonne récup' : recovery >= 40 ? 'Récup moyenne' : 'Fatigue élevée'

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.header}>
          <Text style={s.headerTitle}>Plan du jour</Text>
          <Text style={s.headerSub}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>

        {/* Score de récupération */}
        <View style={s.card}>
          <Text style={s.label}>Comment tu te sens ?</Text>
          <View style={s.sliderRow}>
            <Text style={s.sliderVal}>{recovery}</Text>
            <View style={[s.badge, { backgroundColor: recoveryBg }]}>
              <Text style={[s.badgeText, { color: recoveryColor }]}>{recoveryLabel}</Text>
            </View>
          </View>
          <View style={s.sliderBtns}>
            {[20, 40, 60, 70, 85, 100].map(v => (
              <TouchableOpacity
                key={v}
                style={[s.sliderBtn, recovery === v && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                onPress={() => setRecovery(v)}
              >
                <Text style={[s.sliderBtnText, recovery === v && { color: '#fff' }]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={s.card}>
          <Text style={s.label}>Douleurs ou infos pour le coach ?</Text>
          <TextInput
            style={s.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ex: légère douleur au genou gauche..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
        </View>

        {/* Bouton */}
        <TouchableOpacity style={s.btn} onPress={handleGenerate} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Générer ma séance</Text>
          }
        </TouchableOpacity>

        {error ? <Text style={s.error}>{error}</Text> : null}

        {/* Résultat */}
        {plan && (
          <View style={s.planBlock}>
            {plan.ai_modified && (
              <View style={s.modifiedBadge}>
                <Text style={s.modifiedText}>Séance adaptée par le coach IA</Text>
              </View>
            )}

            {plan.exercises.length > 0 && (
              <View style={s.exerciseList}>
                {plan.exercises.map((ex, i) => (
                  <View key={i} style={s.exerciseRow}>
                    <Text style={s.exerciseName}>{ex.raw}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={s.planText}>{plan.plan_text}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: COLORS.background },
  scroll:         { padding: SPACING.lg, gap: SPACING.md },
  header:         { marginBottom: SPACING.sm },
  headerTitle:    { fontSize: 22, fontWeight: '500', color: COLORS.text },
  headerSub:      { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textTransform: 'capitalize' },
  card:           { backgroundColor: COLORS.surface, borderRadius: 14, padding: SPACING.lg, gap: SPACING.sm },
  label:          { fontSize: 14, fontWeight: '500', color: COLORS.text },
  sliderRow:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  sliderVal:      { fontSize: 28, fontWeight: '500', color: COLORS.text },
  badge:          { borderRadius: 20, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  badgeText:      { fontSize: 12, fontWeight: '500' },
  sliderBtns:     { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  sliderBtn:      { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  sliderBtnText:  { fontSize: 13, color: COLORS.text },
  notesInput:     { backgroundColor: COLORS.background, borderRadius: 10, padding: SPACING.md, fontSize: 14, color: COLORS.text, minHeight: 80, borderWidth: 0.5, borderColor: COLORS.border },
  btn:            { backgroundColor: COLORS.primary, borderRadius: 14, padding: SPACING.lg, alignItems: 'center' },
  btnText:        { color: '#fff', fontWeight: '500', fontSize: 16 },
  error:          { color: COLORS.danger, fontSize: 13, textAlign: 'center' },
  planBlock:      { backgroundColor: COLORS.surface, borderRadius: 14, padding: SPACING.lg, gap: SPACING.md },
  modifiedBadge:  { backgroundColor: COLORS.primaryLight, borderRadius: 8, padding: SPACING.sm },
  modifiedText:   { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  exerciseList:   { gap: SPACING.xs },
  exerciseRow:    { backgroundColor: COLORS.background, borderRadius: 8, padding: SPACING.md, borderWidth: 0.5, borderColor: COLORS.border },
  exerciseName:   { fontSize: 13, color: COLORS.text },
  planText:       { fontSize: 14, color: COLORS.text, lineHeight: 22 },
})
