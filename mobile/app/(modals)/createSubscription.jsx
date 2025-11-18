import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { COLORS } from "../../constants/colors"; // Correction du chemin d'import
import { useSubscriptions } from "../../hooks/useSubscriptions";

const CreateSubscription = ({ visible }) => {
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [rating, setRating] = useState("3");
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { addSubscription } = useSubscriptions();

  const recurrenceOptions = [
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" }
  ];

  const ratingOptions = [1, 2, 3, 4, 5];

  const pickImage = async () => {
    try {
      // CORRECTION : Utilisation de la même méthode que dans insert.jsx
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "We need access to your gallery.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImage(asset.uri);

        // CORRECTION : Utilisation de ImageManipulator comme dans insert.jsx
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 1000 } }],
          {
            compress: 0.5,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );

        setImageBase64(manipulatedImage.base64);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to process image");
    }
  };

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert("Error", "Please enter a subscription label");
      return;
    }

    if (!recurrence) {
      Alert.alert("Error", "Please select a recurrence");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setIsLoading(true);

    try {
      let imageDataUrl = null;
      // CORRECTION : Utilisation de la même logique que dans insert.jsx
      if (imageBase64) {
        const uriParts = image.split(".");
        const fileType = uriParts[uriParts.length - 1];
        const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";
        imageDataUrl = `data:${imageType};base64,${imageBase64}`;
      }

      const subscriptionData = {
        label: label.trim(),
        amount: amountNum.toFixed(2),
        recurrence: recurrence,
        date: date.toISOString().split('T')[0],
        rating: parseInt(rating),
        image: imageDataUrl
      };

      console.log("Sending subscription data:", { 
        ...subscriptionData, 
        image: imageDataUrl ? "base64_data_present" : null 
      });

      const result = await addSubscription(subscriptionData);
      
      if (result.success) {
        Alert.alert("Success", "Subscription created successfully!");
        resetForm();
        router.back();
      } else {
        Alert.alert("Error", result.error || "Failed to create subscription");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      Alert.alert("Error", "Failed to create subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setLabel("");
    setRecurrence("");
    setRating("3");
    setDate(new Date());
    setImage(null);
    setImageBase64(null);
    setShowRecurrence(false);
    setShowDatePicker(false);
  };

  const handleClose = () => {
    resetForm();
    router.back();
  };

  const handleAmountChange = (text) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Header de la modal */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleClose}
              >
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>New Subscription</Text>
              
              <TouchableOpacity 
                onPress={handleSave} 
                disabled={isLoading}
                style={styles.saveButton}
              >
                <Text style={[
                  styles.saveButtonText, 
                  isLoading && styles.disabledText
                ]}>
                  {isLoading ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Card principale */}
              <View style={styles.card}>
                {/* Amount */}
                <Text style={styles.amountLabel}>Amount</Text>
                <View style={styles.amountContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={handleAmountChange}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>

                {/* Label */}
                <Text style={styles.label}>Subscription Label</Text>
                <TextInput
                  placeholder="Enter subscription name"
                  placeholderTextColor={COLORS.textLight}
                  style={styles.input}
                  value={label}
                  onChangeText={setLabel}
                />

                {/* Recurrence */}
                <Text style={styles.label}>Recurrence</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowRecurrence(!showRecurrence)}
                >
                  <Text style={{ color: recurrence ? COLORS.textPrimary : COLORS.textLight }}>
                    {recurrence ? recurrenceOptions.find(opt => opt.value === recurrence)?.label : "Select Recurrence"}
                  </Text>
                </TouchableOpacity>

                {showRecurrence && (
                  <View style={styles.optionsContainer}>
                    {recurrenceOptions.map((option, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.option}
                        onPress={() => {
                          setRecurrence(option.value);
                          setShowRecurrence(false);
                        }}
                      >
                        <Text style={styles.optionText}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Rating */}
                <Text style={styles.label}>Rating (1-5)</Text>
                <View style={styles.ratingContainer}>
                  {ratingOptions.map((star) => (
                    <TouchableOpacity
                      key={star}
                      style={[
                        styles.ratingOption,
                        rating === star.toString() && styles.ratingSelected
                      ]}
                      onPress={() => setRating(star.toString())}
                    >
                      <Text style={[
                        styles.ratingText,
                        rating === star.toString() && styles.ratingTextSelected
                      ]}>
                        {star}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Date */}
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: COLORS.text }}>
                    {`${date.getDate().toString().padStart(2, "0")} / ${
                      (date.getMonth() + 1).toString().padStart(2, "0")
                    } / ${date.getFullYear()}`}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) setDate(selectedDate);
                    }}
                  />
                )}

                {/* Subscription Image */}
                <Text style={styles.label}>Subscription Image (Optional)</Text>
                <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
                  {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={40} color={COLORS.textLight} />
                      <Text style={styles.imagePlaceholderText}>Tap to select image</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Espace en bas pour éviter que le contenu soit caché par le clavier */}
              <View style={styles.bottomSpacer} />
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  saveButton: {
    padding: 5,
  },
  saveButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    color: COLORS.textLight,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.card,
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 5
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    marginRight: 5
  },
  amountInput: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    flex: 1
  },
  input: {
    backgroundColor: COLORS.border,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: { 
    marginTop: 10, 
    marginBottom: 5, 
    color: COLORS.text, 
    fontWeight: "500",
    fontSize: 14 
  },
  dateInput: {
    backgroundColor: COLORS.border,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  imageBox: {
    height: 150,
    backgroundColor: COLORS.border,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    overflow: "hidden",
  },
  image: { 
    width: "100%", 
    height: "100%", 
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: COLORS.textLight,
  },
  optionsContainer: {
    marginBottom: 10,
  },
  option: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },
  ratingOption: {
    backgroundColor: COLORS.border,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingSelected: {
    backgroundColor: COLORS.primary,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text
  },
  ratingTextSelected: {
    color: COLORS.white
  },
  bottomSpacer: {
    height: 50,
  }
});

export default CreateSubscription;