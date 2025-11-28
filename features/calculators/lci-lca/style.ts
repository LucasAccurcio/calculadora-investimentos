import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  helper: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  info: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 0,
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    borderWidth: 0,
    borderRadius: 16,
    padding: 20,
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
});
