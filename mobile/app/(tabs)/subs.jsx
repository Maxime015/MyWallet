import { SignOutButton } from "@/components/SignOutButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../assets/styles/home.styles";
import NoSubscriptionsFound from "../../components/NoSubscriptionsFound";
import PageLoader from "../../components/PageLoader";
import SubscriptionItem from "../../components/SubscriptionItem";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import { useAuthStore } from "../../store/authStore";
import SubsCard from "../../components/SubsCard";
import { MotiView, MotiText, MotiImage } from "moti";

export default function Subs() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuthStore();

  const emailPrefix = user?.email?.split("@")[0] || "user";
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${emailPrefix}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const { 
    subscriptions, 
    summary, 
    isLoading, 
    loadData, 
    deleteSubscription 
  } = useSubscriptions();

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id) => {
    Alert.alert("Delete Subscription", "Are you sure you want to delete this subscription ?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteSubscription(id) },
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
          {/* LEFT */}
          <View style={styles.headerLeft}>
            <MotiImage
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              source={{ uri: avatarUrl }}
              style={styles.headerLogo}
              resizeMode="cover"
            />
            <View style={styles.welcomeContainer}>
              <MotiText
                from={{ opacity: 0, translateY: -5 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 250 }}
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
                onPress={() => router.push("/(modals)/createSubscription")}
              >
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </MotiView>
            <SignOutButton />
          </View>
        </View>

        {/* CARD */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500, type: "timing", duration: 600 }}
          style={styles.SubsCard}
        >
          <SubsCard subscriptionSummary={summary} />
        </MotiView>

        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.sectionTitle}>Recent Subscriptions</Text>
        </View>
      </MotiView>

      {/* LISTE ANIMÉE */}
      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={subscriptions}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 80, type: "timing" }}
          >
            <SubscriptionItem item={item} onDelete={handleDelete} />
          </MotiView>
        )}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 400 }}>
            <NoSubscriptionsFound />
          </MotiView>
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
