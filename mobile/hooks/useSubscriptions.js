import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "../constants/api";
import { useAuthStore } from "../store/authStore";

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  const fetchSubscriptions = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/subscriptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch subscriptions");
      }
      
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      Alert.alert("Error", error.message || "Failed to load subscriptions");
    }
  }, [token]);

  const fetchSummary = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/subscriptions/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch subscriptions summary");
      }
      
      const data = await response.json();
      setSummary({
        total: data.total || 0,
        count: data.count || 0,
      });
    } catch (error) {
      console.error("Error fetching subscriptions summary:", error);
      Alert.alert("Error", error.message || "Failed to load subscriptions summary");
    }
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      await Promise.all([fetchSubscriptions(), fetchSummary()]);
    } catch (error) {
      console.error("Error loading subscriptions data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubscriptions, fetchSummary, token]);

  const addSubscription = async (subscriptionData) => {
    if (!token) return { success: false, error: "No authentication token" };

    try {
      const response = await fetch(`${API_URL}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create subscription");
      }

      const data = await response.json();
      
      // Recharger les données après ajout
      await loadData();
      
      return { success: true, data: data.subscription };
    } catch (error) {
      console.error("Error creating subscription:", error);
      Alert.alert("Error", error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteSubscription = async (id) => {
    if (!token) {
      Alert.alert("Error", "Authentication required");
      return { success: false, error: "No authentication token" };
    }

    try {
      const response = await fetch(`${API_URL}/subscriptions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete subscription");
      }

      const result = await response.json();
      
      // Recharger les données après suppression
      await loadData();
      
      Alert.alert("Success", result.message || "Subscription deleted successfully");
      return { success: true, data: result };
    } catch (error) {
      console.error("Error deleting subscription:", error);
      Alert.alert("Error", error.message);
      return { success: false, error: error.message };
    }
  };

  return { 
    subscriptions, 
    summary, 
    isLoading, 
    loadData, 
    addSubscription,
    deleteSubscription 
  };
};