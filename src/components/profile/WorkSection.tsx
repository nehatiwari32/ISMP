import React from "react";
import { View, Text } from "react-native";
import { CustomDropdown, InputField } from "../index";
import { Typography } from "../../theme/typography";
import { styles as localStyles } from "../../screens/dashboard/profile/styles";

const stateOptions = [
  { id: "mh", label: "Maharashtra", value: "mh" },
  { id: "dl", label: "Delhi", value: "dl" },
];

const districtOptions = [
  { id: "pune", label: "Pune", value: "pune" },
  { id: "mumbai", label: "Mumbai", value: "mumbai" },
];

const WorkSection: React.FC<any> = ({ values, handleChange, setFieldValue, badgeComponent }) => {
  return (
    <View style={localStyles.sectionBox}>
      <View style={localStyles.sectionHeader}>
        <Text style={Typography.black16Bold}>Work</Text>
        {badgeComponent ? badgeComponent : null}

      </View>

      <Text style={[Typography.black14Medium, localStyles.label]}>Position</Text>
      <InputField placeholder="Enter your Designation" value={values.position} onChangeText={handleChange("position")} />

      <Text style={[Typography.black14Medium, localStyles.label]}>Company Name</Text>
      <InputField placeholder="Demo Pvt Ltd" value={values.companyName} onChangeText={handleChange("companyName")} />

      <View style={localStyles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={localStyles.smallLabel}>State</Text>
          <CustomDropdown
            placeholder="Select State"
            data={stateOptions}
            selectedValue={values.companyState}
            onSelect={(item: any) => {
              setFieldValue("companyState", item.value);
              setFieldValue("companyDistrict", "");
            }}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={localStyles.smallLabel}>District</Text>
          <CustomDropdown
            placeholder="Select District"
            data={districtOptions}
            selectedValue={values.companyDistrict}
            onSelect={(item: any) => setFieldValue("companyDistrict", item.value)}
          />
        </View>
      </View>

      <Text style={[Typography.black14Medium, localStyles.label]}>Joining Date</Text>
      <InputField placeholder="Enter Year" value={values.joiningDate} onChangeText={handleChange("joiningDate")} keyboardType="number-pad" />

      <View style={localStyles.rowBetween}>
        <Text style={localStyles.addMore}>＋ Add More</Text>
        <Text style={localStyles.addMore}>＋ Add Company</Text>
      </View>
    </View>
  );
};

export default WorkSection;