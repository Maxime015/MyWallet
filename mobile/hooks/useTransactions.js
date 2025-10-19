import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "../constants/api";
import { useAuthStore } from "../store/authStore";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  const fetchTransactions = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch transactions");
      
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Alert.alert("Error", "Failed to load transactions");
    }
  }, [token]);

  const fetchSummary = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/transactions/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch summary");
      
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      Alert.alert("Error", "Failed to load summary");
    }
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      await Promise.all([fetchTransactions(), fetchSummary()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, token]);

  const addTransaction = async (transactionData) => {
    if (!token) return { success: false, error: "No authentication token" };

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create transaction");
      }

      const data = await response.json();
      
      // Recharger les données après ajout
      await loadData();
      
      Alert.alert("Success", "Transaction added successfully");
      return { success: true, data };
    } catch (error) {
      console.error("Error creating transaction:", error);
      Alert.alert("Error", error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteTransaction = async (id) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to delete transaction");

      // Recharger les données après suppression
      await loadData();
      Alert.alert("Success", "Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      Alert.alert("Error", error.message);
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
