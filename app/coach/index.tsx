import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Image,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native'
import { sendChatMessage } from '../../services/api'
import { COLORS, SPACING } from '../../constants'

type Message = { role: 'user' | 'assistant'; content: string }

// Avatar du coach (emoji sportif en attendant une vraie image)
const COACH_AVATAR = '💪'

export default function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour ! Comment tu te sens aujourd\'hui ? Dis-moi si tu as des douleurs ou une fatigue particulière.' }
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const listRef                 = useRef<FlatList>(null)

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await sendChatMessage(updated)
      setMessages(prev => [...prev, { role: 'assistant', content: res.content }])
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Erreur : ${(e.message)}` }])
    } finally {
      setLoading(false)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }

  // Gestion de la touche Entrée (Shift+Enter pour nouvelle ligne)
  function handleKeyPress(e: any) {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={s.header}>
          <Text style={s.headerTitle}>Coach IA</Text>
          <Text style={s.headerSub}>Repforge</Text>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={[s.bubble, item.role === 'user' ? s.bubbleUser : s.bubbleAI]}>
              {item.role === 'assistant' && (
                <View style={s.avatarContainer}>
                  <Text style={s.avatar}>{COACH_AVATAR}</Text>
                </View>
              )}
              <View style={item.role === 'user' ? s.bubbleContentUser : s.bubbleContentAI}>
                <Text style={[s.bubbleText, item.role === 'user' ? s.bubbleTextUser : s.bubbleTextAI]}>
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          ListFooterComponent={loading ? (
            <View style={s.typingRow}>
              <View style={s.avatarContainer}>
                <Text style={s.avatar}>{COACH_AVATAR}</Text>
              </View>
              <View style={s.typingBubble}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={s.typing}>Le coach réfléchit...</Text>
              </View>
            </View>
          ) : null}
        />

        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Pose une question au coach..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            onKeyPress={handleKeyPress}
          />
          <TouchableOpacity 
            style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]} 
            onPress={send}
            disabled={!input.trim() || loading}
          >
            <Text style={s.sendBtnText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:                { flex: 1, backgroundColor: COLORS.background },
  container:           { flex: 1 },
  header:              { padding: SPACING.lg, borderBottomWidth: 0.5, borderColor: COLORS.border },
  headerTitle:         { fontSize: 18, fontWeight: '500', color: COLORS.text },
  headerSub:           { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  list:                { padding: SPACING.lg, gap: SPACING.sm },
  bubble:              { maxWidth: '80%', borderRadius: 14, padding: SPACING.md, flexDirection: 'row', alignItems: 'flex-start' },
  bubbleUser:          { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  bubbleAI:            { backgroundColor: COLORS.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  avatarContainer:     { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  avatar:              { fontSize: 18 },
  bubbleContentUser:   { flex: 1 },
  bubbleContentAI:     { flex: 1 },
  bubbleText:          { fontSize: 15, lineHeight: 20 },
  bubbleTextUser:      { color: '#fff' },
  bubbleTextAI:        { color: COLORS.text },
  typingRow:           { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md },
  typingBubble:        { backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  typing:              { fontSize: 13, color: COLORS.textMuted },
  inputRow:            { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, borderTopWidth: 0.5, borderColor: COLORS.border },
  input:               { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, fontSize: 14, color: COLORS.text, maxHeight: 100 },
  sendBtn:             { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: SPACING.lg, justifyContent: 'center' },
  sendBtnDisabled:     { opacity: 0.4 },
  sendBtnText:         { color: '#fff', fontWeight: '500', fontSize: 14 },
})