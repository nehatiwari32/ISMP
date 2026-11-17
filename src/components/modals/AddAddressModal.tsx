import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { BlurView } from '@react-native-community/blur';

import { CustomDropdown, InputField, CommonModal } from '../common';
import { Colors } from '../../theme/colors';
import { Spacing, Typography } from '../../theme/typography';
import { addLocality, getStateCity } from '../../redux/slices/authSlice';
import { Images } from '../../assets/images';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AddAddressModal: React.FC<Props> = ({ visible, onClose }) => {
  const dispatch = useDispatch<any>();

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [locality, setLocality] = useState('');
  const [errors, setErrors] = useState<{ state?: string; district?: string }>({});
  const [loading, setLoading] = useState(false);
  const [stateOptions, setStateOptions] = useState<any[]>([]);
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);

  // CommonModal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

  useEffect(() => {
    fetchStates();
  }, [])

  const fetchStates = async () => {
    try {
      const res: any = await dispatch(getStateCity({ type: "state" })).unwrap();
      const opts = (res || []).map((i: any) => ({
        id: i.state_id,
        label: i.state_name,
        value: i.state_id,
      }));
      setStateOptions(opts);
    } catch (err) {
      console.log("Error fetching states:", err);
    }
  };

  /** 🔹 Handle state selection */
  const handleStateSelect = async (item: any) => {
    
    setSelectedState(item?.value);
    setSelectedDistrict('');
    setErrors((prev) => ({ ...prev, state: undefined }));
    try {
      const res: any = await dispatch(getStateCity({ search: item?.label })).unwrap();
      const opts = (res || []).map((i: any) => ({
        id: i.district_id,
        label: i.district_name,
        value: i.district_id,
      }));
      setDistrictOptions(opts);
    } catch (err) {
      console.log("Error fetching states:", err);
    }
  };

  /** 🔹 Handle save */
  const handleSave = async () => {
    let newErrors: { state?: string; district?: string } = {};

    if (!selectedState) newErrors.state = 'Please select a state';
    if (!selectedDistrict) newErrors.district = 'Please select a district';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const payload =
      {
        pincode: pincode,
        state: selectedState,
        district: selectedDistrict,
        locality_name: locality,
      }

      const response = await dispatch(addLocality(payload)).unwrap();
      if (response?.statusCode === 200 || response?.statusCode === '200') {
        setModalMsg(
          'Your request to add this locality has been sent to Admin for approval. You’ll be notified once it is reviewed.'
        );
        setModalVisible(true);
      } else {
        setModalMsg('Something went wrong. Please try again.');
        setModalVisible(true);
      }
    } catch (error: any) {
      console.log('❌ Error adding locality:', error);
      setModalMsg(error?.message || 'Failed to add locality. Please try again.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setModalVisible(false);
    onClose();
    resetAllFields();
  };

  const resetAllFields = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setPincode('');
    setLocality('')
    setErrors({});
  };

  const handleCancel = () => {
    resetAllFields();
    onClose();
  };

  return (
    <>
      {/* 🔹 Main Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurAmount={2}
            blurType="dark"
            reducedTransparencyFallbackColor="black"
          />
          <View style={styles.box}>
            <Text style={[Typography.black14Bold, { marginBottom: 10 }]}>Add Your Locality / Pincode</Text>

            {/* ✅ State Dropdown */}
            <CustomDropdown
              placeholder="Select State"
              data={stateOptions}
              searchable={true}
              selectedValue={selectedState}
              onSelect={(item: any) => handleStateSelect(item)}
              containerStyle={{ marinBottom: 0 }}
              error={errors.state && errors.state}
            />

            {/* ✅ District Dropdown */}
            <CustomDropdown
              placeholder="Select District"
              searchable={true}
              data={districtOptions}
              selectedValue={selectedDistrict}
              onSelect={(item: any) => {
                setSelectedDistrict(item.value);
                setErrors((prev) => ({ ...prev, district: undefined }));
              }}
              disabled={!selectedState}
              containerStyle={{ marinBottom: 6 }}
              error={errors.district && errors.district}
            />

            {/* ✅ Pincode / Locality Input */}
            <InputField
              placeholder="Enter Locality"
              value={locality}
              onChangeText={setLocality}
              containerStyle={{ marinBottom: 6 }}
            />

            <InputField
              placeholder="Enter Pincode"
              value={pincode}
              onChangeText={setPincode}
              containerStyle={{ marinBottom: 6 }}
              maxLength={6}
              keyboardType="number-pad"
            />

            {/* ✅ Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  {
                    backgroundColor: '#fff',
                    borderWidth: 1,
                    borderColor: Colors.primary,
                  },
                ]}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={[styles.btnText, { color: Colors.primary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btn}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🔹 CommonModal after API response */}
      <CommonModal
        visible={modalVisible}
        image={Images.location}
        title="Request Sent to Admin"
        body={modalMsg}
        btnTitle="Continue"
        onConfirm={handleConfirm}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default AddAddressModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: Spacing.modalBorderRadius,
    padding: 16,
  },

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 2,
  },
  btn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnText: {
    ...Typography.black14Medium,
    color: '#fff',
  },
});
