import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const styles = StyleSheet.create({
  subscriptionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subscriptionContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  subscriptionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: 'rgba(118, 118, 128, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subscriptionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  subscriptionLeft: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 1,
  },
  subscriptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscriptionRecurrence: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
    marginBottom: 2,
  },
  subscriptionRight: {
    alignItems: 'flex-end',
  },
  subscriptionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: COLORS.expense,
  },
  subscriptionDate: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  subscriptionDeleteButton: {
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(118, 118, 128, 0.12)',
  },
  // Nouveaux styles pour le rating
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
});