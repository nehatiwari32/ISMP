import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { styles as localStyles } from "../../screens/dashboard/profile/styles";

const BottomFixedActions: React.FC<{ onCancel?: () => void; onSave?: () => void }> = ({ onCancel, onSave }) => {
    return (
        <View style={localStyles.bottomFixed}>
            <TouchableOpacity style={localStyles.cancelBtn} onPress={onCancel}>
                <Text style={localStyles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={localStyles.saveBtn} onPress={onSave}>
                <Text style={localStyles.saveTxt}>Save Changes</Text>
            </TouchableOpacity>
        </View>
    );
};
export default BottomFixedActions;