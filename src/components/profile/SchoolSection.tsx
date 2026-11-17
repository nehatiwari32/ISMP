import React from "react";
import { View, Text } from "react-native";
import { InputField } from "../index"; 
import { Typography } from "../../theme/typography";
import { styles as localStyles } from "../../screens/dashboard/profile/styles";

const SchoolSection: React.FC<any> = ({ values, handleChange, badgeComponent }) => {
  return (
    <View style={localStyles.sectionBox}>
      <View style={localStyles.sectionHeader}>
        <Text style={Typography.black16Bold}>School</Text>
        {badgeComponent ? badgeComponent : null}
      </View>


      <Text style={[Typography.black14Medium, localStyles.label]}>School Name</Text>
      <InputField placeholder="St. Peters School" value={values.schoolName} onChangeText={handleChange("schoolName")} />


      <View style={localStyles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={localStyles.smallLabel}>10th / SSLC</Text>
          <InputField placeholder="90%" value={values.sslcGrade} onChangeText={handleChange("sslcGrade")} />
        </View>


        <View style={{ flex: 1 }}>
          <Text style={localStyles.smallLabel}>Year of Passing</Text>
          <InputField placeholder="2013" value={values.sslcYear} onChangeText={handleChange("sslcYear")} keyboardType="number-pad" />
        </View>
      </View>


      <View style={localStyles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={localStyles.smallLabel}>12th / HSC</Text>
          <InputField placeholder="90%" value={values.hscGrade} onChangeText={handleChange("hscGrade")} />
        </View>


        <View style={{ flex: 1 }}>
          <Text style={localStyles.smallLabel}>Year of Passing</Text>
          <InputField placeholder="2015" value={values.hscYear} onChangeText={handleChange("hscYear")} keyboardType="number-pad" />
        </View>
      </View>
    </View>
  );
};


export default SchoolSection;