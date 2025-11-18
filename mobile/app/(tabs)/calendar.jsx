import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import { COLORS } from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import { styles } from "../../assets/styles/calendar.styles";

const recurrenceLabels = {
  monthly: "Monthly",
  weekly: "Weekly",
  yearly: "Yearly",
  none: "One-time",
};

const Calendar = () => {
  const router = useRouter();
  const { user } = useAuthStore(); 
  const { subscriptions, loadData } = useSubscriptions(); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const emailPrefix = user?.email?.split("@")[0] || "user";
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${emailPrefix}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    // ✅ Charger les données dès que le composant est monté
    // useSubscriptions utilise déjà le token depuis authStore
    loadData();
  }, []);

  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(date);
    }

    return days;
  };

  const getSubscriptionsForDate = (date) => {
    if (!date) return [];

    return subscriptions.filter((sub) => {
      const subDate = new Date(sub.date);

      const isSameDate =
        subDate.getDate() === date.getDate() &&
        subDate.getMonth() === date.getMonth() &&
        subDate.getFullYear() === date.getFullYear();

      if (isSameDate) return true;

      if (sub.recurrence === "monthly") {
        return subDate.getDate() === date.getDate();
      }

      if (sub.recurrence === "weekly") {
        return subDate.getDay() === date.getDay();
      }

      if (sub.recurrence === "yearly") {
        return (
          subDate.getDate() === date.getDate() &&
          subDate.getMonth() === date.getMonth()
        );
      }

      return false;
    });
  };

  const changeMonth = (increment) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1)
    );
  };

  const days = generateDays();
  const selectedSubscriptions = getSubscriptionsForDate(selectedDate);
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.appHeader}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.headerLogo}
              resizeMode="cover" 
            />          

          <Text style={styles.appTitle}>Calendar</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthNavButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>{monthName}</Text>

          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthNavButton}>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysContainer}>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <Text key={index} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            const isSelected =
              day &&
              day.getDate() === selectedDate.getDate() &&
              day.getMonth() === selectedDate.getMonth() &&
              day.getFullYear() === selectedDate.getFullYear();

            const hasSubscriptions = day && getSubscriptionsForDate(day).length > 0;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDay,
                  !day && styles.emptyDay,
                ]}
                onPress={() => day && setSelectedDate(day)}
                disabled={!day}
              >
                {day && (
                  <>
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        hasSubscriptions && styles.hasSubscriptionsText,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                    {hasSubscriptions && <View style={styles.subscriptionDot} />}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.subscriptionsContainer}>
          <Text style={styles.sectionTitle}>
            Subscriptions for {selectedDate.toLocaleDateString()}
          </Text>

          {selectedSubscriptions.length > 0 ? (
            <FlatList
              data={selectedSubscriptions}
              renderItem={({ item }) => (
                <View style={styles.subscriptionItem}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          marginRight: 12,
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.subIconContainer}>
                        <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
                      </View>
                    )}
                    <View>
                      <Text style={styles.subscriptionLabel}>{item.label}</Text>
                      <Text style={styles.subscriptionRecurrence}>
                        {recurrenceLabels[item.recurrence] || "One-time"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.subscriptionAmount}>
                    -${parseFloat(item.amount).toFixed(2)}
                  </Text>
                </View>
              )}
              keyExtractor={(item) => item.id}
              refreshing={refreshing}
              onRefresh={onRefresh}
              contentContainerStyle={{ paddingBottom: 80 }}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.noSubscriptionsText}>
                No subscriptions for this day
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/(modals)/createSubscription")}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


export default Calendar;
