import { SignOutButton } from "@/components/SignOutButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MotiImage, MotiText, MotiView } from "moti";
import { useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../assets/styles/home.styles";
import { BalanceCard } from "../../components/BalanceCard";
import NoTransactionsFound from "../../components/NoTransactionsFound";
import PageLoader from "../../components/PageLoader";
import { TransactionItem } from "../../components/TransactionItem";
import { useTransactions } from "../../hooks/useTransactions";
import { useAuthStore } from "../../store/authStore"; 
 
export default function Page() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuthStore();
 
  const emailPrefix = user?.email?.split("@")[0] || "user";
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${emailPrefix}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const { transactions, summary, isLoading, loadData, deleteTransaction } = useTransactions();

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTransaction(id) },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  if (isLoading && !refreshing) return <PageLoader />;

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
        style={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MotiImage
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              source={{ uri: avatarUrl }}
              style={styles.headerLogo}
              resizeMode="cover"
            />
            <View style={styles.welcomeContainer}>
              <MotiText
                from={{ opacity: 0, translateY: -5 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 300 }}
                style={styles.welcomeText}
              >
                Welcome,
              </MotiText>
              <MotiText
                from={{ opacity: 0, translateY: -5 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 400 }}
                style={styles.usernameText}
              >
                {user?.username || user?.email?.split("@")[0] || "User"}
              </MotiText>
            </View>
          </View>

          {/* RIGHT */}
          <View style={styles.headerRight}>
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 8 }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.addButton}
                onPress={() => router.push("/(modals)/createTransaction")}
              >
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </MotiView>
            <SignOutButton />
          </View>
        </View>

        {/* BALANCE CARD */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500, type: "timing", duration: 600 }}
        >
          <BalanceCard summary={summary} />
        </MotiView>

        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>
      </MotiView>

      {/* TRANSACTIONS LIST */}
      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={transactions}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 80, type: "timing" }}
          >
            <TransactionItem item={item} onDelete={handleDelete} />
          </MotiView>
        )}
        ListEmptyComponent={
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 400 }}>
            <NoTransactionsFound />
          </MotiView>
        }
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}
