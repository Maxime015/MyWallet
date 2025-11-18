import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { styles } from "../assets/styles/subsItem.styles";
import { formatDate } from "../lib/utils";

const recurrenceLabels = {
  monthly: "Mensuel",
  yearly: "Annuel",
  weekly: "Hebdomadaire",
};

const SubscriptionItem = ({ item, onDelete }) => {
  // Fonction pour afficher les étoiles de rating
  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= item.rating ? "star" : "star-outline"}
          size={18}
          color={i <= item.rating ? COLORS.rating : COLORS.textLight}
          style={styles.starIcon}
        />
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <View style={styles.subscriptionCard} key={item.id}>
      <TouchableOpacity style={styles.subscriptionContent}>
        {/* Icône ou image */}
        <View style={styles.subscriptionIconContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.subscriptionImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons 
              name="pricetag-outline" 
              size={28}
              color={COLORS.primary} 
            />
          )}
        </View>

        <View style={styles.subscriptionLeft}>
          <Text style={styles.subscriptionTitle}>{item.label}</Text>
          <View style={styles.subscriptionMeta}>
            <Text style={styles.subscriptionRecurrence}>
              {recurrenceLabels[item.recurrence] || "Inconnu"}
            </Text>
          </View>
          {renderRatingStars()}
        </View>

        

        <View style={styles.subscriptionRight}>
          <Text style={styles.subscriptionAmount}>
            -${parseFloat(item.amount).toFixed(2)}
          </Text>
          <Text style={styles.subscriptionDate}>{formatDate(item.date)}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.subscriptionDeleteButton}
        onPress={() => onDelete(item.id)}
      >
        <Ionicons 
          name="trash-outline" 
          size={25} 
          color={COLORS.expense} 
        />
      </TouchableOpacity>
    </View>
  );
};

export default SubscriptionItem;