import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { MotiText, MotiView } from "moti";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";

export const BalanceCard = ({ summary }) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 15, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "timing", duration: 600 }}
      style={styles.container}
    >
      <BlurView intensity={40} tint="light" style={styles.blurContainer}>
        {/* Title */}
        <View style={styles.header}>
          <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
          <MotiText
            from={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 150 }}
            style={styles.title}
          >
            Total Balance
          </MotiText>
        </View>

        {/* Amount */}
        <MotiText
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 250 }}
          style={styles.amount}
        >
          ${parseFloat(summary.balance || 0).toFixed(2)}
        </MotiText>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {/* Income */}
          <View style={styles.stat}>
            <View style={styles.statHeader}>
              <Ionicons name="arrow-up-circle-outline" size={20} color={COLORS.income} />
              <Text style={styles.statLabel}>Income</Text>
            </View>
            <Text style={[styles.statValue, { color: COLORS.income }]}>
              +${parseFloat(summary.income || 0).toFixed(2)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Expenses */}
          <View style={styles.stat}>
            <View style={styles.statHeader}>
              <Ionicons name="arrow-down-circle-outline" size={20} color={COLORS.expense} />
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
            <Text style={[styles.statValue, { color: COLORS.expense }]}>
              -${Math.abs(parseFloat(summary.expenses || 0)).toFixed(2)}
            </Text>
          </View>
        </View>
      </BlurView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  blurContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // effet glass transparent
    borderRadius: 25,
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  amount: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 4,
  },
  divider: {
    width: 1,
    height: "70%",
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
});
