import { COLORS } from "@/constants/colors.js";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import Swiper from "react-native-swiper";
import SafeScreen from "../../components/SafeScreen";

const slides = [
  {
    title: "Track Your Daily Transactions",
    message: "Easily record your income and expenses with intuitive categorization.",
    image: require("../../assets/images/a.png"),
  },
  {
    title: "Manage Your Subscriptions",
    message: "Keep track of recurring payments and never miss a bill again.",
    image: require("../../assets/images/b.png"),
  },
  {
    title: "View Your Financial Calendar",
    message: "See all your upcoming payments in one organized calendar view.",
    image: require("../../assets/images/c.png"),
  },
];

export default function LandingPage() {
  const { width, height } = useWindowDimensions();
  const [slide, setSlide] = useState(0);
  const swiper = useRef();
  const router = useRouter();

  const handleNext = () => {
    if (slide === slides.length - 1) {
      router.push("/login");
    } else {
      swiper.current.scrollBy(1);
    }
  };

  const handleSkip = () => router.push("/login");

  return (
    <SafeScreen>
      <Swiper
        ref={swiper}
        showsPagination={false}
        loop={false}
        onIndexChanged={setSlide}
      >
        {slides.map(({ title, message, image }, index) => (
          <View key={index} style={styles.slide}>
            <Image
              source={image}
              resizeMode="contain"
              style={{
                width: width * 0.9,
                height: height * 0.43, // un peu plus haut
                alignSelf: "center",
                marginTop: "12%",
              }}
            />
            <Text style={styles.slideTitle}>{title}</Text>
            <Text style={styles.slideText}>{message}</Text>

            {/* Navigation Section */}
            <View style={styles.navigation}>
              <TouchableOpacity onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>

              {/* Pagination */}
              <View style={styles.pagination}>
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === slide ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>
                  {slide === slides.length - 1 ? "Start" : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Swiper>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: "6%",
    paddingBottom: "10%",
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0d0d0d",
    textAlign: "center",
    marginTop: 30,
  },
  slideText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4b4b4b",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 15,
  },
  navigation: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  },
  skipText: {
    fontSize: 16,
    color: "#8e8e8e",
    fontWeight: "600",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  inactiveDot: {
    backgroundColor: "#d0d0d0",
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 24,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  nextButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});