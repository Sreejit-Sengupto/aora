import { View, Text, ImageBackground } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants";

const Bookmark = () => {
  return (
    <SafeAreaView className="h-full bg-primary justify-center items-center">
      <View>
        <Text className="text-xl text-gray-100 font-pmedium">
          Hold up! Coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Bookmark;
