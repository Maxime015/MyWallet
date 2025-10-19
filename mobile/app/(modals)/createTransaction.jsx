import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { styles } from "../../assets/styles/create.styles";
import { COLORS } from "../../constants/colors";
import { useTransactions } from "../../hooks/useTransactions"; // Import du hook

const CATEGORIES = [
  { id: "food", name: "Food & Drinks", icon: "fast-food" },
  { id: "shopping", name: "Shopping", icon: "cart" },
  { id: "transportation", name: "Transportation", icon: "car" },
  { id: "entertainment", name: "Entertainment", icon: "film" },
  { id: "bills", name: "Bills", icon: "receipt" },
  { id: "income", name: "Income", icon: "cash" },
  { id: "healthcare", name: "Healthcare", icon: "medical" },
  { id: "education", name: "Education", icon: "school" },
  { id: "travel", name: "Travel", icon: "airplane" },
  { id: "groceries", name: "Groceries", icon: "basket" },
  { id: "housing", name: "Housing", icon: "home" },
  { id: "utilities", name: "Utilities", icon: "build" },
  { id: "insurance", name: "Insurance", icon: "shield-checkmark" },
  { id: "personal_care", name: "Personal Care", icon: "body" },
  { id: "gifts", name: "Gifts & Donations", icon: "gift" },
  { id: "investments", name: "Investments", icon: "trending-up" },
  { id: "savings", name: "Savings", icon: "wallet" },
  { id: "clothing", name: "Clothing", icon: "shirt" },
  { id: "electronics", name: "Electronics", icon: "phone-portrait" },
  { id: "sports", name: "Sports & Fitness", icon: "fitness" },
  { id: "pets", name: "Pets", icon: "paw" },
  { id: "kids", name: "Kids & Baby", icon: "happy" },
  { id: "subscriptions", name: "Subscriptions", icon: "refresh" },
  { id: "taxes", name: "Taxes", icon: "document-text" },
  { id: "business", name: "Business", icon: "business" },
  { id: "other", name: "Other", icon: "ellipsis-horizontal" },
];

const CreateScreen = () => {
  const router = useRouter();
  const { addTransaction } = useTransactions(); // Utilisation du hook
  
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isExpense, setIsExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    // Validations
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a transaction title");
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    setIsLoading(true);
    
    try {
      const formattedAmount = isExpense
        ? -Math.abs(parseFloat(amount))
        : Math.abs(parseFloat(amount));

      // Utilisation de la fonction addTransaction du hook
      const result = await addTransaction({
        title: title,
        amount: formattedAmount,
        category: selectedCategory,
      });

      if (result.success) {
        // La navigation se fait automatiquement dans le hook après le rechargement des données
        // Le hook gère déjà l'alerte de succès
        router.back();
      } else {
        // Le hook gère déjà l'alerte d'erreur, mais on peut logger si nécessaire
        console.error("Error creating transaction:", result.error);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={true}
      onRequestClose={() => router.back()}
    >
      <View style={styles.modalContainer}>
        {/* HEADER */}
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Transaction</Text>
          <TouchableOpacity
            style={[styles.saveButtonContainer, isLoading && styles.saveButtonDisabled]}
            onPress={handleCreate}
            disabled={isLoading}
          >
            <Text style={styles.saveButton}>{isLoading ? "Saving..." : "Save"}</Text>
            {!isLoading && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.card}>
            <View style={styles.typeSelector}>
              {/* EXPENSE SELECTOR */}
              <TouchableOpacity
                style={[styles.typeButton, isExpense && styles.typeButtonActive]}
                onPress={() => setIsExpense(true)}
              >
                <Ionicons
                  name="arrow-down-circle"
                  size={22}
                  color={isExpense ? COLORS.white : COLORS.expense}
                  style={styles.typeIcon}
                />
                <Text style={[styles.typeButtonText, isExpense && styles.typeButtonTextActive]}>
                  Expense
                </Text>
              </TouchableOpacity>

              {/* INCOME SELECTOR */}
              <TouchableOpacity
                style={[styles.typeButton, !isExpense && styles.typeButtonActive]}
                onPress={() => setIsExpense(false)}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={22}
                  color={!isExpense ? COLORS.white : COLORS.income}
                  style={styles.typeIcon}
                />
                <Text style={[styles.typeButtonText, !isExpense && styles.typeButtonTextActive]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* AMOUNT CONTAINER */}
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={COLORS.textLight}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

            {/* INPUT CONTAINER */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="create-outline"
                size={22}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Transaction Title"
                placeholderTextColor={COLORS.textLight}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* CATEGORIES */}
            <Text style={styles.sectionTitle}>
              <Ionicons name="pricetag-outline" size={16} color={COLORS.text} /> Category
            </Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.name && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Ionicons
                    name={category.icon}
                    size={20}
                    color={selectedCategory === category.name ? COLORS.white : COLORS.text}
                    style={styles.categoryIcon}
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category.name && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default CreateScreen;