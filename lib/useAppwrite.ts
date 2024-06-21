import React from "react";
import { Models } from "react-native-appwrite";
import { Alert } from "react-native";

const useAppwrite = (fn: () => any) => {
  const [data, setData] = React.useState<Models.Document[] | null | undefined>(
    null
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fn();
      setData(response);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => fetchData();

  return { data, isLoading, refetch };
};

export default useAppwrite;
