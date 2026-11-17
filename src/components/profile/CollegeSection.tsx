import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { FieldArray } from "formik";
import { CustomDropdown, InputField } from "../index";
import { Typography } from "../../theme/typography";
import { styles as localStyles } from "../../screens/dashboard/profile/styles";
import { Icons } from "../../assets/icons";

const degreeOptions = [
  { id: "btech", label: "B.Tech", value: "btech" },
  { id: "be", label: "B.E.", value: "be" },
  { id: "mba", label: "MBA", value: "mba" },
];

const CollegeSection: React.FC<any> = ({ values, handleChange, setFieldValue, badgeComponent }) => {
  return (
    <View style={localStyles.sectionBox}>
      <View style={localStyles.sectionHeader}>
        <Text style={Typography.black16Bold}>College</Text>
        {badgeComponent ? badgeComponent : null}
      </View>

      <FieldArray name="college">
        {({ push, remove }) => (
          <>
            {values?.college?.map((row: any, index: number) => (
              <View key={index} style={localStyles.block}>
                <Text style={[Typography.black14Medium, localStyles.label]}>Degree</Text>
                <CustomDropdown
                  placeholder="Select Degree"
                  data={degreeOptions}
                  selectedValue={row.degree}
                  onSelect={(item: any) => setFieldValue(`college[${index}].degree`, item.value)}
                />

                <Text style={[Typography.black14Medium, localStyles.label]}>College Name</Text>
                <InputField
                  placeholder="St."
                  value={row.collegeName}
                  onChangeText={handleChange(`college[${index}].collegeName`)}
                />

                <Text style={[Typography.black14Medium, localStyles.label]}>Year of Passing</Text>
                <InputField
                  placeholder="Enter Year"
                  value={row.passingYear}
                  onChangeText={handleChange(`college[${index}].passingYear`)}
                  keyboardType="number-pad"
                />

                {/* Show cross only for index > 0 */}
                {index > 0 && (
                  <TouchableOpacity style={localStyles.crossWrap} onPress={() => remove(index)}>
                    <Image source={Icons.cross} style={localStyles.crossIcon} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={localStyles.rowBetween}>
              <TouchableOpacity onPress={() => push({ degree: "", collegeName: "", passingYear: "" })}>
                <Text style={localStyles.addMore}>＋ Add More</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => console.log("open add institute modal")}>
                <Text style={localStyles.addMore}>＋ Add Institution</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </FieldArray>
    </View>
  );
};

export default CollegeSection;