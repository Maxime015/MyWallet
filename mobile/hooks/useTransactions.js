import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer le token depuis le store d'authentification ou AsyncStorage
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  // useCallback is used for performance reasons, it will memoize the function
  const fetchTransactions = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/transactions`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed");
        }
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/transactions/summary`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed");
        }
        throw new Error("Failed to fetch summary");
      }

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      throw error;
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Run in parallel
      await Promise.all([fetchTransactions(), fetchSummary()]);
    } catch (error) {
      console.error("Error loading data:", error);
      // Vous pourriez vouloir gérer les erreurs d'authentification ici
      if (error.message === "Authentication failed") {
        Alert.alert("Session Expired", "Please log in again");
        // Optionnel: déconnecter l'utilisateur
        // useAuthStore.getState().logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary]);

  const addTransaction = async (transactionData) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed");
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || "All fields are required");
        }
        throw new Error("Failed to create transaction");
      }

      const data = await response.json();
      
      // Refresh data after adding
      await loadData();
      
      Alert.alert("Success", "Transaction added successfully");
      return { success: true, transaction: data };
    } catch (error) {
      console.error("Error adding transaction:", error);
      Alert.alert("Error", error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed");
        }
        if (response.status === 404) {
          throw new Error("Transaction not found");
        }
        throw new Error("Failed to delete transaction");
      }

      // Refresh data after deletion
      await loadData();
      Alert.alert("Success", "Transaction deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("Error deleting transaction:", error);
      Alert.alert("Error", error.message);
      return { success: false, error: error.message };
    }
  };

  return { 
    transactions, 
    summary, 
    isLoading, 
    loadData, 
    addTransaction,
    deleteTransaction 
  };
};