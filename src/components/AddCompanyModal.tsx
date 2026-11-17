import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../theme/colors";
import { CustomButton, CustomDropdown, InputField } from "./common";

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
        <View style={styles.box}>
          <Text style={styles.title}>Add Company</Text>

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
            <TouchableOpacity style={[styles.btn, styles.outline]} onPress={onClose}>
              <Text style={[styles.btnTxt, { color: Colors.secondary }]}>Cancel</Text>
            </TouchableOpacity>
            <CustomButton title="Add" onPress={handleAdd} containerStyle={[styles.btn, { marginLeft: 12 }]} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddCompanyModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  box: { width: "88%", backgroundColor: "#fff", borderRadius: 14, padding: 16 },
  title: { fontSize: 16, fontWeight: "700", color: Colors.primaryText, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  btn: { flex: 1 },
  outline: {
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 28,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnTxt: { fontWeight: "700" },
});
