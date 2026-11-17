import React, { useState } from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { BlurView } from "@react-native-community/blur";

import { CustomButton, CustomDropdown, InputField } from "../common";
import { Colors } from "../../theme/colors";
import { Spacing, Typography } from "../../theme/typography";

type Item = { id: string | number; label: string; value: string | number };

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (payload: { state?: string | number; district?: string | number; name: string }) => void;
  stateOptions: Item[];
  districtOptions: Item[];
}

const AddCompanyModal: React.FC<Props> = ({
  visible,
  onClose,
  onAdd,
  stateOptions,
  districtOptions,
}) => {
  const [state, setState] = useState<string | number>("");
  const [district, setDistrict] = useState<string | number>("");
  const [name, setName] = useState("");

  const handleAdd = () => onAdd({ state, district, name });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurAmount={2}
          blurType="dark"
          reducedTransparencyFallbackColor="black"
        />
        <View style={styles.box}>
          <Text style={[Typography.black14Bold, { marginBottom: 10}]}>Add Company</Text>

          <CustomDropdown
            placeholder="Select State"
            data={stateOptions}
            selectedValue={state}
            onSelect={(item: any) => setState(item.value)}
          />

          <CustomDropdown
            placeholder="Select District"
            data={districtOptions}
            selectedValue={district}
            onSelect={(item: any) => setDistrict(item.value)}
          />

          <InputField placeholder="Add company name" value={name} onChangeText={setName} />

          <View style={styles.row}>
            <CustomButton
              title="Cancel"
              onPress={onClose}
              buttonStyle={{ width: '49%', backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.primary }}
              textColor={Colors.primary}
            />
            <CustomButton title="Add" onPress={handleAdd} buttonStyle={{ width: '49%' }} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddCompanyModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  box: { width: "88%", backgroundColor: "#fff", borderRadius: Spacing.modalBorderRadius, padding: 16 },
  title: { fontSize: 16, fontWeight: "700", color: Colors.primaryText, marginBottom: 10 },
  row: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 8 },

});
