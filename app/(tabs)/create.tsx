import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DiscoveryFormData, discoverySchema } from '@/schemas/discoverySchema';
import { ImageService } from '@/services/imageService';
import { LocationService } from '@/services/locationService';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { DiscoveryInput, LocationData } from '@/types/discovery';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_SIZE = (screenWidth - 64) / 3;

const discoveryTypes = [
  { value: 'book', label: 'Book', icon: 'book' },
  { value: 'music', label: 'Music', icon: 'music-note' },
  { value: 'movie', label: 'Movie', icon: 'movie' },
  { value: 'food', label: 'Food', icon: 'restaurant' },
  { value: 'drink', label: 'Drink', icon: 'local-cafe' },
  { value: 'place', label: 'Place', icon: 'place' },
  { value: 'product', label: 'Product', icon: 'inventory' },
];

const categories = [
  { value: 'liked_it', label: 'Liked It', color: '#4CAF50', icon: 'favorite' },
  { value: 'didnt_like_it', label: "Didn't Like It", color: '#F44336', icon: 'favorite-border' },
  { value: 'want_to_try', label: 'Want to Try', color: '#FF9800', icon: 'star' },
];

export default function CreateDiscoveryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { createDiscovery, isLoading, error } = useDiscoveryStore();
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<DiscoveryFormData>({
    resolver: zodResolver(discoverySchema),
    mode: 'onChange',
  });

  const watchedCategory = watch('category');
  const watchedType = watch('discovery_type');

  useEffect(() => {
    // Get location on component mount
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const location = await LocationService.getLocationWithName();
      setLocationData(location);
      setValue('location_lat', location.latitude);
      setValue('location_lng', location.longitude);
      setValue('location_name', location.name);
      setValue('location_source', location.source);
    } catch (error) {
      console.log('Location not available:', error);
    }
  };

  const handlePickImages = async () => {
    try {
      const images = await ImageService.pickImages();
      if (images.length > 0) {
        setSelectedImages(prev => [...prev, ...images]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await ImageService.takePhoto();
      if (photo) {
        setSelectedImages(prev => [...prev, photo]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: DiscoveryFormData) => {
    try {
      const discoveryInput: DiscoveryInput = {
        ...data,
        images: selectedImages,
        location_lat: locationData?.latitude,
        location_lng: locationData?.longitude,
        location_name: locationData?.name,
        location_source: locationData?.source,
      };

      await createDiscovery(discoveryInput);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create discovery');
    }
  };

  const renderImagePreview = () => {
    if (selectedImages.length === 0) {
      return (
        <View style={styles.imagePlaceholder}>
          <MaterialIcons
            name="photo"
            size={48}
            color={Colors[colorScheme ?? 'light'].tabIconDefault}
          />
          <Text style={[styles.placeholderText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            No images selected
          </Text>
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
        {selectedImages.map((image, index) => (
          <View key={index} style={styles.imagePreviewWrapper}>
            <Image
              source={{ uri: image instanceof File ? URL.createObjectURL(image) : image }}
              style={styles.imagePreview}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <MaterialIcons name="cancel" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={Colors[colorScheme ?? 'light'].text}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            New Discovery
          </Text>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isLoading}
            style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Photos
          </Text>
          {renderImagePreview()}
          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.imageActionButton} onPress={handleTakePhoto}>
              <MaterialIcons name="camera-alt" size={20} color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[styles.imageActionText, { color: Colors[colorScheme ?? 'light'].tint }]}>
                Camera
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageActionButton} onPress={handlePickImages}>
              <MaterialIcons name="photo-library" size={20} color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[styles.imageActionText, { color: Colors[colorScheme ?? 'light'].tint }]}>
                Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Notes (Optional)
          </Text>
          <Controller
            control={control}
            name="text_content"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: errors.text_content ? '#F44336' : '#E0E0E0',
                  },
                ]}
                placeholder="What did you discover?"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                multiline
                numberOfLines={4}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.text_content && (
            <Text style={styles.errorText}>{errors.text_content.message}</Text>
          )}
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            How did you feel about it?
          </Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryButton,
                      value === category.value && { backgroundColor: category.color },
                    ]}
                    onPress={() => onChange(category.value)}
                  >
                    <MaterialIcons
                      name={category.icon as any}
                      size={20}
                      color={value === category.value ? 'white' : category.color}
                    />
                    <Text
                      style={[
                        styles.categoryButtonText,
                        { color: value === category.value ? 'white' : category.color },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.category && (
            <Text style={styles.errorText}>{errors.category.message}</Text>
          )}
        </View>

        {/* Discovery Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Type (Optional)
          </Text>
          <Controller
            control={control}
            name="discovery_type"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={[
                  styles.typeSelector,
                  { 
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    borderColor: '#E0E0E0',
                  },
                ]}
                onPress={() => setShowTypePicker(true)}
              >
                {value ? (
                  <View style={styles.selectedType}>
                                         <MaterialIcons
                       name={discoveryTypes.find(t => t.value === value)?.icon as any || 'help'}
                       size={20}
                       color={Colors[colorScheme ?? 'light'].tint}
                     />
                    <Text style={[styles.selectedTypeText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {discoveryTypes.find(t => t.value === value)?.label}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.typePlaceholder, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                    Select type
                  </Text>
                )}
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={16}
                  color={Colors[colorScheme ?? 'light'].tabIconDefault}
                />
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Location */}
        {locationData && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Location
            </Text>
            <View style={[
              styles.locationContainer,
              { backgroundColor: Colors[colorScheme ?? 'light'].background },
            ]}>
              <MaterialIcons
                name="place"
                size={20}
                color={Colors[colorScheme ?? 'light'].tint}
              />
              <Text style={[styles.locationText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {locationData.name || `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`}
              </Text>
            </View>
          </View>
        )}

        {/* Validation Error */}
        {errors.root && (
          <View style={styles.section}>
            <Text style={styles.errorText}>{errors.root.message}</Text>
          </View>
        )}
      </ScrollView>

      {/* Type Picker Modal */}
      {showTypePicker && (
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: Colors[colorScheme ?? 'light'].background },
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Select Type
              </Text>
              <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={Colors[colorScheme ?? 'light'].text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {discoveryTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={styles.modalOption}
                  onPress={() => {
                    setValue('discovery_type', type.value);
                    setShowTypePicker(false);
                  }}
                >
                                     <MaterialIcons
                     name={type.icon as any}
                     size={24}
                     color={Colors[colorScheme ?? 'light'].tint}
                   />
                  <Text style={[styles.modalOptionText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  imagePlaceholder: {
    height: 120,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
  },
  imagePreviewContainer: {
    marginBottom: 12,
  },
  imagePreviewWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  imagePreview: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imageActionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  categoryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTypeText: {
    marginLeft: 8,
    fontSize: 16,
  },
  typePlaceholder: {
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  locationText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalOptionText: {
    marginLeft: 12,
    fontSize: 16,
  },
});
