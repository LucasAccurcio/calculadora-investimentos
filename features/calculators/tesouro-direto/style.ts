import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  helper: {
    fontSize: 12,
    color: '#687076',
  },
  primaryButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
  },
  resetButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetText: {
    color: '#0a7ea4',
  },
  error: {
    color: '#D7263D',
    fontSize: 14,
  },
  info: {
    color: '#1B998B',
    fontSize: 14,
  },
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(10, 126, 164, 0.08)',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    paddingRight: 32,
    gap: 12,
  },
  optionDescription: {
    fontSize: 14,
    color: '#687076',
  },
});
